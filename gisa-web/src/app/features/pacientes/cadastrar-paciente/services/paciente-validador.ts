import { Injectable } from '@angular/core';
import { soDigitos, vazio, cpfValido } from '../../../../shared/utils/texto.util';
import { ComErros } from '../../../../shared/components/com-erros';
import { ContatoForm, EnderecoForm, FormulariosPaciente, ResponsavelItem, listaErros } from '../models/formularios-paciente';
import { enderecoVazio, mesmoEnderecoForm } from '../../paciente-form.util';
import { dataFutura } from '../../../../shared/utils/data.util';

const OBRIGATORIO = 'Campo obrigatório.';

type Marcar = (alvo: ComErros, campo: string, mensagem?: string) => void;

export interface ResultadoValidacao {
  valido: boolean;
}

export interface ResultadoValidacaoResponsavel {
  valido: boolean;
  erros: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class PacienteValidadorService {

  // Endereço do paciente é obrigatório (RF11): a lista exige ao menos um.
  validar(f: FormulariosPaciente): ResultadoValidacao {
    let valido = true;
    const marcar: Marcar = (alvo, campo, mensagem = OBRIGATORIO) => {
      alvo.erros[campo] = mensagem;
      valido = false;
    };

    listaErros(f).forEach((bloco) => (bloco.erros = {}));

    if (!f.enderecos.validar()) valido = false;

    this.validarDadosPessoais(f, marcar);
    this.validarEscola(f, marcar);
    this.validarResponsaveis(f, marcar);
    this.validarResidencia(f, marcar);

    return { valido };
  }

  // Valida um responsável ao confirmar o cartão (antes de entrar na lista).
  validarResponsavel(
    r: ResponsavelItem,
    contato: ContatoForm | undefined,
    lista: ResponsavelItem[],
    indexEdicao: number | null,
    enderecosPaciente: EnderecoForm[] = []
  ): ResultadoValidacaoResponsavel {
    const erros: Record<string, string> = {};

    if (vazio(r.nome)) erros['nome'] = OBRIGATORIO;

    const cpf = soDigitos(r.cpf);
    if (!cpf) erros['cpf'] = OBRIGATORIO;
    else if (cpf.length !== 11) erros['cpf'] = 'O CPF deve ter 11 dígitos.';
    else if (!cpfValido(cpf)) erros['cpf'] = 'CPF inválido.';
    else if (lista.some((x, i) => i !== indexEdicao && soDigitos(x.cpf) === cpf)) {
      erros['cpf'] = 'Este CPF já foi adicionado como responsável.';
    }

    if (vazio(r.dataNascimento)) erros['dataNascimento'] = OBRIGATORIO;
    else if (dataFutura(r.dataNascimento)) erros['dataNascimento'] = 'A data de nascimento não pode ser no futuro.';

    if (vazio(r.sexo)) erros['sexo'] = OBRIGATORIO;
    if (vazio(r.estadoCivil)) erros['estadoCivil'] = OBRIGATORIO;
    if (vazio(r.grauParentesco)) erros['grauParentesco'] = OBRIGATORIO;

    const celular = soDigitos(r.celular);
    if (celular && (celular.length < 10 || celular.length > 11)) {
      erros['celular'] = 'Celular inválido. Use DDD + número.';
    }

    let valido = Object.keys(erros).length === 0;

    if (r.naoResideComPaciente && contato) {
      contato.erros = {};
      const marcar: Marcar = (alvo, campo, mensagem = OBRIGATORIO) => {
        alvo.erros[campo] = mensagem;
        valido = false;
      };
      if (r.enderecoCadastro && enderecoVazio(contato)) {
        marcar(contato, 'cep', 'O endereço não pode ser removido, apenas alterado.');
      }
      this.validarEnderecoOpcional(contato, marcar);
    }

    // Dividir o endereço com o paciente é residir (D1): a API recusaria.
    if (r.naoResideComPaciente) {
      const proprio = r.reaproveitado && r.enderecoCadastro ? r.enderecoCadastro : contato;
      if (proprio && !enderecoVazio(proprio) && enderecosPaciente.some((e) => mesmoEnderecoForm(e, proprio))) {
        erros['residencia'] = "Este é um endereço do paciente. Para morar nele, desmarque 'não reside'.";
        valido = false;
      }
    }

    return { valido, erros };
  }

  // Endereço é opcional; se começar a preencher, exige completo.
  validarEnderecoOpcional(c: ContatoForm, marcar: Marcar) {
    if (enderecoVazio(c)) return;
    const cep = soDigitos(c.cep);
    if (!cep) marcar(c, 'cep');
    else if (cep.length !== 8) marcar(c, 'cep', 'O CEP deve ter 8 dígitos.');

    if (vazio(c.endereco)) marcar(c, 'endereco');
    if (vazio(c.numero)) marcar(c, 'numero');
    if (vazio(c.bairro)) marcar(c, 'bairro');
    if (vazio(c.cidade)) marcar(c, 'cidade');
    if (vazio(c.uf)) marcar(c, 'uf');
  }

  private validarDadosPessoais(f: FormulariosPaciente, marcar: Marcar) {
    const dp = f.dadosPessoais;

    if (vazio(dp.nome)) marcar(dp, 'nome');

    const cpf = soDigitos(dp.cpf);
    if (!cpf) marcar(dp, 'cpf');
    else if (cpf.length !== 11) marcar(dp, 'cpf', 'O CPF deve ter 11 dígitos.');
    else if (!cpfValido(cpf)) marcar(dp, 'cpf', 'CPF inválido.');

    if (vazio(dp.dataNascimento)) marcar(dp, 'dataNascimento');
    else if (dataFutura(dp.dataNascimento)) marcar(dp, 'dataNascimento', 'A data de nascimento não pode ser no futuro.');

    if (vazio(dp.sexo)) marcar(dp, 'sexo');
    if (vazio(dp.estadoCivil)) marcar(dp, 'estadoCivil');

    // Celular é opcional para o paciente; se preenchido, precisa ser válido.
    const celular = soDigitos(dp.celular);
    if (celular && (celular.length < 10 || celular.length > 11)) {
      marcar(dp, 'celular', 'Celular inválido. Use DDD + número.');
    }
  }

  // Escola nova (digitada e não escolhida na lista) precisa do tipo.
  private validarEscola(f: FormulariosPaciente, marcar: Marcar) {
    const ie = f.infoEscola;
    if (!vazio(ie.nome) && !ie.escolaSelecionada && vazio(ie.tipoEscola)) {
      marcar(ie, 'tipoEscola');
    }
  }

  // Com 2 ou mais endereços, cada responsável que reside escolhe onde mora ("Quem mora aqui").
  private validarResidencia(f: FormulariosPaciente, marcar: Marcar) {
    const itens = f.enderecos.itens;
    if (itens.length < 2) return;
    const semEndereco = f.infoResponsavel.listaResponsaveis.filter(
      (r) => !r.naoResideComPaciente && !itens.some((e) => r.residencia.includes(e.chave))
    );
    if (!semEndereco.length) return;
    const texto = `Marque em qual endereço mora: ${semEndereco.map((r) => r.nome.trim()).join(', ')}.`;
    const atual = f.enderecos.erros['enderecos'];
    marcar(f.enderecos, 'enderecos', atual ? `${atual} ${texto}` : texto);
  }

  private validarResponsaveis(f: FormulariosPaciente, marcar: Marcar) {
    const ir = f.infoResponsavel;

    if (ir.exibindoFormulario) {
      marcar(ir, 'responsaveis', 'Confirme ou cancele o responsável que está sendo preenchido.');
      return;
    }
    if (ir.listaResponsaveis.length === 0) {
      marcar(ir, 'responsaveis', 'Informe ao menos um responsável.');
      return;
    }

    const cpfPaciente = soDigitos(f.dadosPessoais.cpf);
    if (cpfPaciente.length === 11 && ir.listaResponsaveis.some((r) => soDigitos(r.cpf) === cpfPaciente)) {
      marcar(ir, 'responsaveis', 'O CPF do paciente não pode ser o mesmo de um responsável.');
    }
  }
}

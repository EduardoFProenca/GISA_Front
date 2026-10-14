import { Injectable } from '@angular/core';
import { soDigitos, vazio } from '../../../../shared/utils/texto.util';
import { ComErros } from '../../../../shared/components/com-erros';
import { ContatoForm, FormulariosPaciente, ResponsavelItem, listaErros } from '../models/formularios-paciente';
import { mesmoEnderecoForm } from '../../paciente-form.util';

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

  validar(f: FormulariosPaciente): ResultadoValidacao {
    let valido = true;
    const marcar: Marcar = (alvo, campo, mensagem = OBRIGATORIO) => {
      alvo.erros[campo] = mensagem;
      valido = false;
    };

    listaErros(f).forEach((bloco) => (bloco.erros = {}));

    this.validarDadosPessoais(f, marcar);
    this.validarEndereco(f.contato, marcar);
    this.validarEscola(f, marcar);
    this.validarResponsaveis(f, marcar);

    return { valido };
  }

  // Valida um responsável ao confirmar o cartão (antes de entrar na lista).
  validarResponsavel(
    r: ResponsavelItem,
    contato: ContatoForm | undefined,
    lista: ResponsavelItem[],
    indexEdicao: number | null
  ): ResultadoValidacaoResponsavel {
    const erros: Record<string, string> = {};

    if (vazio(r.nome)) erros['nome'] = OBRIGATORIO;

    const cpf = soDigitos(r.cpf);
    if (!cpf) erros['cpf'] = OBRIGATORIO;
    else if (cpf.length !== 11) erros['cpf'] = 'O CPF deve ter 11 dígitos.';
    else if (lista.some((x, i) => i !== indexEdicao && soDigitos(x.cpf) === cpf)) {
      erros['cpf'] = 'Este CPF já foi adicionado como responsável.';
    }

    if (vazio(r.dataNascimento)) erros['dataNascimento'] = OBRIGATORIO;
    else if (this.dataFutura(r.dataNascimento)) erros['dataNascimento'] = 'Data de nascimento inválida.';

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
      this.validarEndereco(contato, (alvo, campo, mensagem = OBRIGATORIO) => {
        alvo.erros[campo] = mensagem;
        valido = false;
      });
    }

    return { valido, erros };
  }

  validarEndereco(c: ContatoForm, marcar: Marcar) {
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

    if (vazio(dp.dataNascimento)) marcar(dp, 'dataNascimento');
    else if (this.dataFutura(dp.dataNascimento)) marcar(dp, 'dataNascimento', 'Data de nascimento inválida.');

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

    // Responsável já cadastrado que reside com o paciente precisa ter o mesmo endereço dele
    // (o endereço do paciente pode ter sido mudado depois de o responsável ser adicionado).
    const emOutroEndereco = ir.listaResponsaveis.filter(
      (r) => r.reaproveitado && !r.naoResideComPaciente && r.enderecoCadastro && !mesmoEnderecoForm(r.enderecoCadastro, f.contato)
    );
    if (emOutroEndereco.length) {
      const nomes = emOutroEndereco.map((r) => r.nome.trim()).join(', ');
      marcar(ir, 'responsaveis',
        `O endereço do paciente é diferente do de ${nomes}, que reside com ele. ` +
        'Use o mesmo endereço ou marque que o responsável não reside com o paciente.');
    }
  }

  private dataFutura(valor: string): boolean {
    const d = new Date(valor + 'T00:00:00');
    return !isNaN(d.getTime()) && d.getTime() > Date.now();
  }
}

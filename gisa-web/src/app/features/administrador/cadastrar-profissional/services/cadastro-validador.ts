import { Injectable } from '@angular/core';
import { soDigitos, vazio, emailValido } from '../../../../shared/utils/texto.util';
import { ComErros } from '../../../../shared/components/com-erros';
import { FormulariosCadastro, JornadaForm, listaErros } from '../models/formularios-cadastro';

const OBRIGATORIO = 'Campo obrigatório.';

export interface ResultadoValidacao {
  valido: boolean;
}

@Injectable({ providedIn: 'root' })
export class CadastroValidadorService {

  validar(f: FormulariosCadastro): ResultadoValidacao {
    let valido = true;
    const marcar = (alvo: ComErros, campo: string, mensagem: string = OBRIGATORIO) => {
      alvo.erros[campo] = mensagem;
      valido = false;
    };

    listaErros(f).forEach((bloco) => (bloco.erros = {}));

    this.validarDadosPessoais(f, marcar);
    this.validarContato(f, marcar);
    this.validarInfoProfissional(f, marcar);
    this.validarInfoUsuario(f, marcar);
    this.validarInfoEspecialista(f, marcar);

    return { valido };
  }

  jornadasCompletas(f: FormulariosCadastro): JornadaForm[] {
    return f.infoEspecialista.jornadas.filter((j) => j.diaSemana && j.horaInicio && j.horaTermino);
  }

  private validarDadosPessoais(f: FormulariosCadastro, marcar: (a: ComErros, c: string, m?: string) => void) {
    const dp = f.dadosPessoais;

    if (vazio(dp.nome)) marcar(dp, 'nome');

    const cpf = soDigitos(dp.cpf);
    if (!cpf) marcar(dp, 'cpf');
    else if (cpf.length !== 11) marcar(dp, 'cpf', 'O CPF deve ter 11 dígitos.');

    if (vazio(dp.dataNascimento)) marcar(dp, 'dataNascimento');
    if (vazio(dp.sexo)) marcar(dp, 'sexo');
    if (vazio(dp.estadoCivil)) marcar(dp, 'estadoCivil');

    const celular = soDigitos(dp.celular);
    if (!celular) marcar(dp, 'celular');
    else if (celular.length < 10 || celular.length > 11) {
      marcar(dp, 'celular', 'Celular inválido. Use DDD + número.');
    }

    if (vazio(dp.email)) marcar(dp, 'email');
    else if (!emailValido(dp.email)) marcar(dp, 'email', 'E-mail inválido.');
  }

  private validarContato(f: FormulariosCadastro, marcar: (a: ComErros, c: string, m?: string) => void) {
    const c = f.contato;

    const cep = soDigitos(c.cep);
    if (!cep) marcar(c, 'cep');
    else if (cep.length !== 8) marcar(c, 'cep', 'O CEP deve ter 8 dígitos.');

    if (vazio(c.endereco)) marcar(c, 'endereco');
    if (vazio(c.numero)) marcar(c, 'numero');
    if (vazio(c.bairro)) marcar(c, 'bairro');
    if (vazio(c.cidade)) marcar(c, 'cidade');
    if (vazio(c.uf)) marcar(c, 'uf');
  }

  private validarInfoProfissional(f: FormulariosCadastro, marcar: (a: ComErros, c: string, m?: string) => void) {
    if (vazio(f.infoProfissional.cargo)) marcar(f.infoProfissional, 'cargo');
  }

  private validarInfoUsuario(f: FormulariosCadastro, marcar: (a: ComErros, c: string, m?: string) => void) {
    const iu = f.infoUsuario;
    if (!iu.temAcessoSistema) return;

    if (vazio(iu.senha)) marcar(iu, 'senha');
    else if (iu.senha.length < 8 || iu.senha.length > 30) {
      marcar(iu, 'senha', 'A senha deve ter entre 8 e 30 caracteres.');
    }
    if (vazio(iu.perfil)) marcar(iu, 'perfil');
  }

  private validarInfoEspecialista(f: FormulariosCadastro, marcar: (a: ComErros, c: string, m?: string) => void) {
    const ie = f.infoEspecialista;
    if (!ie.ehEspecialista) return;

    if (vazio(ie.registroProfissional)) marcar(ie, 'registroProfissional');

    if (!ie.especialidades.some((e) => !vazio(e))) {
      marcar(ie, 'especialidades', 'Selecione ao menos uma especialidade.');
    }

    if (this.jornadasCompletas(f).length === 0) {
      marcar(ie, 'jornadas', 'Informe ao menos um horário completo (dia, início e término).');
    }

    if (ie.atuaComoPJ) {
      const cnpj = soDigitos(ie.cnpj);
      if (!cnpj) marcar(ie, 'cnpj');
      else if (cnpj.length !== 14) marcar(ie, 'cnpj', 'O CNPJ deve ter 14 dígitos.');
      if (vazio(ie.razaoSocial)) marcar(ie, 'razaoSocial');
    }
  }
}
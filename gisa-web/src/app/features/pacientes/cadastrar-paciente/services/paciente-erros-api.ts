import { Injectable } from '@angular/core';
import { ComErros } from '../../../../shared/components/com-erros';
import {
  aplicarErrosApi,
  campoDaChave,
  MSG_CORRIJA_CAMPOS,
  ResultadoErroApi,
} from '../../../../core/http/erro-api';
import { FormulariosPaciente, InfoEscolaForm } from '../models/formularios-paciente';

// Mapeia os erros da API para os campos do cadastro/edição de paciente.
@Injectable({ providedIn: 'root' })
export class PacienteErrosApiService {

  tratar(err: unknown, f: FormulariosPaciente): ResultadoErroApi {
    return aplicarErrosApi(err, (chave, mensagem) => this.marcarCampo(chave, mensagem, f), {
      padrao: 'Erro ao salvar cadastro.',
      marcarPorMensagem: (mensagem) => this.marcarPorMensagem(mensagem, f),
    });
  }

  // Erros do POST /escolas (feito antes do cadastro do paciente).
  tratarEscola(err: unknown, ie: InfoEscolaForm): string {
    const r = aplicarErrosApi(
      err,
      (chave, mensagem) => {
        if (chave !== 'nome' && chave !== 'tipoEscola') return false;
        ie.erros[chave] = mensagem;
        return true;
      },
      { padrao: 'Não foi possível cadastrar a escola.' }
    );
    return r.algumCampoMarcado ? MSG_CORRIJA_CAMPOS : r.mensagemGeral;
  }

  private marcarCampo(chave: string, mensagem: string, f: FormulariosPaciente): boolean {
    // responsaveis, responsaveis[0].cpf, responsaveis[1].enderecos[0].cep ...
    const resp = chave.match(/^responsaveis(?:\[(\d+)\])?/);
    if (resp) {
      const prefixo = resp[1] !== undefined ? `Responsável ${Number(resp[1]) + 1}: ` : '';
      this.acrescentar(f.infoResponsavel, 'responsaveis', prefixo + mensagem);
      return true;
    }

    if (/^(codigosCid|novosCids)/.test(chave)) {
      this.acrescentar(f.infoCid, 'cids', mensagem);
      return true;
    }

    if (chave.startsWith('prontuario')) {
      f.infoProntuario.erros['prontuario'] = mensagem;
      return true;
    }

    if (chave === 'idEscola') {
      f.infoEscola.erros['escola'] = mensagem;
      return true;
    }

    if (chave.startsWith('enderecos')) {
      const mapaEndereco: Record<string, string> = {
        cep: 'cep', rua: 'endereco', numero: 'numero', bairro: 'bairro', cidade: 'cidade', estado: 'uf',
      };
      f.contato.erros[mapaEndereco[campoDaChave(chave)] ?? 'cep'] = mensagem;
      return true;
    }

    const camposPessoa = ['nome', 'cpf', 'dataNascimento', 'sexo', 'estadoCivil', 'celular', 'numCNS'];
    if (camposPessoa.includes(chave)) {
      f.dadosPessoais.erros[chave] = mensagem;
      return true;
    }

    return false;
  }

  // Regras de negócio chegam só em `message` (ver PACIENTES.md, "Regras de negócio").
  private marcarPorMensagem(mensagem: string, f: FormulariosPaciente): boolean {
    if (/^CPF já cadastrado/i.test(mensagem)) {
      f.dadosPessoais.erros['cpf'] = mensagem;
      return true;
    }
    if (/CID\(s\)/i.test(mensagem)) {
      this.acrescentar(f.infoCid, 'cids', mensagem);
      return true;
    }
    if (/Escola não encontrada/i.test(mensagem)) {
      f.infoEscola.erros['escola'] = mensagem;
      return true;
    }
    if (/respons[aá]vel/i.test(mensagem)) {
      this.acrescentar(f.infoResponsavel, 'responsaveis', mensagem);
      return true;
    }
    return false;
  }

  private acrescentar(alvo: ComErros, campo: string, texto: string) {
    alvo.erros[campo] = alvo.erros[campo] ? `${alvo.erros[campo]} ${texto}` : texto;
  }
}

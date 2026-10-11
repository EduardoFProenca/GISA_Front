import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ComErros } from '../../../../shared/components/com-erros';
import { FormulariosPaciente, InfoEscolaForm } from '../models/formularios-paciente';

export interface ResultadoErroApi {
  mensagemGeral: string;
  algumCampoMarcado: boolean;
}

@Injectable({ providedIn: 'root' })
export class PacienteErrosApiService {

  tratar(err: HttpErrorResponse, f: FormulariosPaciente): ResultadoErroApi {
    const semRede = this.erroGeral(err);
    if (semRede) return { mensagemGeral: semRede, algumCampoMarcado: false };

    const campos: Record<string, string> = err.error?.fields ?? {};
    const semDestino: string[] = [];
    let mapeados = 0;

    for (const [chave, mensagem] of Object.entries(campos)) {
      if (this.marcarCampo(chave, mensagem, f)) mapeados++;
      else semDestino.push(mensagem);
    }

    const mensagemRegra: string = err.error?.message ?? '';
    if (mapeados === 0 && mensagemRegra && this.marcarPorMensagem(mensagemRegra, f)) mapeados++;

    let mensagemGeral = mensagemRegra || 'Erro ao salvar cadastro.';
    if (mapeados > 0) mensagemGeral = 'Corrija os campos destacados em vermelho.';
    if (semDestino.length) mensagemGeral += ' ' + semDestino.join(' ');

    return { mensagemGeral, algumCampoMarcado: mapeados > 0 };
  }

  // Erros do POST /escolas (feito antes do cadastro do paciente).
  tratarEscola(err: HttpErrorResponse, ie: InfoEscolaForm): string {
    const semRede = this.erroGeral(err);
    if (semRede) return semRede;

    const campos: Record<string, string> = err.error?.fields ?? {};
    let marcou = false;
    if (campos['nome']) { ie.erros['nome'] = campos['nome']; marcou = true; }
    if (campos['tipoEscola']) { ie.erros['tipoEscola'] = campos['tipoEscola']; marcou = true; }

    return marcou
      ? 'Corrija os campos destacados em vermelho.'
      : (err.error?.message || 'Não foi possível cadastrar a escola.');
  }

  private erroGeral(err: HttpErrorResponse): string | null {
    if (err.status === 0) return 'Não foi possível conectar ao servidor. Tente novamente.';
    if (err.status === 401 || err.status === 403) return 'Sua sessão expirou. Faça login novamente.';
    return null;
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
      const k = chave.split('.').pop()!.replace(/\[\d+\]/g, '');
      const mapaEndereco: Record<string, string> = {
        cep: 'cep', rua: 'endereco', numero: 'numero', bairro: 'bairro', cidade: 'cidade', estado: 'uf',
      };
      f.contato.erros[mapaEndereco[k] ?? 'cep'] = mensagem;
      return true;
    }

    const dp = f.dadosPessoais;
    const camposPessoa = ['nome', 'cpf', 'dataNascimento', 'sexo', 'estadoCivil', 'celular', 'numCNS'];
    if (camposPessoa.includes(chave)) {
      dp.erros[chave] = mensagem;
      return true;
    }

    return false;
  }

  // Regras de negócio chegam só em `message` (sem `fields`).
  private marcarPorMensagem(mensagem: string, f: FormulariosPaciente): boolean {
    if (/^Já existe uma pessoa/i.test(mensagem)) {
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

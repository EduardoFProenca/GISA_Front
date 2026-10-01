import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ComErros } from '../../../../shared/components/com-erros';
import { FormulariosCadastro } from '../models/formularios-cadastro';

export interface ResultadoErroApi {
  mensagemGeral: string;
  algumCampoMarcado: boolean;
}

@Injectable({ providedIn: 'root' })
export class CadastroErrosApiService {

  tratar(err: HttpErrorResponse, f: FormulariosCadastro): ResultadoErroApi {
    if (err.status === 0) {
      return { mensagemGeral: 'Não foi possível conectar ao servidor. Tente novamente.', algumCampoMarcado: false };
    }

    const campos: Record<string, string> = err.error?.fields ?? {};
    const semDestino: string[] = [];
    let mapeados = 0;

    for (const [chave, mensagem] of Object.entries(campos)) {
      const destino = this.destinoCampo(chave, f);
      if (destino) {
        destino[0].erros[destino[1]] = mensagem;
        mapeados++;
      } else {
        semDestino.push(mensagem);
      }
    }

    let mensagemGeral = err.error?.message || 'Erro ao salvar cadastro.';
    if (mapeados > 0) {
      mensagemGeral =
        err.status === 409
          ? 'Alguns dados já existem no sistema. Corrija os campos destacados em vermelho.'
          : 'Corrija os campos destacados em vermelho.';
    }
    if (semDestino.length) mensagemGeral += ' ' + semDestino.join(' ');

    return { mensagemGeral, algumCampoMarcado: mapeados > 0 };
  }

  private destinoCampo(chave: string, f: FormulariosCadastro): [ComErros, string] | null {
    const k = chave.split('.').pop()!.replace(/\[\d+\]/g, '');
    const { dadosPessoais: dp, contato: c, infoProfissional: ip, infoUsuario: iu, infoEspecialista: ie } = f;

    const mapa: Record<string, [ComErros, string]> = {
      nome: [dp, 'nome'],
      cpf: [dp, 'cpf'],
      email: [dp, 'email'],
      dataNascimento: [dp, 'dataNascimento'],
      sexo: [dp, 'sexo'],
      celular: [dp, 'celular'],
      estadoCivil: [dp, 'estadoCivil'],
      numCNS: [dp, 'numCNS'],
      cep: [c, 'cep'],
      rua: [c, 'endereco'],
      numero: [c, 'numero'],
      bairro: [c, 'bairro'],
      cidade: [c, 'cidade'],
      estado: [c, 'uf'],
      idCargo: [ip, 'cargo'],
      senha: [iu, 'senha'],
      idPerfil: [iu, 'perfil'],
      registroConselho: [ie, 'registroProfissional'],
      especialidadesIds: [ie, 'especialidades'],
      novasEspecialidades: [ie, 'especialidades'],
      jornadas: [ie, 'jornadas'],
      diaSemana: [ie, 'jornadas'],
      horaInicio: [ie, 'jornadas'],
      horaTermino: [ie, 'jornadas'],
      cnpj: [ie, 'cnpj'],
      razaoSocial: [ie, 'razaoSocial'],
    };

    return mapa[k] ?? null;
  }
}
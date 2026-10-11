import { Injectable } from '@angular/core';
import { soDigitos } from '../../../../shared/utils/texto.util';
import { GrauParentesco } from '../../../../core/models/paciente.model';
import { Endereco } from '../../../../core/models/profissional.model';
import { PacienteCadastroPayload, ResponsavelPayload } from '../../../../core/models/paciente-cadastro.model';
import { EnderecoForm, FormulariosPaciente, ResponsavelItem } from '../models/formularios-paciente';

@Injectable({ providedIn: 'root' })
export class PacienteCadastroPayloadService {

  montar(f: FormulariosPaciente, idEscola?: number): PacienteCadastroPayload {
    const dp = f.dadosPessoais;
    const cids = f.infoCid.listaCids();
    const pr = f.infoProntuario;

    return {
      nome: dp.nome.trim(),
      cpf: soDigitos(dp.cpf),
      dataNascimento: dp.dataNascimento,
      sexo: dp.sexo,
      estadoCivil: dp.estadoCivil,
      celular: soDigitos(dp.celular) || undefined,
      numCNS: soDigitos(dp.numCNS) || undefined,
      enderecos: [this.montarEndereco(f.contato)],
      idEscola,
      convenio: f.infoPaciente.convenio,
      codigosCid: cids.filter((c) => !c.novo).map((c) => c.codigoCID),
      novosCids: cids.filter((c) => c.novo).map((c) => ({ codigoCID: c.codigoCID, descricao: c.descricao })),
      prontuario: {
        alergias: pr.alergias.trim() || undefined,
        comorbidade: pr.comorbidade.trim() || undefined,
        mobilidade: pr.mobilidade.trim() || undefined,
      },
      responsaveis: f.infoResponsavel.listaResponsaveis.map((r) => this.montarResponsavel(r)),
    };
  }

  private montarResponsavel(r: ResponsavelItem): ResponsavelPayload {
    return {
      nome: r.nome.trim(),
      cpf: soDigitos(r.cpf),
      dataNascimento: r.dataNascimento,
      sexo: r.sexo,
      estadoCivil: r.estadoCivil,
      celular: soDigitos(r.celular) || undefined,
      ocupacao: r.ocupacao.trim() || undefined,
      grauParentesco: r.grauParentesco as GrauParentesco,
      naoResideComPaciente: r.naoResideComPaciente,
      // Se reside com o paciente, o back usa os endereços do paciente.
      enderecos: r.naoResideComPaciente && r.endereco ? [this.montarEndereco(r.endereco)] : undefined,
    };
  }

  private montarEndereco(c: EnderecoForm): Endereco {
    return {
      cep: soDigitos(c.cep),
      rua: c.endereco.trim(),
      numero: c.numero.trim(),
      complemento: c.complemento?.trim() || undefined,
      bairro: c.bairro.trim(),
      cidade: c.cidade.trim(),
      estado: c.uf,
    };
  }
}

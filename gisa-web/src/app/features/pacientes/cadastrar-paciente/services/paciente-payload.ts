import { Injectable } from '@angular/core';
import { soDigitos } from '../../../../shared/utils/texto.util';
import { GrauParentesco } from '../../../../core/models/paciente.model';
import { Endereco, EstadoCivil, Sexo } from '../../../../core/models/comum.model';
import { AtualizacaoResponsavelPayload, PacienteCadastroPayload, ResponsavelPayload } from '../../../../core/models/paciente.model';
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
      sexo: dp.sexo as Sexo,
      estadoCivil: dp.estadoCivil as EstadoCivil,
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

  montarResponsavel(r: ResponsavelItem): ResponsavelPayload {
    return {
      // Já cadastrado: a API só vincula (os dados abaixo são exigidos, mas não alteram o cadastro).
      idResponsavel: r.reaproveitado ? r.idResponsavel : undefined,
      nome: r.nome.trim(),
      cpf: soDigitos(r.cpf),
      dataNascimento: r.dataNascimento,
      sexo: r.sexo as Sexo,
      estadoCivil: r.estadoCivil as EstadoCivil,
      celular: soDigitos(r.celular) || undefined,
      ocupacao: r.ocupacao.trim() || undefined,
      grauParentesco: r.grauParentesco as GrauParentesco,
      naoResideComPaciente: r.naoResideComPaciente,
      // Se reside com o paciente, o back usa os endereços do paciente.
      enderecos: r.naoResideComPaciente && r.endereco ? [this.montarEndereco(r.endereco)] : undefined,
    };
  }

  // PATCH /responsaveis/{id} para um responsável já cadastrado, depois de vinculado (null = nada a fazer):
  // reativa o inativo e, se ele não tinha endereço, grava o que vale agora (a API não mexe no
  // endereço de quem já existia).
  atualizacaoPosVinculo(r: ResponsavelItem, enderecoPaciente: Endereco): AtualizacaoResponsavelPayload | null {
    if (!r.reaproveitado) return null;
    const dados: AtualizacaoResponsavelPayload = {};
    if (r.inativo) dados.statusCadastro = 'ATIVO';
    if (r.enderecoCadastro === null) {
      dados.enderecos = [r.naoResideComPaciente && r.endereco ? this.montarEndereco(r.endereco) : enderecoPaciente];
    }
    return Object.keys(dados).length ? dados : null;
  }

  montarEndereco(c: EnderecoForm): Endereco {
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

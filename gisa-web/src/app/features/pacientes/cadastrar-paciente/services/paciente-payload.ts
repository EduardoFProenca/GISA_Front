import { Injectable } from '@angular/core';
import { soDigitos } from '../../../../shared/utils/texto.util';
import { GrauParentesco } from '../../../../core/models/paciente.model';
import { Endereco, EstadoCivil, Sexo } from '../../../../core/models/comum.model';
import { AtualizacaoResponsavelPayload, PacienteCadastroPayload, ResponsavelPayload } from '../../../../core/models/paciente.model';
import { EnderecoForm, FormulariosPaciente, ResponsavelItem } from '../models/formularios-paciente';
import { enderecoVazio } from '../../paciente-form.util';

@Injectable({ providedIn: 'root' })
export class PacienteCadastroPayloadService {

  montar(f: FormulariosPaciente, idEscola?: number): PacienteCadastroPayload {
    const dp = f.dadosPessoais;
    const cids = f.infoCid.listaCids();
    const pr = f.infoProntuario;
    const enderecos = f.enderecos.paraApi();

    return {
      nome: dp.nome.trim(),
      cpf: soDigitos(dp.cpf),
      dataNascimento: dp.dataNascimento,
      sexo: dp.sexo as Sexo,
      estadoCivil: dp.estadoCivil as EstadoCivil,
      celular: soDigitos(dp.celular) || undefined,
      numCNS: soDigitos(dp.numCNS) || undefined,
      // Novos sem idEndereco; os que vieram da API levam o ID.
      enderecos,
      idEscola,
      convenio: f.infoPaciente.convenio,
      codigosCid: cids.filter((c) => !c.novo).map((c) => c.codigoCID),
      novosCids: cids.filter((c) => c.novo).map((c) => ({ codigoCID: c.codigoCID, descricao: c.descricao })),
      prontuario: {
        alergias: pr.alergias.trim() || undefined,
        comorbidade: pr.comorbidade.trim() || undefined,
        mobilidade: pr.mobilidade.trim() || undefined,
      },
      responsaveis: f.infoResponsavel.listaResponsaveis.map((r) => this.montarResponsavel(r, enderecos.length)),
    };
  }

  // totalEnderecos: tamanho da lista `enderecos` do mesmo request (os índices de residência apontam para ela).
  montarResponsavel(r: ResponsavelItem, totalEnderecos: number): ResponsavelPayload {
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
      // Até a escolha por endereço (B2), quem reside mora em todos os endereços do paciente.
      indicesEnderecoResidencia: this.indicesResidencia(r, totalEnderecos),
      // Se reside com o paciente, o back usa os endereços do paciente.
      enderecos: r.naoResideComPaciente && r.endereco ? this.montarEnderecos(r.endereco) : undefined,
    };
  }

  indicesResidencia(r: ResponsavelItem, totalEnderecos: number): number[] {
    return r.naoResideComPaciente ? [] : [...Array(totalEnderecos).keys()];
  }

  // PATCH /responsaveis/{id} para um responsável já cadastrado, depois de vinculado (null = nada a fazer):
  // reativa o inativo. O endereço de quem reside com o paciente a própria API acerta.
  atualizacaoPosVinculo(r: ResponsavelItem): AtualizacaoResponsavelPayload | null {
    if (!r.reaproveitado) return null;
    const dados: AtualizacaoResponsavelPayload = {};
    if (r.inativo) dados.statusCadastro = 'ATIVO';
    // Não residente sem endereço cadastrado: grava o informado agora (a API não altera quem já existia).
    if (r.naoResideComPaciente && !r.enderecoCadastro && r.endereco && !enderecoVazio(r.endereco)) {
      dados.enderecos = [this.montarEndereco(r.endereco)];
    }
    return Object.keys(dados).length ? dados : null;
  }

  montarEnderecos(c: EnderecoForm): Endereco[] {
    return enderecoVazio(c) ? [] : [this.montarEndereco(c)];
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

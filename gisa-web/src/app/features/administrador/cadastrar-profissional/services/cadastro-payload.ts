import { Injectable } from '@angular/core';
import { soDigitos } from '../../../../shared/utils/texto.util';
import {
  AtualizacaoEspecialistaPJPayload,
  DadosBaseProfissional,
  DadosEspecialista,
  DadosEspecialistaPJ,
  DadosUsuario,
  Jornada,
} from '../../../../core/models/profissional.model';
import { Endereco, EstadoCivil, Sexo } from '../../../../core/models/comum.model';
import { FormulariosCadastro } from '../models/formularios-cadastro';
import { CadastroValidadorService } from './cadastro-validador';

// Monta os corpos das requisições de profissional/especialista/PJ a partir dos formulários.
// Cargo, perfil e especialidades já chegam como IDs (os selects usam as listas da API).
@Injectable({ providedIn: 'root' })
export class CadastroPayloadService {
  constructor(private validador: CadastroValidadorService) {}

  montarEndereco(f: FormulariosCadastro): Endereco {
    const c = f.contato;
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

  // Sem endereço preenchido = lista vazia (endereço é opcional para profissionais).
  montarEnderecos(f: FormulariosCadastro): Endereco[] {
    return this.validador.enderecoVazio(f) ? [] : [this.montarEndereco(f)];
  }

  montarDadosBase(f: FormulariosCadastro): DadosBaseProfissional {
    const dp = f.dadosPessoais;
    return {
      nome: dp.nome.trim(),
      cpf: soDigitos(dp.cpf),
      dataNascimento: dp.dataNascimento,
      sexo: dp.sexo as Sexo,
      celular: soDigitos(dp.celular),
      numCNS: soDigitos(dp.numCNS) || undefined,
      estadoCivil: dp.estadoCivil as EstadoCivil,
      enderecos: this.montarEnderecos(f),
      email: dp.email.trim(),
      idCargo: Number(f.infoProfissional.cargo),
    };
  }

  // null = sem acesso novo (não marcado, ou o cadastro já tem usuário).
  montarUsuario(f: FormulariosCadastro): DadosUsuario | null {
    const iu = f.infoUsuario;
    if (iu.possuiAcesso || !iu.temAcessoSistema) return null;
    return { senha: iu.senha, idPerfil: Number(iu.perfil) };
  }

  mapearJornadas(f: FormulariosCadastro): Jornada[] {
    return this.validador.jornadasCompletas(f).map((j) => ({
      diaSemana: Number(j.diaSemana),
      horaInicio: j.horaInicio,
      horaTermino: j.horaTermino,
    }));
  }

  // IDs únicos das especialidades escolhidas.
  especialidadesIds(f: FormulariosCadastro): number[] {
    return [...new Set(f.infoEspecialista.especialidades.filter((e) => !!e).map(Number))];
  }

  montarDadosEspecialista(f: FormulariosCadastro, dadosBase: DadosBaseProfissional): DadosEspecialista {
    return {
      ...dadosBase,
      registroConselho: f.infoEspecialista.registroProfissional.trim(),
      especialidadesIds: this.especialidadesIds(f),
      novasEspecialidades: [],
      jornadas: this.mapearJornadas(f),
    };
  }

  montarDadosEspecialistaPJ(f: FormulariosCadastro, dadosEspecialista: DadosEspecialista): DadosEspecialistaPJ {
    const ie = f.infoEspecialista;
    return {
      ...dadosEspecialista,
      cnpj: soDigitos(ie.cnpj),
      razaoSocial: ie.razaoSocial.trim(),
      nomeFantasia: ie.nomeFantasia.trim() || undefined,
      inscricaoEstadual: ie.inscricaoEstadual.trim() || undefined,
    };
  }

  // PATCH de profissional/especialista/PJ: o serviço envia só os campos do tipo do cadastro.
  // cpf, nascimento, sexo, registro e CNPJ são somente leitura (não vão no corpo).
  montarAtualizacao(f: FormulariosCadastro): AtualizacaoEspecialistaPJPayload {
    const dp = f.dadosPessoais;
    const ie = f.infoEspecialista;
    const iu = f.infoUsuario;
    return {
      nome: dp.nome.trim(),
      celular: soDigitos(dp.celular) || null,
      numCNS: soDigitos(dp.numCNS) || null,
      estadoCivil: dp.estadoCivil as EstadoCivil,
      enderecos: this.montarEnderecos(f),
      email: dp.email.trim(),
      idCargo: Number(f.infoProfissional.cargo),
      // Só funciona para quem já tem usuário (senão a API responde 409).
      idPerfil: iu.possuiAcesso ? Number(iu.perfil) : undefined,
      especialidadesIds: this.especialidadesIds(f),
      jornadas: this.mapearJornadas(f),
      razaoSocial: ie.razaoSocial.trim(),
      nomeFantasia: ie.nomeFantasia.trim() || null,
      inscricaoEstadual: ie.inscricaoEstadual.trim() || null,
    };
  }
}

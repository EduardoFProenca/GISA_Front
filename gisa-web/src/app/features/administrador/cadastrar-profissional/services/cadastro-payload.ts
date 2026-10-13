import { Injectable } from '@angular/core';
import { soDigitos } from '../../../../shared/utils/texto.util';
import { Cargo } from '../../../../core/models/cargo.model';
import { PerfilResumo } from '../../../../core/models/perfil.model';

// Só idCargo e nome são usados: aceita tanto a listagem completa quanto referências.
type CargoRef = Pick<Cargo, 'idCargo' | 'nome'>;
import { Especialidade } from '../../../../core/models/especialidade.model';
import {
  DadosBaseProfissional,
  DadosEspecialista,
  DadosEspecialistaPJ,
  DadosUsuario,
  Jornada,
} from '../../../../core/models/profissional.model';
import { Endereco, EstadoCivil, Sexo } from '../../../../core/models/comum.model';
import { FormulariosCadastro } from '../models/formularios-cadastro';
import { CadastroValidadorService } from './cadastro-validador';

@Injectable({ providedIn: 'root' })
export class CadastroPayloadService {
  constructor(private validador: CadastroValidadorService) {}

  idCargoPorNome(cargos: CargoRef[], nomeCargo: string): number {
    const alvo = nomeCargo.replace(/_/g, ' ').toLowerCase();
    const encontrado = cargos.find((c) => c.nome.toLowerCase() === alvo);
    return encontrado?.idCargo ?? cargos[0]?.idCargo ?? 0;
  }

  idPerfilPorNome(perfis: PerfilResumo[], nomePerfil: string): number {
    const alvo = nomePerfil.replace(/_/g, ' ').toLowerCase();
    const encontrado = perfis.find((p) => p.nome.toLowerCase() === alvo);
    return encontrado?.idPerfil ?? perfis[0]?.idPerfil ?? 0;
  }

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

  montarDadosBase(f: FormulariosCadastro, cargos: CargoRef[]): DadosBaseProfissional {
    const dp = f.dadosPessoais;
    return {
      nome: dp.nome.trim(),
      cpf: soDigitos(dp.cpf),
      dataNascimento: dp.dataNascimento,
      sexo: dp.sexo as Sexo,
      celular: soDigitos(dp.celular),
      numCNS: soDigitos(dp.numCNS) || undefined,
      estadoCivil: dp.estadoCivil as EstadoCivil,
      enderecos: [this.montarEndereco(f)],
      email: dp.email.trim(),
      idCargo: this.idCargoPorNome(cargos, f.infoProfissional.cargo),
    };
  }

  montarUsuario(f: FormulariosCadastro, perfis: PerfilResumo[]): DadosUsuario | null {
    const iu = f.infoUsuario;
    if (!iu.temAcessoSistema) return null;
    return { senha: iu.senha, idPerfil: this.idPerfilPorNome(perfis, iu.perfil) };
  }

  mapearJornadas(f: FormulariosCadastro): Jornada[] {
    return this.validador.jornadasCompletas(f).map((j) => ({
      diaSemana: Number(j.diaSemana),
      horaInicio: j.horaInicio,
      horaTermino: j.horaTermino,
    }));
  }

  mapearEspecialidadesIds(f: FormulariosCadastro, todasEspecialidades: Especialidade[]): number[] {
    const selecionadas = f.infoEspecialista.especialidades.filter((e) => !!e);
    const ids: number[] = [];

    for (const valor of selecionadas) {
      const opcao = f.infoEspecialista.opcoesEspecialidade.find((o) => o.valor === valor);
      const nomeLabel = opcao?.label ?? valor;
      const encontrada = todasEspecialidades.find((e) => e.nome.toLowerCase() === nomeLabel.toLowerCase());
      if (encontrada) ids.push(encontrada.idEspecialidade);
    }

    return ids;
  }

  montarDadosEspecialista(
    f: FormulariosCadastro,
    dadosBase: DadosBaseProfissional,
    especialidadesIds: number[]
  ): DadosEspecialista {
    return {
      ...dadosBase,
      registroConselho: f.infoEspecialista.registroProfissional.trim(),
      especialidadesIds,
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
      nomeFantasia: ie.nomeFantasia.trim(),
      inscricaoEstadual: ie.inscricaoEstadual.trim(),
    };
  }
}
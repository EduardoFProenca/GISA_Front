import { Component, ViewChild, inject, OnInit } from '@angular/core';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { Contato } from '../../../shared/components/contato/contato';
import { InfoEspecialista } from './formularios/info-especialista/info-especialista';
import { InfoUsuario } from './formularios/info-usuario/info-usuario';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { InfoProfissional } from './formularios/info-profissional/info-profissional';
import { ProfissionalService } from '../../../services/profissional';
import { EspecialidadeService } from '../../../services/especialidade';
import { CargoService } from '../../../services/cargo';
import { PerfilService } from '../../../services/perfil';
import { Especialidade } from '../../../core/models/especialidade.model';
import { Cargo, Perfil } from '../../../core/models/cargo.model';
import {
  Endereco,
  DadosBaseProfissional,
  DadosEspecialista,
  DadosEspecialistaPJ,
  Jornada
} from '../../../core/models/profissional.model';

@Component({
  selector: 'app-cadastrar-profissional',
  imports: [DadosPessoais, Contato, InfoEspecialista, InfoUsuario, CabecalhoPagina, InfoProfissional],
  templateUrl: './cadastrar-profissional.html',
  styleUrl: './cadastrar-profissional.scss',
})
export class CadastroProfissional implements OnInit {
  @ViewChild(DadosPessoais) dadosPessoais!: DadosPessoais;
  @ViewChild(Contato) contato!: Contato;
  @ViewChild(InfoProfissional) infoProfissional!: InfoProfissional;
  @ViewChild(InfoUsuario) infoUsuario!: InfoUsuario;
  @ViewChild(InfoEspecialista) infoEspecialista!: InfoEspecialista;

  private profissionalService = inject(ProfissionalService);
  private especialidadeService = inject(EspecialidadeService);
  private cargoService = inject(CargoService);
  private perfilService = inject(PerfilService);

  salvando = false;
  erro = '';

  private cargos: Cargo[] = [];
  private perfis: Perfil[] = [];

  ngOnInit() {
    this.cargoService.listar().subscribe({ next: (c) => (this.cargos = c) });
    this.perfilService.listar().subscribe({ next: (p) => (this.perfis = p) });
  }

  private idCargoPorNome(nomeCargo: string): number {
    // infoProfissional.cargos usa valores como 'ADMINISTRADOR', 'MEDICO' etc.;
    // compara sem acento/case com o nome vindo de /api/cargos
    const alvo = nomeCargo.replace(/_/g, ' ').toLowerCase();
    const encontrado = this.cargos.find((c) => c.nome.toLowerCase() === alvo);
    return encontrado?.idCargo ?? this.cargos[0]?.idCargo ?? 0;
  }

  private idPerfilPorNome(nomePerfil: string): number {
    const alvo = nomePerfil.replace(/_/g, ' ').toLowerCase();
    const encontrado = this.perfis.find((p) => p.nome.toLowerCase() === alvo);
    return encontrado?.idPerfil ?? this.perfis[0]?.idPerfil ?? 0;
  }

  private montarEndereco(): Endereco {
    const c = this.contato;
    return {
      cep: c.cep,
      rua: c.endereco,
      numero: c.numero,
      complemento: c.complemento,
      bairro: c.bairro,
      cidade: c.cidade,
      estado: c.uf,
    };
  }

  private montarDadosBase(): DadosBaseProfissional {
    const dp = this.dadosPessoais;
    return {
      nome: dp.nome,
      cpf: dp.cpf,
      dataNascimento: dp.dataNascimento,
      sexo: dp.sexo,
      celular: dp.celular,
      numCNS: dp.numCNS,
      estadoCivil: dp.estadoCivil,
      enderecos: [this.montarEndereco()],
      email: dp.email,
      idCargo: this.idCargoPorNome(this.infoProfissional.cargo),
    };
  }

  private mapearJornadas(): Jornada[] {
    return this.infoEspecialista.jornadas
      .filter((j) => j.diaSemana && j.horaInicio && j.horaTermino)
      .map((j) => ({
        diaSemana: Number(j.diaSemana),
        horaInicio: j.horaInicio,
        horaTermino: j.horaTermino,
      }));
  }

  private async mapearEspecialidadesIds(): Promise<number[]> {
    const selecionadas = this.infoEspecialista.especialidades.filter((e) => !!e);
    if (!selecionadas.length) return [];

    const todas: Especialidade[] = await new Promise((resolve, reject) => {
      this.especialidadeService.listar().subscribe({ next: resolve, error: reject });
    });

    const ids: number[] = [];
    for (const valor of selecionadas) {
      const opcao = this.infoEspecialista.opcoesEspecialidade.find((o) => o.valor === valor);
      const nomeLabel = opcao?.label ?? valor;
      const encontrada = todas.find(
        (e) => e.nome.toLowerCase() === nomeLabel.toLowerCase()
      );
      if (encontrada) ids.push(encontrada.idEspecialidade);
    }
    return ids;
  }

  async salvarCadastro() {
    this.erro = '';
    this.salvando = true;

    try {
      const dadosBase = this.montarDadosBase();
      const temAcesso = this.infoUsuario.temAcessoSistema;
      const usuario = temAcesso
        ? { senha: this.infoUsuario.senha, idPerfil: this.idPerfilPorNome(this.infoUsuario.perfil) }
        : null;

      if (!this.infoEspecialista.ehEspecialista) {
        // Profissional simples
        if (usuario) {
          this.profissionalService
            .cadastrarProfissionalComUsuario({ profissional: dadosBase, usuario })
            .subscribe(this.handlersPadrao());
        } else {
          this.profissionalService.cadastrarProfissional(dadosBase).subscribe(this.handlersPadrao());
        }
        return;
      }

      // Especialista
      const especialidadesIds = await this.mapearEspecialidadesIds();
      const dadosEspecialista: DadosEspecialista = {
        ...dadosBase,
        registroConselho: this.infoEspecialista.registroProfissional,
        especialidadesIds,
        novasEspecialidades: [],
        jornadas: this.mapearJornadas(),
      };

      if (this.infoEspecialista.atuaComoPJ) {
        const dadosPJ: DadosEspecialistaPJ = {
          ...dadosEspecialista,
          cnpj: this.infoEspecialista.cnpj,
          razaoSocial: this.infoEspecialista.razaoSocial,
          nomeFantasia: this.infoEspecialista.nomeFantasia,
          inscricaoEstadual: this.infoEspecialista.inscricaoEstadual,
        };

        if (usuario) {
          this.profissionalService
            .cadastrarEspecialistaPJComUsuario({ especialistaPJ: dadosPJ, usuario })
            .subscribe(this.handlersPadrao());
        } else {
          this.profissionalService.cadastrarEspecialistaPJ(dadosPJ).subscribe(this.handlersPadrao());
        }
        return;
      }

      if (usuario) {
        this.profissionalService
          .cadastrarEspecialistaComUsuario({ especialista: dadosEspecialista, usuario })
          .subscribe(this.handlersPadrao());
      } else {
        this.profissionalService.cadastrarEspecialista(dadosEspecialista).subscribe(this.handlersPadrao());
      }
    } catch (e) {
      this.salvando = false;
      this.erro = 'Não foi possível carregar as especialidades.';
    }
  }

  private handlersPadrao() {
    return {
      next: () => {
        this.salvando = false;
        // TODO: navegar para listagem de profissionais / exibir confirmação
      },
      error: (err: any) => {
        this.salvando = false;
        this.erro = err?.error?.message || 'Erro ao salvar cadastro.';
      },
    };
  }
}
import { map } from 'rxjs';
import { PacienteService } from '../../../core/services/paciente';
import { ProfissionalService } from '../../../core/services/profissional';
import { ResponsavelService } from '../../../core/services/responsavel';
import { formatarCpf } from '../../utils/formatacao.util';
import { soDigitos } from '../../utils/texto.util';
import { BuscaSelect } from './select-busca';

// Buscas prontas para o modo remoto do <app-select-busca> (a API filtra; só vem a primeira página).
// Uso no componente: readonly buscarPacientes = buscaPacientes(inject(PacienteService));

const POR_BUSCA = 20;

// Só números (com ou sem máscara) = trecho do CPF; qualquer letra = trecho do nome.
function termoParaFiltro(termo: string): { cpf?: string; nome?: string } {
  if (!termo) return {};
  return /^[\d.\-\s]+$/.test(termo) ? { cpf: soDigitos(termo) } : { nome: termo };
}

// Pacientes por nome ou CPF. somenteMatriculados: só os que podem ser agendados.
export function buscaPacientes(service: PacienteService, opcoes: { somenteMatriculados?: boolean } = {}): BuscaSelect {
  return (termo) =>
    service.listar({ ...termoParaFiltro(termo), size: POR_BUSCA, sort: 'nome,asc' }).pipe(
      map(({ content }) =>
        content
          .filter((p) => !opcoes.somenteMatriculados || p.statusPaciente === 'MATRICULADO')
          .map((p) => ({ id: p.idCadastro, label: `${p.nome} · CPF ${formatarCpf(p.cpf)}`, rotuloSelecionado: p.nome }))
      )
    );
}

// Especialistas e especialistas PJ ativos, por nome ou CPF.
export function buscaEspecialistas(service: ProfissionalService): BuscaSelect {
  return (termo) =>
    service
      .listar({
        ...termoParaFiltro(termo),
        tipo: ['ESPECIALISTA', 'ESPECIALISTA_PJ'],
        statusCadastro: 'ATIVO',
        size: POR_BUSCA,
        sort: 'nome,asc',
      })
      .pipe(
        map(({ content }) =>
          content.map((e) => ({
            id: e.idProfissional,
            label: e.registroConselho ? `${e.nome} · ${e.registroConselho}` : e.nome,
            rotuloSelecionado: e.nome,
          }))
        )
      );
}

// Responsáveis já cadastrados (inclusive inativos), por nome ou CPF.
export function buscaResponsaveis(service: ResponsavelService): BuscaSelect {
  return (termo) =>
    service.listar({ ...termoParaFiltro(termo), size: POR_BUSCA, sort: 'nome,asc' }).pipe(
      map(({ content }) =>
        content.map((r) => ({
          id: r.idCadastro,
          label: `${r.nome} · CPF ${formatarCpf(r.cpf)}${r.statusCadastro === 'INATIVO' ? ' · inativo' : ''}`,
          rotuloSelecionado: r.nome,
        }))
      )
    );
}

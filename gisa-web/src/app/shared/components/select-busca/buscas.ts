import { map, of } from 'rxjs';
import { PacienteService, termoBuscaPacienteValido } from '../../../core/services/paciente';
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

// Use em [dicaTermo] junto com buscaPacientes.
export const DICA_BUSCA_PACIENTE = (termo: string): string | null =>
  termoBuscaPacienteValido(termo) ? null : 'Digite ao menos 3 letras do nome ou o CPF completo';

// Pacientes por nome (3 letras) ou CPF completo; a API devolve até 20 (LGPD: não há listagem).
// somenteAtivos: só cadastros ativos (ex.: para agendar).
export function buscaPacientes(service: PacienteService, opcoes: { somenteAtivos?: boolean } = {}): BuscaSelect {
  return (termo) => {
    if (!termoBuscaPacienteValido(termo)) return of([]);
    return service.pesquisar({ termo }).pipe(
      map((lista) =>
        lista
          .filter((p) => !opcoes.somenteAtivos || p.statusCadastro === 'ATIVO')
          .map((p) => ({
            id: p.idCadastro,
            label: `${p.nome} · CPF ${p.cpfMascarado}${p.statusCadastro === 'INATIVO' ? ' · inativo' : ''}`,
            rotuloSelecionado: p.nome,
          }))
      )
    );
  };
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

// Assistentes sociais ativos, por nome ou CPF (para vincular a um paciente).
export function buscaAssistentesSociais(service: ProfissionalService): BuscaSelect {
  return (termo) =>
    service
      .listar({ ...termoParaFiltro(termo), tipo: ['ASSISTENTE_SOCIAL'], statusCadastro: 'ATIVO', size: POR_BUSCA, sort: 'nome,asc' })
      .pipe(
        map(({ content }) =>
          content.map((a) => ({
            id: a.idProfissional,
            label: a.registroConselho ? `${a.nome} · ${a.registroConselho}` : a.nome,
            rotuloSelecionado: a.nome,
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

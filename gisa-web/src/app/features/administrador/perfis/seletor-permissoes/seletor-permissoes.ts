import { Component, computed, input, output, signal } from '@angular/core';
import { Permissao } from '../../../../core/models/perfil.model';
import { normalizarBusca } from '../../../../shared/utils/texto.util';

// Categoria de cada permissão enquanto GET /permissoes não traz `categoria` (ver PERFIS.md).
// Quando o back passar a mandar, este mapa só serve de reserva.
const CATEGORIA_POR_PERMISSAO: Record<string, string> = {
  VISUALIZAR_PACIENTES: 'Pacientes',
  VISUALIZAR_PACIENTES_VINCULADOS: 'Pacientes',
  CADASTRAR_PACIENTE: 'Pacientes',
  EDITAR_PACIENTE: 'Pacientes',
  INATIVAR_PACIENTE: 'Pacientes',
  VISUALIZAR_HISTORICO_PACIENTE: 'Pacientes',
  VISUALIZAR_TERAPIAS: 'Terapias',
  AGENDAR_TERAPIA: 'Terapias',
  EDITAR_TERAPIA: 'Terapias',
  ALTERAR_STATUS_TERAPIA: 'Terapias',
  REGISTRAR_PRESENCA: 'Terapias',
  VISUALIZAR_PROFISSIONAIS: 'Profissionais',
  CADASTRAR_PROFISSIONAL: 'Profissionais',
  CADASTRAR_ESPECIALISTA: 'Profissionais',
  CADASTRAR_ESPECIALISTA_PJ: 'Profissionais',
  EDITAR_PROFISSIONAL: 'Profissionais',
  INATIVAR_PROFISSIONAL: 'Profissionais',
  EMITIR_ATESTADO: 'Documentos',
  EMITIR_RECEITA: 'Documentos',
  EMITIR_RECUSA: 'Documentos',
  GERENCIAR_CARGOS: 'Tabelas de apoio',
  GERENCIAR_ESCOLAS: 'Tabelas de apoio',
  GERENCIAR_ESPECIALIDADES: 'Tabelas de apoio',
  GERENCIAR_USUARIOS: 'Segurança',
  GERENCIAR_PERFIS: 'Segurança',
  VISUALIZAR_AUDITORIA: 'Segurança',
  ACESSO_TOTAL: 'Segurança',
};

const ORDEM_CATEGORIAS = ['Pacientes', 'Terapias', 'Profissionais', 'Documentos', 'Tabelas de apoio', 'Segurança'];
const SEM_CATEGORIA = 'Outras';

interface GrupoPermissoes {
  categoria: string;
  permissoes: Permissao[];
  todasMarcadas: boolean;
}

function categoriaDe(p: Permissao): string {
  return p.categoria || CATEGORIA_POR_PERMISSAO[p.nome] || SEM_CATEGORIA;
}

function posicao(categoria: string): number {
  const i = ORDEM_CATEGORIAS.indexOf(categoria);
  return i === -1 ? ORDEM_CATEGORIAS.length : i;
}

// Lista de permissões com busca por nome/descrição, agrupada por categoria, com "marcar todas" por grupo.
@Component({
  selector: 'app-seletor-permissoes',
  templateUrl: './seletor-permissoes.html',
  styleUrl: './seletor-permissoes.scss',
})
export class SeletorPermissoes {
  permissoes = input<Permissao[]>([]);
  selecionadas = input<ReadonlySet<number>>(new Set());
  selecionadasChange = output<ReadonlySet<number>>();

  busca = signal('');

  grupos = computed<GrupoPermissoes[]>(() => {
    const termo = normalizarBusca(this.busca().trim());
    const marcadas = this.selecionadas();
    const porCategoria = new Map<string, Permissao[]>();
    for (const p of this.permissoes()) {
      const texto = normalizarBusca(`${p.nome.replace(/_/g, ' ')} ${p.descricao ?? ''}`);
      if (termo && !texto.includes(termo)) continue;
      const categoria = categoriaDe(p);
      porCategoria.set(categoria, [...(porCategoria.get(categoria) ?? []), p]);
    }
    return [...porCategoria.entries()]
      .sort(([a], [b]) => posicao(a) - posicao(b) || a.localeCompare(b))
      .map(([categoria, permissoes]) => ({
        categoria,
        permissoes,
        todasMarcadas: permissoes.every((p) => marcadas.has(p.idPermissao)),
      }));
  });

  alternar(id: number, marcado: boolean) {
    const novo = new Set(this.selecionadas());
    if (marcado) novo.add(id);
    else novo.delete(id);
    this.selecionadasChange.emit(novo);
  }

  // Marca (ou desmarca, se já estavam todas marcadas) as permissões visíveis do grupo.
  alternarGrupo(grupo: GrupoPermissoes) {
    const novo = new Set(this.selecionadas());
    for (const p of grupo.permissoes) {
      if (grupo.todasMarcadas) novo.delete(p.idPermissao);
      else novo.add(p.idPermissao);
    }
    this.selecionadasChange.emit(novo);
  }
}

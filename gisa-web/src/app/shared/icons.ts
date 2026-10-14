// Ícones do sistema: conjunto Lucide via @ng-icons (https://ng-icons.github.io/ng-icons/).
//
// - ICONES_LUCIDE: os ícones registrados no app (provideIcons em app.config.ts). Para usar
//   um ícone novo, importe-o aqui e acrescente nas duas listas.
// - ICONES: nome semântico -> nome do ícone. Telas e componentes usam sempre ICONES,
//   assim trocar o desenho de um conceito (ex.: "calendario") muda o sistema inteiro.
//
// Uso no template (o componente importa NgIcon de '@ng-icons/core'):
//   <ng-icon [name]="icones.calendario" />           tamanho padrão (1em, acompanha a fonte)
//   <ng-icon [name]="icones.editar" size="16" />
// Em dados (AcaoRapida, ItemMenu, card-estatistica): { icone: ICONES.cadastrarPaciente }
import {
  lucideActivity,
  lucideArrowLeft,
  lucideBell,
  lucideBriefcase,
  lucideCalendar,
  lucideCalendarDays,
  lucideCheck,
  lucideChevronLeft,
  lucideChevronRight,
  lucideCircleX,
  lucideClipboardCheck,
  lucideEye,
  lucideEyeOff,
  lucideFilePlus,
  lucideFileSignature,
  lucideFileText,
  lucideFileX,
  lucideFilter,
  lucideHistory,
  lucideHouse,
  lucideKeyRound,
  lucideList,
  lucideLockKeyhole,
  lucideLogOut,
  lucideMenu,
  lucidePencil,
  lucidePill,
  lucidePlus,
  lucideScrollText,
  lucideSearch,
  lucideStar,
  lucideUser,
  lucideUserPlus,
  lucideUsers,
  lucideX,
} from '@ng-icons/lucide';

export const ICONES_LUCIDE = {
  lucideActivity,
  lucideArrowLeft,
  lucideBell,
  lucideBriefcase,
  lucideCalendar,
  lucideCalendarDays,
  lucideCheck,
  lucideChevronLeft,
  lucideChevronRight,
  lucideCircleX,
  lucideClipboardCheck,
  lucideEye,
  lucideEyeOff,
  lucideFilePlus,
  lucideFileSignature,
  lucideFileText,
  lucideFileX,
  lucideFilter,
  lucideHistory,
  lucideHouse,
  lucideKeyRound,
  lucideList,
  lucideLockKeyhole,
  lucideLogOut,
  lucideMenu,
  lucidePencil,
  lucidePill,
  lucidePlus,
  lucideScrollText,
  lucideSearch,
  lucideStar,
  lucideUser,
  lucideUserPlus,
  lucideUsers,
  lucideX,
};

export type NomeIcone = keyof typeof ICONES_LUCIDE;

export const ICONES = {
  // Navegação e ações gerais
  inicio: 'lucideHouse',
  menu: 'lucideMenu',
  voltar: 'lucideArrowLeft',
  anterior: 'lucideChevronLeft',
  proximo: 'lucideChevronRight',
  adicionar: 'lucidePlus',
  fechar: 'lucideX',
  cancelar: 'lucideCircleX',
  confirmado: 'lucideCheck',
  editar: 'lucidePencil',
  buscar: 'lucideSearch',
  filtro: 'lucideFilter',
  historico: 'lucideHistory',
  sino: 'lucideBell',
  sair: 'lucideLogOut',
  olho: 'lucideEye',
  olhoFechado: 'lucideEyeOff',

  // Pessoas
  pessoa: 'lucideUser',
  grupoPessoas: 'lucideUsers',
  gestaoPacientes: 'lucideUsers',
  cadastrarProfissional: 'lucideUserPlus',
  gestaoProfissionais: 'lucideActivity',

  // Terapias e agenda
  calendario: 'lucideCalendar',
  criacaoAgenda: 'lucideCalendarDays',
  gestaoConsultas: 'lucideClipboardCheck',
  estrela: 'lucideStar',

  // Documentos e cadastros de apoio
  cadastrarPaciente: 'lucideFilePlus',
  gestaoAtividades: 'lucideFileText',
  documento: 'lucideFileText',
  cargo: 'lucideBriefcase',
  lista: 'lucideList',
  chave: 'lucideKeyRound',

  // Documentos impressos
  atestado: 'lucideFileSignature',
  receita: 'lucidePill',
  recusa: 'lucideFileX',

  // Conta e segurança
  senha: 'lucideLockKeyhole',
  auditoria: 'lucideScrollText',
} as const satisfies Record<string, NomeIcone>;

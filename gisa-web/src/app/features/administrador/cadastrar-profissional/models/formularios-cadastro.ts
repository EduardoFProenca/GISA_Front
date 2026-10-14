import { ComErros } from '../../../../shared/components/com-erros';

export interface DadosPessoaisForm extends ComErros {
  nome: string;
  cpf: string;
  email: string;
  dataNascimento: string;
  sexo: string;
  celular: string;
  estadoCivil: string;
  numCNS: string;
}

export interface ContatoForm extends ComErros {
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface InfoProfissionalForm extends ComErros {
  // idCargo (texto do select).
  cargo: string;
}

export interface InfoUsuarioForm extends ComErros {
  // true = o cadastro já tem usuário (edição): só o perfil pode mudar.
  possuiAcesso: boolean;
  temAcessoSistema: boolean;
  senha: string;
  // idPerfil (texto do select).
  perfil: string;
  // false = quem está logado não tem GERENCIAR_USUARIOS: não cria acesso nem troca perfil.
  podeGerenciarAcesso?: boolean;
  // Perfil carregado na edição (para só mandar idPerfil se mudou).
  perfilOriginal?: string;
}

export interface OpcaoEspecialidade {
  valor: string;
  label: string;
}

export interface JornadaForm {
  diaSemana: string | number;
  horaInicio: string;
  horaTermino: string;
}

export interface InfoEspecialistaForm extends ComErros {
  ehEspecialista: boolean;
  registroProfissional: string;
  // idEspecialidade (texto do select).
  especialidades: string[];
  opcoesEspecialidade: OpcaoEspecialidade[];
  jornadas: JornadaForm[];
  atuaComoPJ: boolean;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  inscricaoEstadual: string;
}

export interface FormulariosCadastro {
  dadosPessoais: DadosPessoaisForm;
  contato: ContatoForm;
  infoProfissional: InfoProfissionalForm;
  infoUsuario: InfoUsuarioForm;
  infoEspecialista: InfoEspecialistaForm;
}

export function listaErros(f: FormulariosCadastro): ComErros[] {
  return [f.dadosPessoais, f.contato, f.infoProfissional, f.infoUsuario, f.infoEspecialista];
}
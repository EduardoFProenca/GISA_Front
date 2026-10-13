import { ComErros } from '../../../../shared/components/com-erros';
import { GrauParentesco } from '../../../../core/models/paciente.model';
import { TipoEscola } from '../../../../core/models/escola.model';
import { Escola } from '../../../../core/models/escola.model';
import { CidSelecionado } from '../../../../core/services/cid';
import { ContatoForm, DadosPessoaisForm } from '../../../administrador/cadastrar-profissional/models/formularios-cadastro';

export type { ContatoForm, DadosPessoaisForm };

export interface InfoPacienteForm extends ComErros {
  convenio: boolean;
}

export interface InfoEscolaForm extends ComErros {
  nome: string;
  tipoEscola: TipoEscola | '';
  telefone: string;
  escolaSelecionada: Escola | null;
}

export interface InfoProntuarioForm extends ComErros {
  alergias: string;
  comorbidade: string;
  mobilidade: string;
}

export interface EnderecoForm {
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface ResponsavelItem {
  // Preenchido quando o responsável já existe na base (edição): CPF, nascimento e sexo ficam bloqueados.
  idResponsavel?: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  estadoCivil: string;
  celular: string;
  ocupacao: string;
  grauParentesco: GrauParentesco | '';
  naoResideComPaciente: boolean;
  endereco: EnderecoForm | null; // só preenchido quando naoResideComPaciente = true
}

export interface InfoResponsavelForm extends ComErros {
  listaResponsaveis: ResponsavelItem[];
  exibindoFormulario: boolean;
}

export interface InfoCidForm extends ComErros {
  listaCids: () => CidSelecionado[];
}

export interface FormulariosPaciente {
  dadosPessoais: DadosPessoaisForm;
  contato: ContatoForm;
  infoPaciente: InfoPacienteForm;
  infoResponsavel: InfoResponsavelForm;
  infoEscola: InfoEscolaForm;
  infoProntuario: InfoProntuarioForm;
  infoCid: InfoCidForm;
}

export function listaErros(f: FormulariosPaciente): ComErros[] {
  return [f.dadosPessoais, f.contato, f.infoPaciente, f.infoResponsavel, f.infoEscola, f.infoProntuario, f.infoCid];
}

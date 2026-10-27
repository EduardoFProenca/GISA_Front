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

  // Responsável já cadastrado, escolhido na busca e ainda não vinculado a este paciente: vai com
  // idResponsavel no POST e a API mantém os dados dele (por isso os campos ficam bloqueados).
  reaproveitado?: boolean;
  // Cadastro inativo: é reativado depois de vinculado.
  inativo?: boolean;
  // Endereço que o responsável já tem cadastrado (null = nenhum). Quem passa a residir com o paciente
  // precisa ter o mesmo endereço dele (ou nenhum); se o paciente ainda não tem, pode usar este.
  enderecoCadastro?: EnderecoForm | null;
  // Edição: o vínculo já constava como "reside com o paciente" (vai junto se o endereço mudar).
  resideAntes?: boolean;
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

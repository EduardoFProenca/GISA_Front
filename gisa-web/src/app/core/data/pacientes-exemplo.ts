// Pacientes FICTÍCIOS (nomes, CPFs e telefones inventados) para demonstração das telas.
// Usados enquanto environment.usarDadosExemplo = true (ver PacienteService).
import { PacienteLista } from '../models/paciente-resumo.model';
import { PacienteDetalhe } from '../models/paciente-detalhe.model';

export function calcularIdade(dataNascimento: string, hoje: Date = new Date()): number {
  const [ano, mes, dia] = dataNascimento.split('-').map(Number);
  let idade = hoje.getFullYear() - ano;
  const fezAniversario = hoje.getMonth() + 1 > mes || (hoje.getMonth() + 1 === mes && hoje.getDate() >= dia);
  if (!fezAniversario) idade--;
  return idade;
}

export function paraLista(p: PacienteDetalhe): PacienteLista {
  return {
    idCadastro: p.idCadastro,
    nome: p.nome,
    idade: calcularIdade(p.dataNascimento),
    cpf: p.cpf,
    responsaveis: p.responsaveis.map((r) => ({ nome: r.nome, celular: r.celular, grauParentesco: r.grauParentesco })),
    cids: p.cids,
    statusPaciente: p.statusPaciente,
  };
}

export const PACIENTES_EXEMPLO: PacienteDetalhe[] = [
  {
    idCadastro: 1,
    nome: 'Lucas Oliveira Santos',
    dataNascimento: '2015-05-10',
    sexo: 'M',
    statusPaciente: 'MATRICULADO',
    convenio: false,
    endereco: {
      cep: '01001000',
      endereco: 'Praça da Sé',
      numero: '100',
      complemento: '',
      bairro: 'Sé',
      cidade: 'São Paulo',
      uf: 'SP',
    },
    escola: {
      nome: 'Escola Municipal Monteiro Lobato',
      tipoEscola: 'PUBLICA',
      telefone: '1133330000',
    },
    responsaveis: [
      { nome: 'Maria Santos', cpf: '52601815906', celular: '11908301661', grauParentesco: 'MAE' },
      { nome: 'Carlos Santos', cpf: '31860913903', celular: '11909960308', grauParentesco: 'PAI' },
    ],
    prontuario: {
      alergias: 'Nenhuma conhecida',
      comorbidade: 'Rinite alérgica',
      mobilidade: 'Anda sem auxílio',
    },
    cids: [
      { codigoCID: 'F84.0', descricao: 'Autismo infantil' },
    ],
    cpf: '59013962432',
    estadoCivil: 'SOLTEIRO',
    celular: null,
    numCNS: '595711777741215',
  },
  {
    idCadastro: 2,
    nome: 'Ana Clara Ferreira',
    dataNascimento: '2012-09-23',
    sexo: 'F',
    statusPaciente: 'MATRICULADO',
    convenio: true,
    endereco: {
      cep: '13015904',
      endereco: 'Rua Barão de Jaguara',
      numero: '850',
      complemento: 'Apto 32',
      bairro: 'Centro',
      cidade: 'Campinas',
      uf: 'SP',
    },
    escola: {
      nome: 'Colégio Pequeno Aprendiz',
      tipoEscola: 'PARTICULAR',
      telefone: '1144441111',
    },
    responsaveis: [
      { nome: 'Juliana Ferreira', cpf: '24628194874', celular: '11921993518', grauParentesco: 'MAE' },
    ],
    prontuario: {
      alergias: 'Dipirona',
      comorbidade: 'Cardiopatia leve',
      mobilidade: 'Anda sem auxílio',
    },
    cids: [
      { codigoCID: 'Q90.9', descricao: 'Síndrome de Down não especificada' },
    ],
    cpf: '47280385214',
    estadoCivil: 'SOLTEIRO',
    celular: null,
    numCNS: '808414852538885',
  },
  {
    idCadastro: 3,
    nome: 'Pedro Henrique Lima',
    dataNascimento: '2018-02-14',
    sexo: 'M',
    statusPaciente: 'MATRICULADO',
    convenio: false,
    endereco: {
      cep: '13170010',
      endereco: 'Rua das Acácias',
      numero: '45',
      complemento: '',
      bairro: 'Jardim Primavera',
      cidade: 'Sumaré',
      uf: 'SP',
    },
    escola: null,
    responsaveis: [
      { nome: 'Roberto Lima', cpf: '19093786580', celular: '11979754323', grauParentesco: 'PAI' },
      { nome: 'Sandra Lima', cpf: '19487574948', celular: '11911862527', grauParentesco: 'MAE' },
    ],
    prontuario: {
      alergias: 'Nenhuma conhecida',
      comorbidade: '',
      mobilidade: 'Anda sem auxílio',
    },
    cids: [
      { codigoCID: 'F71', descricao: 'Retardo mental moderado' },
    ],
    cpf: '39336338773',
    estadoCivil: 'SOLTEIRO',
    celular: null,
    numCNS: '500474395755131',
  },
  {
    idCadastro: 4,
    nome: 'Beatriz Almeida Costa',
    dataNascimento: '2010-11-30',
    sexo: 'F',
    statusPaciente: 'ALTA',
    convenio: false,
    endereco: {
      cep: '04538133',
      endereco: 'Av. Brigadeiro Faria Lima',
      numero: '1500',
      complemento: 'Bloco B',
      bairro: 'Itaim Bibi',
      cidade: 'São Paulo',
      uf: 'SP',
    },
    escola: {
      nome: 'Escola Estadual Prof. Carlos Drummond',
      tipoEscola: 'PUBLICA',
      telefone: '1155552222',
    },
    responsaveis: [
      { nome: 'Helena Costa', cpf: '60189555980', celular: '11979711471', grauParentesco: 'AVO' },
    ],
    prontuario: {
      alergias: 'Látex',
      comorbidade: 'Epilepsia controlada',
      mobilidade: 'Cadeira de rodas',
    },
    cids: [
      { codigoCID: 'G80.9', descricao: 'Paralisia cerebral não especificada' },
    ],
    cpf: '37353799072',
    estadoCivil: 'SOLTEIRO',
    celular: null,
    numCNS: '751163726516761',
  },
  {
    idCadastro: 5,
    nome: 'Gabriel Rodrigues Nunes',
    dataNascimento: '2014-07-08',
    sexo: 'M',
    statusPaciente: 'MATRICULADO',
    convenio: false,
    endereco: {
      cep: '13025320',
      endereco: 'Rua Dr. Quirino',
      numero: '210',
      complemento: 'Casa 2',
      bairro: 'Centro',
      cidade: 'Campinas',
      uf: 'SP',
    },
    escola: {
      nome: 'Escola Municipal Monteiro Lobato',
      tipoEscola: 'PUBLICA',
      telefone: '1133330000',
    },
    responsaveis: [
      { nome: 'Patrícia Nunes', cpf: '04974650785', celular: '11952917034', grauParentesco: 'MAE' },
    ],
    prontuario: {
      alergias: 'Lactose',
      comorbidade: '',
      mobilidade: 'Anda sem auxílio',
    },
    cids: [
      { codigoCID: 'F90.0', descricao: 'Distúrbios da atividade e da atenção' },
      { codigoCID: 'F80.1', descricao: 'Transtorno expressivo da linguagem' },
    ],
    cpf: '22202972927',
    estadoCivil: 'SOLTEIRO',
    celular: null,
    numCNS: '975288200182633',
  },
  {
    idCadastro: 6,
    nome: 'Larissa Martins Rocha',
    dataNascimento: '2009-04-19',
    sexo: 'F',
    statusPaciente: 'DESLIGADO',
    convenio: false,
    endereco: {
      cep: '13400100',
      endereco: 'Rua Governador Pedro de Toledo',
      numero: '77',
      complemento: '',
      bairro: 'Alto',
      cidade: 'Piracicaba',
      uf: 'SP',
    },
    escola: null,
    responsaveis: [
      { nome: 'Marcos Rocha', cpf: '23667127669', celular: '11984268465', grauParentesco: 'TUTOR_LEGAL' },
    ],
    prontuario: {
      alergias: 'Nenhuma conhecida',
      comorbidade: '',
      mobilidade: 'Anda sem auxílio',
    },
    cids: [
      { codigoCID: 'F70', descricao: 'Retardo mental leve' },
    ],
    cpf: '04348395403',
    estadoCivil: 'SOLTEIRO',
    celular: null,
    numCNS: '862057986828288',
  },
  {
    idCadastro: 7,
    nome: 'Miguel Araújo Pereira',
    dataNascimento: '2016-12-02',
    sexo: 'M',
    statusPaciente: 'MATRICULADO',
    convenio: true,
    endereco: {
      cep: '13165000',
      endereco: 'Av. Rebouças',
      numero: '320',
      complemento: '',
      bairro: 'Vila Real',
      cidade: 'Sumaré',
      uf: 'SP',
    },
    escola: {
      nome: 'Escola Estadual Prof. Carlos Drummond',
      tipoEscola: 'PUBLICA',
      telefone: '1155552222',
    },
    responsaveis: [
      { nome: 'Fernanda Pereira', cpf: '63212233010', celular: '11979244026', grauParentesco: 'MAE' },
      { nome: 'André Pereira', cpf: '85995289047', celular: '11978666617', grauParentesco: 'PAI' },
    ],
    prontuario: {
      alergias: 'Penicilina',
      comorbidade: 'Asma',
      mobilidade: 'Uso de órtese nos pés',
    },
    cids: [
      { codigoCID: 'F84.0', descricao: 'Autismo infantil' },
      { codigoCID: 'G40.9', descricao: 'Epilepsia, não especificada' },
    ],
    cpf: '07290222776',
    estadoCivil: 'SOLTEIRO',
    celular: null,
    numCNS: '918058887180334',
  },
  {
    idCadastro: 8,
    nome: 'Sofia Gonçalves Barbosa',
    dataNascimento: '2013-01-27',
    sexo: 'F',
    statusPaciente: 'MATRICULADO',
    convenio: false,
    endereco: {
      cep: '13560200',
      endereco: 'Rua Episcopal',
      numero: '612',
      complemento: 'Fundos',
      bairro: 'Centro',
      cidade: 'São Carlos',
      uf: 'SP',
    },
    escola: {
      nome: 'Colégio Pequeno Aprendiz',
      tipoEscola: 'PARTICULAR',
      telefone: '1144441111',
    },
    responsaveis: [
      { nome: 'Daniel Barbosa', cpf: '60313721505', celular: '11990109281', grauParentesco: 'PAI' },
    ],
    prontuario: {
      alergias: 'Nenhuma conhecida',
      comorbidade: '',
      mobilidade: 'Anda sem auxílio',
    },
    cids: [
      { codigoCID: 'F84.1', descricao: 'Autismo atípico' },
    ],
    cpf: '01878017543',
    estadoCivil: 'SOLTEIRO',
    celular: null,
    numCNS: '989834788783848',
  }
];

import { ProfissionalDetalhe } from '../../../core/models/profissional.model';
import { soDigitos } from '../../../shared/utils/texto.util';

export interface FormulariosDetalhe {
  status: 'ATIVO' | 'INATIVO';
  dadosPessoais: Record<string, unknown>;
  contato: Record<string, unknown>;
  infoProfissional: Record<string, unknown>;
  infoUsuario: Record<string, unknown>;
  infoEspecialista: Record<string, unknown>;
}

function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// "Assistente Social" -> "ASSISTENTE_SOCIAL" (inverso de idCargoPorNome)
export function cargoParaValor(nome: string | null | undefined): string {
  return semAcento(nome ?? '').trim().toUpperCase().replace(/\s+/g, '_');
}

// "Clínica Geral" -> "clinica-geral" (valores do select de especialidades)
export function especialidadeParaValor(nome: string): string {
  return semAcento(nome).trim().toLowerCase().replace(/\s+/g, '-');
}

export function formatarCpf(valor: string | null | undefined): string {
  const d = soDigitos(valor);
  return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : (valor ?? '');
}

export function formatarCnpj(valor: string | null | undefined): string {
  const d = soDigitos(valor);
  return d.length === 14
    ? d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    : (valor ?? '');
}

export function formatarCelular(valor: string | null | undefined): string {
  const d = soDigitos(valor);
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return valor ?? '';
}

export function formatarCep(valor: string | null | undefined): string {
  const d = soDigitos(valor);
  return d.length === 8 ? d.replace(/(\d{5})(\d{3})/, '$1-$2') : (valor ?? '');
}

export function formatarCns(valor: string | null | undefined): string {
  const d = soDigitos(valor);
  return d.length === 15 ? d.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4') : (valor ?? '');
}

// Converte a resposta da API nos valores que os formulários compartilhados esperam.
export function paraFormularios(detalhe: ProfissionalDetalhe): FormulariosDetalhe {
  const { pessoa, email, cargo } = detalhe.profissional;
  const endereco = pessoa.enderecos?.[0];
  const esp = detalhe.especialista;
  const pj = detalhe.pj;

  const infoEspecialista = esp
    ? {
        ehEspecialista: true,
        registroProfissional: esp.registroConselho ?? '',
        atuaComoPJ: !!pj,
        cnpj: formatarCnpj(pj?.cnpj),
        razaoSocial: pj?.razaoSocial ?? '',
        nomeFantasia: pj?.nomeFantasia ?? '',
        inscricaoEstadual: pj?.inscricaoEstadual ?? '',
        especialidades: esp.especialidades?.length
          ? esp.especialidades.map((e) => especialidadeParaValor(e.nome))
          : [''],
        jornadas: esp.jornadas?.length
          ? esp.jornadas.map((j) => ({
              diaSemana: j.diaSemana,
              horaInicio: (j.horaInicio ?? '').slice(0, 5),
              horaTermino: (j.horaTermino ?? '').slice(0, 5),
            }))
          : [{ diaSemana: '', horaInicio: '', horaTermino: '' }],
      }
    : { ehEspecialista: false };

  return {
    status: pessoa.statusCadastro === 'INATIVO' ? 'INATIVO' : 'ATIVO',
    dadosPessoais: {
      nome: pessoa.nome ?? '',
      cpf: formatarCpf(pessoa.cpf),
      email: email ?? '',
      dataNascimento: pessoa.dataNascimento ?? '',
      sexo: pessoa.sexo ?? '',
      celular: formatarCelular(pessoa.celular),
      estadoCivil: pessoa.estadoCivil ?? '',
      numCNS: formatarCns(pessoa.numCNS),
    },
    contato: {
      cep: formatarCep(endereco?.cep),
      endereco: endereco?.rua ?? '',
      numero: endereco?.numero ?? '',
      complemento: endereco?.complemento ?? '',
      bairro: endereco?.bairro ?? '',
      cidade: endereco?.cidade ?? '',
      uf: endereco?.estado ?? '',
    },
    infoProfissional: {
      cargo: cargoParaValor(cargo?.nome),
      codigoCBO: cargo?.codigoCBO ?? '',
    },
    // TODO(Kauã): a resposta de GET /profissionais/{id} não traz usuário/perfil.
    infoUsuario: {},
    infoEspecialista,
  };
}
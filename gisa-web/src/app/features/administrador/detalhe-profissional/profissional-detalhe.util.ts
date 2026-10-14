import { ProfissionalDetalhe } from '../../../core/models/profissional.model';
import { formatarCelular, formatarCep, formatarCnpj, formatarCns, formatarCpf } from '../../../shared/utils/formatacao.util';

export interface FormulariosDetalhe {
  status: 'ATIVO' | 'INATIVO';
  dadosPessoais: Record<string, unknown>;
  contato: Record<string, unknown>;
  infoProfissional: Record<string, unknown>;
  infoUsuario: Record<string, unknown>;
  infoEspecialista: Record<string, unknown>;
}

// Converte a resposta da API nos valores que os formulários compartilhados esperam.
export function paraFormularios(detalhe: ProfissionalDetalhe): FormulariosDetalhe {
  const { pessoa, email, cargo, usuario } = detalhe.profissional;
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
          ? esp.especialidades.map((e) => String(e.idEspecialidade))
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
      cargo: cargo ? String(cargo.idCargo) : '',
    },
    infoUsuario: {
      possuiAcesso: !!usuario,
      temAcessoSistema: false,
      senha: '',
      perfil: usuario ? String(usuario.perfil.idPerfil) : '',
    },
    infoEspecialista,
  };
}
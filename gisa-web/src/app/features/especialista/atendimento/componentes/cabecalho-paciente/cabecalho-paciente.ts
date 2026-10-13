import { Component, Input } from '@angular/core';
import { Paciente } from '../../../../../core/models/paciente.model';
import { dataCurta, idadeEmAnos } from '../../../../../shared/utils/data.util';
import { formatarCpf } from '../../../../../shared/utils/formatacao.util';
import { ROTULO_TIPO_ESCOLA } from '../../../../../shared/utils/rotulos.util';
import { formatarMatricula } from '../../../agenda/agenda.util';

export interface AlertaClinico {
  rotulo: string;
  texto: string;
}

// Texto livre do prontuário que significa "nada a registrar".
function relevante(texto: string | null | undefined): string | null {
  const t = (texto ?? '').trim();
  return t && !/^(nenhum[ao]?s?|n[aã]o( possui| tem)?|—|-)\.?$/i.test(t) ? t : null;
}

// Cabeçalho fixo do prontuário: identificação e alertas clínicos em destaque.
@Component({
  selector: 'app-cabecalho-paciente',
  imports: [],
  templateUrl: './cabecalho-paciente.html',
  styleUrl: './cabecalho-paciente.scss',
})
export class CabecalhoPaciente {
  @Input({ required: true }) paciente!: Paciente;

  get matricula(): string {
    return formatarMatricula(this.paciente.pessoa.idCadastro);
  }
  get cpf(): string {
    return formatarCpf(this.paciente.pessoa.cpf);
  }
  get nascimento(): string {
    return dataCurta(this.paciente.pessoa.dataNascimento);
  }
  get idade(): string {
    const anos = idadeEmAnos(this.paciente.pessoa.dataNascimento);
    return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
  }
  get responsavel(): string {
    return this.paciente.responsaveis[0]?.responsavel.nome ?? '—';
  }
  get escola(): string {
    const e = this.paciente.escola;
    return e ? ROTULO_TIPO_ESCOLA[e.tipoEscola] : 'Sem escola informada';
  }
  get convenio(): string {
    return this.paciente.convenio ? 'Sim' : 'Não';
  }
  get iniciais(): string {
    return this.paciente.pessoa.nome.trim().charAt(0).toUpperCase();
  }

  get alertas(): AlertaClinico[] {
    const p = this.paciente.prontuario;
    return [
      { rotulo: 'Alergias', texto: relevante(p?.alergias) },
      { rotulo: 'Comorbidades', texto: relevante(p?.comorbidade) },
      { rotulo: 'Mobilidade', texto: relevante(p?.mobilidade) },
    ].filter((a): a is AlertaClinico => a.texto !== null);
  }
}

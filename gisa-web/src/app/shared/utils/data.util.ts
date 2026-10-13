// Datas locais (não UTC) no formato yyyy-MM-dd.

export function paraIso(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function deIso(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function hojeIso(): string {
  return paraIso(new Date());
}

export function somarDias(iso: string, dias: number): string {
  const d = deIso(iso);
  d.setDate(d.getDate() + dias);
  return paraIso(d);
}

export function dataExtenso(iso: string): string {
  return deIso(iso).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
// Data e hora vindas da API em UTC (ex.: '2026-10-13T17:32:10Z') no horário local: "13/10/2026 14:32".
export function dataHoraLocal(isoUtc: string): string {
  const d = new Date(isoUtc);
  if (isNaN(d.getTime())) return isoUtc;
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// yyyy-MM-dd -> dd/MM/yyyy
export function dataCurta(iso: string | null | undefined): string {
  if (!iso) return '';
  const [ano, mes, dia] = iso.split('-');
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : iso;
}

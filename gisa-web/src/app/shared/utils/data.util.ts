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


// Idade em anos completos a partir de yyyy-MM-dd.
export function idadeEmAnos(dataNascimento: string, hoje: Date = new Date()): number {
  const nasc = deIso(dataNascimento.slice(0, 10));
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const fezAniversario =
    hoje.getMonth() > nasc.getMonth() ||
    (hoje.getMonth() === nasc.getMonth() && hoje.getDate() >= nasc.getDate());
  if (!fezAniversario) idade--;
  return idade;
}

// 'HH:mm:ss' ou 'HH:mm' -> 'HH:mm'
export function horaCurta(hora: string): string {
  return (hora ?? '').slice(0, 5);
}

// Date -> 'yyyy-MM-ddTHH:mm' no horário local (comparação de horários de terapia).
export function paraIsoMinuto(d: Date): string {
  return `${paraIso(d)}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Diferença em dias inteiros entre duas datas yyyy-MM-dd (fim - inicio).
export function diasEntre(inicioIso: string, fimIso: string): number {
  return Math.round((deIso(fimIso).getTime() - deIso(inicioIso).getTime()) / 86_400_000);
}

// Data (yyyy-MM-dd) depois de hoje — nascimento e afins não podem ser no futuro.
export function dataFutura(iso: string | null | undefined): boolean {
  return !!iso && iso.slice(0, 10) > hojeIso();
}

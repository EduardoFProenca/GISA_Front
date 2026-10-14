// Gera public/data/cbo2002.json a partir da tabela oficial da CBO 2002 (Ministério do Trabalho).
//
// 1. Baixe: https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads/cbo2002-ocupacao.csv
// 2. Rode (na pasta gisa-web):  node scripts/gerar-cbo.mjs <caminho-do-cbo2002-ocupacao.csv>
//
// O CSV vem em ISO-8859-1, separado por ";", com cabeçalho CODIGO;TITULO (código com 6 dígitos).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const arquivo = process.argv[2];
if (!arquivo) {
  console.error('Uso: node scripts/gerar-cbo.mjs <cbo2002-ocupacao.csv>');
  process.exit(1);
}

const texto = new TextDecoder('latin1').decode(readFileSync(arquivo));
const ocupacoes = texto
  .split(/\r?\n/)
  .slice(1)
  .map((linha) => linha.split(';').map((parte) => parte.trim()))
  .filter(([codigo, titulo]) => /^\d{6}$/.test(codigo ?? '') && titulo)
  .sort(([a], [b]) => a.localeCompare(b));

const saida = {
  fonte: 'Ministério do Trabalho e Emprego - CBO 2002, ocupações (gov.br/trabalho-e-emprego, assuntos/cbo)',
  total: ocupacoes.length,
  ocupacoes,
};

mkdirSync('public/data', { recursive: true });
writeFileSync('public/data/cbo2002.json', JSON.stringify(saida));
console.log(`public/data/cbo2002.json: ${ocupacoes.length} ocupações`);

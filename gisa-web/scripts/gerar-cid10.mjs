// Gera public/data/cid10.json a partir da tabela oficial do CID-10 do DATASUS.
//
// 1. Baixe e extraia: http://www2.datasus.gov.br/cid10/V2008/downloads/CID10CSV.zip
// 2. Rode (na pasta gisa-web):  node scripts/gerar-cid10.mjs <pasta-com-os-CSVs>
//
// Usa CID-10-CATEGORIAS.CSV (ex.: F84) e CID-10-SUBCATEGORIAS.CSV (ex.: F840 -> F84.0).
// Os CSVs vêm em ISO-8859-1, separados por ";" e com cabeçalho na primeira linha.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const pasta = process.argv[2];
if (!pasta) {
  console.error('Uso: node scripts/gerar-cid10.mjs <pasta-com-os-CSVs-do-DATASUS>');
  process.exit(1);
}

function lerCsv(arquivo) {
  const texto = new TextDecoder('latin1').decode(readFileSync(join(pasta, arquivo)));
  return texto
    .split(/\r?\n/)
    .slice(1)
    .filter((linha) => linha.trim())
    .map((linha) => linha.split(';'));
}

const cids = new Map();

// CAT;CLASSIF;DESCRICAO;...
for (const [cat, , descricao] of lerCsv('CID-10-CATEGORIAS.CSV')) {
  cids.set(cat.trim(), descricao.trim());
}

// SUBCAT;CLASSIF;RESTRSEXO;CAUSAOBITO;DESCRICAO;...  (SUBCAT sem ponto: A000 -> A00.0).
// Categorias sem subdivisão também aparecem aqui só com 3 caracteres (A09): ficam como estão.
for (const [subcat, , , , descricao] of lerCsv('CID-10-SUBCATEGORIAS.CSV')) {
  const codigo = subcat.trim();
  cids.set(codigo.length > 3 ? `${codigo.slice(0, 3)}.${codigo.slice(3)}` : codigo, descricao.trim());
}

const lista = [...cids.entries()].sort(([a], [b]) => a.localeCompare(b));
const saida = {
  fonte: 'DATASUS - CID-10, versão 2008 (http://www2.datasus.gov.br/cid10/V2008/)',
  total: lista.length,
  cids: lista,
};

mkdirSync('public/data', { recursive: true });
writeFileSync('public/data/cid10.json', JSON.stringify(saida));
console.log(`public/data/cid10.json: ${lista.length} códigos`);

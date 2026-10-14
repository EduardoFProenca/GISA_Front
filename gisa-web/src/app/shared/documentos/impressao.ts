const ID_AREA = 'area-impressao';

// Imprime só a folha do documento (atestado, receita, recusa). O navegador oferece "Salvar como PDF".
// A folha é copiada para um contêiner direto no <body>; na impressão todo o resto do app sai
// (display: none), então não sobram páginas em branco e documentos longos quebram normalmente
// em várias páginas. Ver regras @media print em folha-documento.scss.
export function imprimirDocumento(): void {
  const folha = document.querySelector('.documento-folha');
  if (!folha) return;

  document.getElementById(ID_AREA)?.remove();
  const area = document.createElement('div');
  area.id = ID_AREA;
  area.appendChild(folha.cloneNode(true));
  document.body.appendChild(area);

  const limpar = () => area.remove();
  window.addEventListener('afterprint', limpar, { once: true });
  window.print();
}

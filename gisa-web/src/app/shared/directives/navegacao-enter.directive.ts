import { Directive, HostListener } from '@angular/core';

// Onde a navegação vale: diálogos, <form>, cartões de formulário e painéis de documento.
// Fora deles (ex.: buscas das listagens) o ENTER mantém o comportamento normal.
const AREA_FORMULARIO = '[role="dialog"], form, .card-form, .pagina-documento';

const CAMPOS = 'input, select, textarea';
// Botão que conclui a área (destino do ENTER no último campo). Não é clicado, só recebe o foco.
const BOTAO_CONCLUIR = '.btn-salvar, .btn-confirmar, .btn-emitir, button[type="submit"]';

// ENTER num campo leva o foco ao próximo campo editável da mesma área (o campo destacado é o com
// foco, e a tela rola até ele). No último campo, o foco vai para o botão de salvar/confirmar, sem
// enviar. Textarea mantém o ENTER para quebrar linha; no checkbox, ESPAÇO marca e ENTER avança.
// Um campo com `data-enter-nativo` mantém o seu próprio ENTER (ex.: confirmar uma justificativa).
// Uso: no contêiner das telas logadas, <div appNavegacaoEnter>.
@Directive({ selector: '[appNavegacaoEnter]' })
export class NavegacaoEnter {
  @HostListener('keydown', ['$event'])
  aoPressionarTecla(evento: KeyboardEvent) {
    if (evento.key !== 'Enter' || evento.isComposing || evento.shiftKey || evento.ctrlKey || evento.altKey || evento.metaKey) {
      return;
    }
    const campo = evento.target as HTMLElement;
    if (!(campo instanceof HTMLInputElement || campo instanceof HTMLSelectElement)) return;
    if (campo instanceof HTMLInputElement && ['button', 'submit', 'reset', 'file', 'image'].includes(campo.type)) return;
    if (campo.closest('[data-enter-nativo]')) return;

    const area = campo.closest<HTMLElement>(AREA_FORMULARIO);
    if (!area) return;

    const destino = this.proximoCampo(area, campo) ?? this.botaoConcluir(area);
    if (!destino) return; // nada para onde ir: o ENTER segue normal

    evento.preventDefault();
    destino.focus({ preventScroll: true });
    destino.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  private proximoCampo(area: HTMLElement, atual: HTMLElement): HTMLElement | null {
    const campos = Array.from(area.querySelectorAll<HTMLElement>(CAMPOS));
    const indice = campos.indexOf(atual);
    return campos.slice(indice + 1).find((c) => this.editavel(c)) ?? null;
  }

  // No cartão de formulário o Salvar fica no cabeçalho da página, fora da área.
  private botaoConcluir(area: HTMLElement): HTMLElement | null {
    const candidatos = [
      ...Array.from(area.querySelectorAll<HTMLButtonElement>(BOTAO_CONCLUIR)),
      ...(area.matches('.card-form, .pagina-documento')
        ? Array.from(document.querySelectorAll<HTMLButtonElement>('app-cabecalho-pagina .btn-salvar'))
        : []),
    ];
    return candidatos.find((b) => !b.disabled && this.visivel(b)) ?? null;
  }

  private editavel(campo: HTMLElement): boolean {
    if (campo instanceof HTMLInputElement && ['hidden', 'button', 'submit', 'reset', 'file', 'image'].includes(campo.type)) {
      return false;
    }
    const c = campo as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (c.disabled || ('readOnly' in c && c.readOnly) || campo.tabIndex < 0) return false;
    return this.visivel(campo);
  }

  private visivel(el: HTMLElement): boolean {
    return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  }
}

import { Component, ElementRef, HostListener, Input, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Auth } from '../../../core/auth/auth';
import { NotificacaoService, tempoDecorrido } from '../../../services/notificacao';
import { ICONES } from '../../icons';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  auth = inject(Auth);
  notificacoes = inject(NotificacaoService);
  private elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  icones = ICONES;
  tempo = tempoDecorrido;

  // Usados enquanto não há usuário logado com nome/cargo conhecidos.
  @Input() tituloPortal: string = '';
  @Input() subtituloPortal: string = '';

  painelAberto = signal(false);

  constructor(private sanitizer: DomSanitizer) {}

  get nome(): string {
    return this.auth.usuarioAtual()?.nome || this.tituloPortal;
  }

  get funcao(): string {
    return this.auth.usuarioAtual()?.cargo || this.subtituloPortal;
  }

  sanitizarIcone(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  alternarPainel() {
    this.painelAberto.update((aberto) => !aberto);
  }

  sair() {
    this.painelAberto.set(false);
    this.auth.logout();
  }

  @HostListener('document:click', ['$event'])
  aoClicarFora(evento: MouseEvent) {
    if (!this.elemento.nativeElement.contains(evento.target as Node)) {
      this.painelAberto.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  aoPressionarEsc() {
    this.painelAberto.set(false);
  }
}
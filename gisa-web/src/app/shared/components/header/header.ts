import { Component, ElementRef, HostListener, Input, inject, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../core/auth/auth';
import { Layout } from '../../../core/layout/layout';
import { NotificacaoService, tempoDecorrido } from '../../../core/services/notificacao';
import { ICONES } from '../../icons';

@Component({
  selector: 'app-header',
  imports: [NgIcon, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  auth = inject(Auth);
  layout = inject(Layout);
  notificacoes = inject(NotificacaoService);
  private elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  icones = ICONES;
  tempo = tempoDecorrido;

  // Usados enquanto o usuário logado ainda não foi carregado.
  @Input() tituloPortal: string = '';
  @Input() subtituloPortal: string = '';
  // Botão ☰ do menu lateral. O header só aparece nos dashboards, onde o menu fica escondido
  // (navegação pelo Gestão Rápida); nas demais telas o ☰ está no cabeçalho da página.
  @Input() mostrarBotaoMenu: boolean = false;

  // Escondido até a API ter endpoint de notificações: hoje elas só existiriam na sessão
  // do navegador e sumiriam ao recarregar (ver NotificacaoService).
  readonly exibirNotificacoes = false;

  painelAberto = signal(false);

  readonly rotaSenha = '/minha-senha';

  get nome(): string {
    return this.auth.usuarioAtual()?.nome || this.tituloPortal;
  }

  get funcao(): string {
    return this.auth.usuarioAtual()?.perfil.nome || this.subtituloPortal;
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
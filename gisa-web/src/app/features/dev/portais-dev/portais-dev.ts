import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// TEMPORÁRIO: atalho para navegar entre os portais enquanto a API não devolve o perfil no login.
// TODO: remover quando o login redirecionar pelo perfil do usuário.
@Component({
  selector: 'app-portais-dev',
  imports: [RouterLink],
  templateUrl: './portais-dev.html',
  styleUrl: './portais-dev.scss',
})
export class PortaisDev {
  portais = [
    { titulo: 'Administrador', descricao: 'Profissionais, pacientes e consultas', rota: '/administrador' },
    { titulo: 'Recepção', descricao: 'Presença, agendamentos, recusas', rota: '/recepcionista' },
    { titulo: 'Assistente Social', descricao: 'Histórico e dados de saúde', rota: '/assistente-social' },
  ];
}
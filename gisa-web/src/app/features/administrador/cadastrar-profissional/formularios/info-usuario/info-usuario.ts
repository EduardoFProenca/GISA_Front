import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type Perfil = 'ADMINISTRADOR' | 'MEDICO' | 'RECEPCIONISTA' | 'ASSISTENTE_SOCIAL';

export interface Permissao {
  chave: string;
  label: string;
  marcado: boolean;
}

@Component({
  selector: 'app-info-usuario',
  imports: [FormsModule],
  templateUrl: './info-usuario.html',
  styleUrl: './info-usuario.scss',
})
export class InfoUsuario {
  idGerado: string = this.gerarId();
  senha: string = '';
  perfil: Perfil | '' = '';
  idCopiado: boolean = false;

  perfis: { valor: Perfil; label: string }[] = [
    { valor: 'ADMINISTRADOR', label: 'Administrador' },
    { valor: 'MEDICO', label: 'Médico' },
    { valor: 'RECEPCIONISTA', label: 'Recepcionista' },
    { valor: 'ASSISTENTE_SOCIAL', label: 'Assistente Social' },
  ];

  permissoes: Permissao[] = [
    { chave: 'gerenciar_paciente', label: 'Gerenciar Paciente', marcado: false },
    { chave: 'gerenciar_profissional', label: 'Gerenciar Profissional', marcado: false },
    { chave: 'gerenciar_agenda', label: 'Gerenciar Agenda', marcado: false },
    { chave: 'emitir_receita', label: 'Emitir Receita', marcado: false },
    { chave: 'emitir_atestado', label: 'Emitir Atestado', marcado: false },
    { chave: 'emitir_recusa', label: 'Emitir Recusa', marcado: false },
    { chave: 'visualizar_dados_saude', label: 'Visualizar Dados de Saúde', marcado: false },
    { chave: 'gerenciar_historico_social', label: 'Gerenciar Histórico Social', marcado: false },
  ];

  private gerarId(): string {
    const numero = Math.floor(100000 + Math.random() * 900000); // 6 dígitos
    return numero.toString();
  }

  copiarId() {
    navigator.clipboard.writeText(this.idGerado).then(() => {
      this.idCopiado = true;
      setTimeout(() => this.idCopiado = false, 2000);
    });
  }
}
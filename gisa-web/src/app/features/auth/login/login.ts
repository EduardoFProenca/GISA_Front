import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  usuario: string = '';
  senha: string = '';
  mostrarSenha: boolean = false;

  constructor(private router: Router) { }

  fazerLogin() {
    // por enquanto, sem backend: só decide pra onde navegar
    if (this.usuario.includes('medico')) {
      this.router.navigate(['/medico']);
    } else if (this.usuario.includes('recepcao')) {
      this.router.navigate(['/recepcionista']);
    } else {
      alert('Login inválido (versão de teste)');
    }
  }


  toggleSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  esqueciSenha(){
    
  }
}
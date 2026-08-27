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
  email: string = '';
  senha: string = '';

  constructor(private router: Router) {}

  fazerLogin() {
    // por enquanto, sem backend: só decide pra onde navegar
    if (this.email.includes('medico')) {
      this.router.navigate(['/medico']);
    } else if (this.email.includes('recepcao')) {
      this.router.navigate(['/recepcionista']);
    } else {
      alert('Login inválido (versão de teste)');
    }
  }
}
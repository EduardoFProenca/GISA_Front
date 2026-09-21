import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-detalhe-profissional',
  imports: [],
  templateUrl: './detalhe-profissional.html',
  styleUrl: './detalhe-profissional.scss',
})
export class DetalheProfissional {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: string = this.route.snapshot.paramMap.get('id') ?? '';

  irParaEdicao() {
    this.router.navigateByUrl(`/administrador/profissionais/${this.id}/editar`);
  }
}
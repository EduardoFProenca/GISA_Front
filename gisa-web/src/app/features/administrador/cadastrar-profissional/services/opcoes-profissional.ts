import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { Cargo } from '../../../../core/models/cargo.model';
import { Perfil } from '../../../../core/models/perfil.model';
import { Especialidade } from '../../../../core/models/especialidade.model';
import { CargoService } from '../../../../core/services/cargo';
import { PerfilService } from '../../../../core/services/perfil';
import { EspecialidadeService } from '../../../../core/services/especialidade';

export interface OpcoesProfissional {
  cargos: Cargo[];
  perfis: Perfil[];
  especialidades: Especialidade[];
}

// Listas da API usadas pelos selects dos formulários de profissional.
@Injectable({ providedIn: 'root' })
export class OpcoesProfissionalService {
  private cargoService = inject(CargoService);
  private perfilService = inject(PerfilService);
  private especialidadeService = inject(EspecialidadeService);

  carregar(): Observable<OpcoesProfissional> {
    return forkJoin({
      cargos: this.cargoService.listar(),
      perfis: this.perfilService.listar(),
      especialidades: this.especialidadeService.listar(),
    });
  }
}

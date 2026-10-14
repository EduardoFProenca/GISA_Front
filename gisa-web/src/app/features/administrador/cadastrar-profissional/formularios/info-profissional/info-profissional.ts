import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComErros } from '../../../../../shared/components/com-erros';
import { Cargo } from '../../../../../core/models/cargo.model';

// Eager: os erros (ComErros) chegam depois da resposta da API e precisam aparecer.
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-info-profissional',
  imports: [FormsModule],
  templateUrl: './info-profissional.html',
  styleUrl: './info-profissional.scss',
})
export class InfoProfissional extends ComErros implements OnInit {
  @Input() dadosIniciais?: Partial<Pick<InfoProfissional, 'cargo'>>;
  @Input() somenteLeitura: boolean = false;
  // GET /cargos
  @Input() cargos: Cargo[] = [];

  // idCargo (como texto, valor do select).
  cargo: string = '';

  get cargoSelecionado(): Cargo | undefined {
    return this.cargos.find((c) => String(c.idCargo) === this.cargo);
  }

  get cbo(): string {
    const c = this.cargoSelecionado;
    return c ? `${c.codigoCBO} — ${c.tituloCBO}` : '';
  }

  ngOnInit() {
    if (this.dadosIniciais) Object.assign(this, this.dadosIniciais);
  }
}

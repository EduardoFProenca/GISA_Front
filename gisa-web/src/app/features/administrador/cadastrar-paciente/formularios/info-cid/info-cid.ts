import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cid } from '../../../../../core/models/paciente.model';

@Component({
  selector: 'app-info-cid',
  imports: [CommonModule, FormsModule],
  templateUrl: './info-cid.html',
  styleUrl: './info-cid.scss'
})
export class InfoCid {
  codigoInput: string = '';
  descricaoInput: string = '';

  listaCids: Cid[] = [];

  adicionarCid() {
    if (!this.codigoInput.trim() || !this.descricaoInput.trim()) return;

    const novoCid: Cid = {
      codigoCID: this.codigoInput.toUpperCase().trim(),
      descricao: this.descricaoInput.trim()
    };

    // Evita adicionar o mesmo código duplicado
    const jaExiste = this.listaCids.some(c => c.codigoCID === novoCid.codigoCID);
    if (!jaExiste) {
      this.listaCids.push(novoCid);
      this.codigoInput = '';
      this.descricaoInput = '';
    }
  }

  removerCid(index: number) {
    this.listaCids.splice(index, 1);
  }
}
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { Contato } from '../../../shared/components/contato/contato';
import { InfoProfissional } from '../cadastrar-profissional/formularios/info-profissional/info-profissional';
import { InfoUsuario } from '../cadastrar-profissional/formularios/info-usuario/info-usuario';
import { InfoEspecialista } from '../cadastrar-profissional/formularios/info-especialista/info-especialista';
import { ProfissionalService } from '../../../services/profissional';
import { paraFormularios } from './profissional-detalhe.util';

@Component({
  selector: 'app-detalhe-profissional',
  imports: [
    CabecalhoPagina,
    DadosPessoais,
    Contato,
    InfoProfissional,
    InfoUsuario,
    InfoEspecialista,
  ],
  templateUrl: './detalhe-profissional.html',
  styleUrl: './detalhe-profissional.scss',
})
export class DetalheProfissional implements OnInit {
  private route = inject(ActivatedRoute);
  private profissionalService = inject(ProfissionalService);

  id: string = this.route.snapshot.paramMap.get('id') ?? '';

  status: 'ATIVO' | 'INATIVO' = 'ATIVO';

  // Os formulários filhos só leem dadosIniciais no ngOnInit,
  // então o template só os renderiza depois que `carregado` vira true.
  carregado = signal(false);
  erro = signal('');

  dadosPessoais: any = {};
  contato: any = {};
  infoProfissional: any = {};
  infoUsuario: any = {};
  infoEspecialista: any = {};

  ngOnInit() {
    const idNumerico = Number(this.id);
    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      this.erro.set('Profissional inválido.');
      return;
    }

    this.profissionalService.buscarDetalhe(idNumerico).subscribe({
      next: (detalhe) => {
        const f = paraFormularios(detalhe);
        this.dadosPessoais = f.dadosPessoais;
        this.contato = f.contato;
        this.infoProfissional = f.infoProfissional;
        this.infoUsuario = f.infoUsuario;
        this.infoEspecialista = f.infoEspecialista;
        this.status = f.status;
        this.carregado.set(true);
      },
      error: (err) => {
        this.erro.set(
          err?.status === 404
            ? 'Profissional não encontrado.'
            : err?.error?.message || 'Não foi possível carregar o profissional.'
        );
      },
    });
  }
}
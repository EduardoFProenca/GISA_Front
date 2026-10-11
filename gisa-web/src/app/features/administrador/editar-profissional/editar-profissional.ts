import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { SucessoDialog } from '../../../shared/components/sucesso-dialog/sucesso-dialog';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { Contato } from '../../../shared/components/contato/contato';
import { InfoProfissional } from '../cadastrar-profissional/formularios/info-profissional/info-profissional';
import { InfoUsuario } from '../cadastrar-profissional/formularios/info-usuario/info-usuario';
import { InfoEspecialista } from '../cadastrar-profissional/formularios/info-especialista/info-especialista';
import { ProfissionalService } from '../../../services/profissional';
import { paraFormularios } from '../detalhe-profissional/profissional-detalhe.util';

@Component({
  selector: 'app-editar-profissional',
  imports: [
    FormsModule,
    CabecalhoPagina,
    ConfirmDialog,
    SucessoDialog,
    DadosPessoais,
    Contato,
    InfoProfissional,
    InfoUsuario,
    InfoEspecialista,
  ],
  templateUrl: './editar-profissional.html',
  styleUrl: './editar-profissional.scss',
})
export class EditarProfissional implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private profissionalService = inject(ProfissionalService);

  id: string = this.route.snapshot.paramMap.get('id') ?? '';

  status: 'ATIVO' | 'INATIVO' = 'ATIVO';
  confirmarCancelamentoAberto = false;

  dialogSucessoAberto = false;
  salvando = false;

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

  salvarEdicao() {
    // TODO(Kauã): plugar aqui o PUT/PATCH real quando o endpoint de edição existir na API.
    // Por enquanto simula sucesso local para não travar o fluxo de tela.
    if (!this.carregado()) return;
    this.salvando = true;

    setTimeout(() => {
      this.salvando = false;
      this.dialogSucessoAberto = true;
    }, 5);
  }

  irParaGerenciarProfissionais() {
    this.dialogSucessoAberto = false;
    this.router.navigate(['/administrador/profissionais/gerenciar']);
  }

  irParaDetalhes() {
    this.dialogSucessoAberto = false;
    this.router.navigate(['/administrador/profissionais', this.id]);
  }

  cancelar() {
    this.confirmarCancelamentoAberto = true;
  }

  confirmarCancelamento() {
    this.confirmarCancelamentoAberto = false;
    this.location.back();
  }

  fecharConfirmacao() {
    this.confirmarCancelamentoAberto = false;
  }
}
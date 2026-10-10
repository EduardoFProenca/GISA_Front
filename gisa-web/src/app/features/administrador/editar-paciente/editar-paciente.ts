import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Componentes Compartilhados
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { SucessoDialog } from '../../../shared/components/sucesso-dialog/sucesso-dialog';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { Contato } from '../../../shared/components/contato/contato';
import { StatusPaciente } from '../../../core/models/paciente.model';

@Component({
  selector: 'app-editar-paciente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CabecalhoPagina,
    ConfirmDialog,
    SucessoDialog,
    DadosPessoais,
    Contato
  ],
  templateUrl: './editar-paciente.html',
  styleUrl: './editar-paciente.scss'
})
export class EditarPaciente implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  id: string = this.route.snapshot.paramMap.get('id') ?? '';

  status: StatusPaciente = 'MATRICULADO';
  confirmarCancelamentoAberto = false;
  dialogSucessoAberto = false;
  salvando = false;

  dadosPessoais: any = {};
  contato: any = {};
  infoResponsavel: any = {};

  ngOnInit(): void {
    const pacienteMock = {
      dadosPessoais: {
        nome: 'Lucas Oliveira Santos',
        cpf: '123.456.789-00',
        email: 'lucas.santos@email.com',
        dataNascimento: '2015-05-10',
        sexo: 'M',
        celular: '(11) 98765-4321',
        estadoCivil: 'SOLTEIRO',
        numCNS: '000 1111 2222 3333'
      },
      contato: {
        cep: '01001-000',
        endereco: 'Praça da Sé',
        numero: '100',
        complemento: '',
        bairro: 'Sé',
        cidade: 'São Paulo',
        uf: 'SP'
      },
      infoResponsavel: {
        nome: 'Maria Santos',
        cpf: '000.111.222-33',
        telefone: '(11) 98765-4321',
        grauParentesco: 'Mãe'
      },
      status: 'MATRICULADO' as const
    };

    this.dadosPessoais = pacienteMock.dadosPessoais;
    this.contato = pacienteMock.contato;
    this.infoResponsavel = pacienteMock.infoResponsavel;
    this.status = pacienteMock.status;
  }

  salvarEdicao() {
    this.salvando = true;
    setTimeout(() => {
      this.salvando = false;
      this.dialogSucessoAberto = true;
    }, 500);
  }

  irParaGerenciarPacientes() {
    this.dialogSucessoAberto = false;
    this.router.navigate(['/administrador/pacientes/gerenciar']);
  }

  irParaDetalhes() {
    this.dialogSucessoAberto = false;
    this.router.navigate(['/administrador/pacientes', this.id]);
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
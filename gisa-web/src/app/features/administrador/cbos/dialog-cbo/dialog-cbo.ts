import { Mascara } from '../../../../shared/directives/mascara.directive';
import { Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormDialog } from '../../../../shared/components/form-dialog/form-dialog';
import { OpcaoSelectBusca, SelectBusca } from '../../../../shared/components/select-busca/select-busca';
import { Cbo } from '../../../../core/models/cargo.model';
import { CargoService } from '../../../../core/services/cargo';
import { CboCatalogoService, OcupacaoCbo } from '../../../../core/services/cbo-catalogo';
import { aplicarErrosApi } from '../../../../core/http/erro-api';
import { formatarCbo } from '../../../../shared/utils/formatacao.util';
import { soDigitos } from '../../../../shared/utils/texto.util';
import { AvisoSucessoService } from '../../../../core/services/aviso-sucesso';

// Criar (cbo = null) ou editar CBO. Na edição só o título muda: o código identifica o registro.
@Component({
  selector: 'app-dialog-cbo',
  imports: [FormsModule, FormDialog, Mascara, SelectBusca],
  templateUrl: './dialog-cbo.html',
})
export class DialogCbo {
  private avisoSucesso = inject(AvisoSucessoService);
  private cargoService = inject(CargoService);
  private catalogoService = inject(CboCatalogoService);

  aberto = input(false);
  cbo = input<Cbo | null>(null);

  salvo = output<Cbo>();
  cancelar = output<void>();

  codigo = signal('');
  titulo = signal('');
  erros = signal<Record<string, string>>({});
  erro = signal('');
  salvando = signal(false);

  // Tabela oficial da CBO 2002: completa o título pelo código e confere se o código existe.
  private oficial = signal<Map<string, OcupacaoCbo> | null>(null);
  private tituloAutomatico = '';
  // Busca na tabela oficial por código ou nome (como o CID): escolher preenche código e título.
  opcoesOficiais = signal<OpcaoSelectBusca[]>([]);
  escolhidoOficial = signal<string | null>(null);

  constructor() {
    this.catalogoService.catalogo().subscribe({
      next: (m) => {
        this.oficial.set(m);
        this.opcoesOficiais.set(
          [...m.values()].map((o) => ({
            id: o.codigoCBO,
            label: `${formatarCbo(o.codigoCBO)} · ${o.tituloCBO}`,
            termosBusca: o.codigoCBO,
          }))
        );
      },
      error: () => {},
    });
    effect(() => {
      if (!this.aberto()) return;
      const c = this.cbo();
      untracked(() => {
        this.codigo.set(c ? formatarCbo(c.codigoCBO) : '');
        this.titulo.set(c?.tituloCBO ?? '');
        this.erros.set({});
        this.erro.set('');
        this.tituloAutomatico = '';
        this.escolhidoOficial.set(null);
      });
    });
  }

  escolherOficial(codigo: number | string | null) {
    this.escolhidoOficial.set(codigo === null ? null : String(codigo));
    if (codigo === null) return;
    const ocupacao = this.oficial()?.get(String(codigo));
    if (!ocupacao) return;
    this.codigo.set(formatarCbo(ocupacao.codigoCBO));
    this.titulo.set(ocupacao.tituloCBO);
    this.tituloAutomatico = ocupacao.tituloCBO;
    this.erros.set({});
  }

  // Código completo: preenche o título oficial (sem apagar um título que o usuário digitou).
  aoMudarCodigo(valor: string) {
    this.codigo.set(valor);
    const ocupacao = this.oficial()?.get(soDigitos(valor));
    const titulo = this.titulo().trim();
    if (ocupacao && (!titulo || titulo === this.tituloAutomatico)) {
      this.titulo.set(ocupacao.tituloCBO);
      this.tituloAutomatico = ocupacao.tituloCBO;
    }
  }

  salvar() {
    if (this.salvando()) return;
    const atual = this.cbo();
    const codigoCBO = soDigitos(this.codigo());
    const tituloCBO = this.titulo().trim();

    const erros: Record<string, string> = {};
    if (!atual && codigoCBO.length !== 6) erros['codigoCBO'] = 'O código deve ter 6 dígitos (ex.: 2515-10).';
    else if (!atual && this.oficial() && !this.oficial()!.has(codigoCBO)) {
      erros['codigoCBO'] = 'Código não encontrado na CBO 2002 oficial.';
    }
    if (!tituloCBO) erros['tituloCBO'] = 'Informe o título do CBO.';
    this.erros.set(erros);
    this.erro.set('');
    if (Object.keys(erros).length) return;

    if (atual && tituloCBO === atual.tituloCBO) {
      this.cancelar.emit();
      return;
    }

    const req = atual
      ? this.cargoService.atualizarCbo(atual.codigoCBO, { tituloCBO })
      : this.cargoService.criarCbo({ codigoCBO, tituloCBO });

    this.salvando.set(true);
    req.subscribe({
      next: (c) => {
        this.salvando.set(false);
        this.avisoSucesso.mostrar({ titulo: atual ? 'CBO atualizado' : 'CBO cadastrado', detalhe: `${formatarCbo(c.codigoCBO)} · ${c.tituloCBO}` });
        this.salvo.emit(c);
      },
      error: (err) => {
        this.salvando.set(false);
        const campos: Record<string, string> = {};
        const { mensagemGeral } = aplicarErrosApi(
          err,
          (chave, msg) => {
            if (chave !== 'codigoCBO' && chave !== 'tituloCBO') return false;
            campos[chave] = msg;
            return true;
          },
          {
            padrao: 'Não foi possível salvar o CBO.',
            // "CBO já cadastrado." chega só em message.
            marcarPorMensagem: (msg) => {
              if (!/já cadastrado/i.test(msg)) return false;
              campos['codigoCBO'] = msg;
              return true;
            },
          }
        );
        this.erros.set(campos);
        this.erro.set(Object.keys(campos).length ? '' : mensagemGeral);
      },
    });
  }
}

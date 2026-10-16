import { CadastroExigido, Funcionalidade } from '../auth/permissoes';
import { Acesso, acoesRapidas, itensDoMenu } from './menus';

function acesso(pode: (f: Funcionalidade) => boolean, cadastro?: CadastroExigido): Acesso {
  return { pode, temCadastro: (c) => c === cadastro };
}

describe('itensDoMenu', () => {
  it('começa sempre por Início', () => {
    const itens = itensDoMenu(acesso(() => true));
    expect(itens[0].label).toBe('Início');
    expect(itens[0].rota).toBe('/inicio');
  });

  it('esconde os itens cuja funcionalidade o usuário não tem', () => {
    const itens = itensDoMenu(acesso((f) => f !== 'GERENCIAR_PERFIS'));
    expect(itens.some((i) => i.rota === '/perfis')).toBe(false);
    expect(itens.some((i) => i.rota === '/cargos')).toBe(true);
  });

  it('sem nenhum acesso, sobram só o Início e a troca de senha', () => {
    expect(itensDoMenu(acesso(() => false)).map((i) => i.label)).toEqual(['Início', 'Alterar minha senha']);
  });

  it('qualquer perfil pode receber telas de "administrador" (ex.: escolas e auditoria)', () => {
    const pode = (f: Funcionalidade) => f === 'GERENCIAR_ESCOLAS' || f === 'VISUALIZAR_AUDITORIA';
    expect(itensDoMenu(acesso(pode)).map((i) => i.rota)).toEqual(['/inicio', '/escolas', '/auditoria', '/minha-senha']);
  });
});

describe('telas por tipo de cadastro', () => {
  it('agenda e terapias do dia só para cadastro de especialista', () => {
    const rotas = (c?: CadastroExigido) => itensDoMenu(acesso(() => false, c)).map((i) => i.rota);
    expect(rotas('ESPECIALISTA')).toContain('/agenda');
    expect(rotas('ESPECIALISTA')).toContain('/minhas-terapias');
    expect(rotas()).not.toContain('/agenda');
  });

  it('atestado exige a permissão e o cadastro de especialista', () => {
    const pode = (f: Funcionalidade) => f === 'EMITIR_ATESTADO';
    expect(acoesRapidas(acesso(pode, 'ESPECIALISTA')).some((a) => a.rota === '/atestado')).toBe(true);
    expect(acoesRapidas(acesso(pode)).some((a) => a.rota === '/atestado')).toBe(false);
    expect(acoesRapidas(acesso(() => false, 'ESPECIALISTA')).some((a) => a.rota === '/atestado')).toBe(false);
  });
});

describe('Gestão Rápida', () => {
  it('esconde o que o usuário não pode acessar', () => {
    const rotas = acoesRapidas(acesso((f) => f === 'VISUALIZAR_PACIENTES')).map((a) => a.rota);
    expect(rotas).toEqual(['/pacientes']);
  });
});

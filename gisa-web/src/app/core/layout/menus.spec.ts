import { itensDoMenu } from './menus';

describe('itensDoMenu', () => {
  it('começa sempre por Início, apontando para a base do painel', () => {
    const itens = itensDoMenu('RECEPCAO', () => true);
    expect(itens[0].label).toBe('Início');
    expect(itens[0].rota).toBe('/recepcao');
  });

  it('esconde os itens cuja funcionalidade o usuário não tem', () => {
    const itens = itensDoMenu('ADMINISTRADOR', (f) => f !== 'GERENCIAR_PERFIS');
    expect(itens.some((i) => i.rota === '/administrador/perfis')).toBe(false);
    expect(itens.some((i) => i.rota === '/administrador/cargos')).toBe(true);
  });

  it('sem nenhum acesso, sobram só o Início e a troca de senha', () => {
    expect(itensDoMenu('ASSISTENTE_SOCIAL', () => false).map((i) => i.label)).toEqual(['Início', 'Alterar minha senha']);
  });
});

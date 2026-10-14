import { acoesRapidasDoPainel, itensDoMenu } from './menus';

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

describe('telas comuns', () => {
  it('aparecem em qualquer painel cujo usuário tenha a permissão (ex.: pacientes no especialista)', () => {
    const pode = (f: string) => f === 'VISUALIZAR_PACIENTES';
    expect(itensDoMenu('ESPECIALISTA', pode).some((i) => i.rota === '/especialista/pacientes')).toBe(true);
    expect(acoesRapidasDoPainel('ESPECIALISTA', pode).some((a) => a.rota === '/especialista/pacientes')).toBe(true);
  });

  it('o "Gestão Rápida" esconde o que o usuário não pode acessar', () => {
    const rotas = acoesRapidasDoPainel('RECEPCAO', (f) => f === 'VISUALIZAR_PACIENTES').map((a) => a.rota);
    expect(rotas).toEqual(['/recepcao/pacientes']);
  });
});

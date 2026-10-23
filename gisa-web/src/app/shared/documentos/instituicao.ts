import { dataExtenso, hojeIso } from '../utils/data.util';

// Dados da APAE no cabeçalho dos documentos impressos (atestado, receita, recusa).
// TODO: trocar pelos templates oficiais quando a APAE enviar; incluir telefone e CNPJ.
export const INSTITUICAO = {
  nome: 'APAE Sorocaba',
  descricao: 'Associação de Pais e Amigos dos Excepcionais de Sorocaba',
  endereco: 'R. Manoel Afonso, 2 - Jardim Maria do Carmo, Sorocaba - SP, 18090-550',
  cidade: 'Sorocaba',
  // Arquivo em public/img (servido na raiz do app).
  logo: 'img/logo-apae.webp',
};

// "Sorocaba, 13 de outubro de 2026."
export function localEDataDeHoje(): string {
  return `${INSTITUICAO.cidade}, ${dataExtenso(hojeIso()).replace(/^[^,]+, /, '')}.`;
}

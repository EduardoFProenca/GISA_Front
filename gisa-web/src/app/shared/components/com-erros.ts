export abstract class ComErros {
  erros: Record<string, string> = {};

  limparErro(campo: string) {
    delete this.erros[campo];
  }
}
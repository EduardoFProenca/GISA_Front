export function comErros<T extends object>(dados: T): T & { erros: Record<string, string>; limparErro(campo: string): void } {
  return {
    ...dados,
    erros: {},
    limparErro(campo: string) {
      delete this.erros[campo];
    },
  };
}
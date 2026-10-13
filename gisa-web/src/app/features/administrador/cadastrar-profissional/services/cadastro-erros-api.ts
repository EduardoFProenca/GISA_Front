import { Injectable } from '@angular/core';
import { ComErros } from '../../../../shared/components/com-erros';
import { aplicarErrosApi, campoDaChave, ResultadoErroApi } from '../../../../core/http/erro-api';
import { FormulariosCadastro } from '../models/formularios-cadastro';

// Mapeia os erros da API para os campos do cadastro de profissional.
@Injectable({ providedIn: 'root' })
export class CadastroErrosApiService {

  tratar(err: unknown, f: FormulariosCadastro): ResultadoErroApi {
    return aplicarErrosApi(
      err,
      (chave, mensagem) => this.marcar(this.destinoCampo(campoDaChave(chave), f), mensagem),
      {
        padrao: 'Erro ao salvar cadastro.',
        marcarPorMensagem: (mensagem) => this.marcar(this.destinoMensagem(mensagem, f), mensagem),
      }
    );
  }

  private marcar(destino: [ComErros, string] | null, mensagem: string): boolean {
    if (!destino) return false;
    destino[0].erros[destino[1]] = mensagem;
    return true;
  }

  private destinoCampo(campo: string, f: FormulariosCadastro): [ComErros, string] | null {
    const { dadosPessoais: dp, contato: c, infoProfissional: ip, infoUsuario: iu, infoEspecialista: ie } = f;

    const mapa: Record<string, [ComErros, string]> = {
      nome: [dp, 'nome'],
      cpf: [dp, 'cpf'],
      email: [dp, 'email'],
      dataNascimento: [dp, 'dataNascimento'],
      sexo: [dp, 'sexo'],
      celular: [dp, 'celular'],
      estadoCivil: [dp, 'estadoCivil'],
      numCNS: [dp, 'numCNS'],
      cep: [c, 'cep'],
      rua: [c, 'endereco'],
      numero: [c, 'numero'],
      bairro: [c, 'bairro'],
      cidade: [c, 'cidade'],
      estado: [c, 'uf'],
      idCargo: [ip, 'cargo'],
      senha: [iu, 'senha'],
      idPerfil: [iu, 'perfil'],
      registroConselho: [ie, 'registroProfissional'],
      especialidadesIds: [ie, 'especialidades'],
      novasEspecialidades: [ie, 'especialidades'],
      jornadas: [ie, 'jornadas'],
      diaSemana: [ie, 'jornadas'],
      horaInicio: [ie, 'jornadas'],
      horaTermino: [ie, 'jornadas'],
      cnpj: [ie, 'cnpj'],
      razaoSocial: [ie, 'razaoSocial'],
    };

    return mapa[campo] ?? null;
  }

  // Regras de negócio que chegam só em `message` (ver PROFISSIONAIS.md e ESPECIALISTAS.md).
  private destinoMensagem(mensagem: string, f: FormulariosCadastro): [ComErros, string] | null {
    if (/^CPF já cadastrado/i.test(mensagem)) return [f.dadosPessoais, 'cpf'];
    if (/^E-mail já cadastrado/i.test(mensagem)) return [f.dadosPessoais, 'email'];
    if (/^CNPJ já cadastrado/i.test(mensagem)) return [f.infoEspecialista, 'cnpj'];
    if (/^Cargo não encontrado/i.test(mensagem)) return [f.infoProfissional, 'cargo'];
    if (/^Perfil não encontrado/i.test(mensagem)) return [f.infoUsuario, 'perfil'];
    if (/especialidade/i.test(mensagem)) return [f.infoEspecialista, 'especialidades'];
    return null;
  }
}

export interface LoginRequest {
  cpf: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  [key: string]: any;
}

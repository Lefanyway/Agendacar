import Usuario from "../models/Usuario";

class UsuarioRepository {
  async buscarPorEmail(email: string) {
    return Usuario.findOne({ where: { email } });
  }

  async criar(dados: {
    nome: string;
    email: string;
    senha: string;
    role?: "user" | "admin";
  }) {
    return Usuario.create(dados);
  }
}

export default new UsuarioRepository();
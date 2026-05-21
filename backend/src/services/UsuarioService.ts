import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import usuarioRepository from "../repositories/UsuarioRepository";

interface CadastroDTO {
  nome?: string;
  email?: string;
  senha?: string;
}

interface LoginDTO {
  email?: string;
  senha?: string;
}

class UsuarioService {
async cadastrar(dados: CadastroDTO = {}) {
  const { nome, email, senha } = dados;
    if (!nome || !email || !senha) {
      throw new Error("Nome, email e senha são obrigatórios.");
    }

    if (senha.length < 6) {
      throw new Error("A senha deve ter no mínimo 6 caracteres.");
    }

    const usuarioExistente = await usuarioRepository.buscarPorEmail(email);

    if (usuarioExistente) {
      throw new Error("Este email já está cadastrado.");
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const usuario = await usuarioRepository.criar({
      nome,
      email,
      senha: senhaCriptografada,
      role: "user"
    });

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role
    };
  }

async login(dados: LoginDTO = {}) {
  const { email, senha } = dados;
    if (!email || !senha) {
      throw new Error("Email e senha são obrigatórios.");
    }

    const usuario = await usuarioRepository.buscarPorEmail(email);

    if (!usuario) {
      throw new Error("Credenciais inválidas.");
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      throw new Error("Credenciais inválidas.");
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role
      },
      this.getJwtSecret(),
      {
        expiresIn: "1d"
      }
    );

    return {
      token,
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role
    };
  }

  private getJwtSecret() {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET não foi definido no .env");
    }

    return secret;
  }
}

export default new UsuarioService();
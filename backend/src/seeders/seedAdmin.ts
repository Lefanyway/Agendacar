import "dotenv/config";
import bcrypt from "bcryptjs";
import sequelize from "../config/database";
import "../models";
import Usuario from "../models/Usuario";

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const email = process.env.ADMIN_EMAIL;
    const senha = process.env.ADMIN_PASSWORD;

    if (!email || !senha) {
      throw new Error("Defina ADMIN_EMAIL e ADMIN_PASSWORD para executar o seed de administrador.");
    }

    if (senha.length < 8) {
      throw new Error("ADMIN_PASSWORD deve ter no mínimo 8 caracteres.");
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const usuarioExistente = await Usuario.findOne({
      where: { email }
    });

    if (usuarioExistente) {
      await usuarioExistente.update({
        nome: "Administrador",
        senha: senhaCriptografada,
        role: "admin"
      });

      console.log("Usuário admin já existia e teve nome, senha e role atualizados.");
      console.log(`Email: ${email}`);
      return;
    }

    await Usuario.create({
      nome: "Administrador",
      email,
      senha: senhaCriptografada,
      role: "admin"
    });

    console.log("Usuário admin criado com sucesso.");
    console.log(`Email: ${email}`);
  } catch (error) {
    console.error("Erro ao criar usuário admin:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedAdmin();

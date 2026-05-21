import "dotenv/config";
import bcrypt from "bcryptjs";
import sequelize from "../config/database";
import "../models";
import Usuario from "../models/Usuario";

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const email = "admin@agendacar.com";
    const senha = "admin123";

    const usuarioExistente = await Usuario.findOne({
      where: { email }
    });

    if (usuarioExistente) {
      await usuarioExistente.update({
        nome: "Administrador",
        role: "admin"
      });

      console.log("Usuário admin já existia e foi atualizado.");
      return;
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    await Usuario.create({
      nome: "Administrador",
      email,
      senha: senhaCriptografada,
      role: "admin"
    });

    console.log("Usuário admin criado com sucesso.");
    console.log("Email: admin@agendacar.com");
    console.log("Senha: admin123");
  } catch (error) {
    console.error("Erro ao criar usuário admin:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedAdmin();
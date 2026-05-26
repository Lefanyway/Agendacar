import dotenv from "dotenv";

dotenv.config();

import app from "./app";
import sequelize from "./config/database";
import "./models";

const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === "production";

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Banco Supabase conectado com sucesso.");

    await sequelize.sync(isProduction ? {} : { alter: true });
    console.log("Models sincronizados com o banco.");

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao iniciar servidor:", error);
    process.exit(1);
  }
}

startServer();

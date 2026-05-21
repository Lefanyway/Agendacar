import dotenv from "dotenv";

dotenv.config();

import app from "./app";
import sequelize from "./config/database";

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await sequelize.authenticate();

    console.log("Banco Supabase conectado com sucesso.");

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao conectar com o banco Supabase:", error);
    process.exit(1);
  }
}

startServer();
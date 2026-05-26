import express from "express";
import cors from "cors";
import carroRoutes from "./routes/carroRoutes";
import usuarioRoutes from "./routes/usuarioRoutes";
import reservaRoutes from "./routes/reservaRoutes";
import recomendacaoRoutes from "./routes/recomendacaoRoutes";
import chatbotRoutes from "./routes/chatbotRoutes";
import { setupSwagger } from "./config/swagger";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupSwagger(app);

app.use("/auth", usuarioRoutes);
app.use("/carros", carroRoutes);
app.use("/reservas", reservaRoutes);
app.use("/recomendacoes", recomendacaoRoutes);
app.use("/chatbot", chatbotRoutes);

app.get("/health", (_req, res) => {
  return res.json({
    status: "ok",
    message: "AgendaCar API funcionando",
    timestamp: new Date()
  });
});

export default app;
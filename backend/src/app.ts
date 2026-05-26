import express from "express";
import cors from "cors";
import carroRoutes from "./routes/carroRoutes";
import usuarioRoutes from "./routes/usuarioRoutes";
import reservaRoutes from "./routes/reservaRoutes";
import recomendacaoRoutes from "./routes/recomendacaoRoutes";
import chatbotRoutes from "./routes/chatbotRoutes";
import { setupSwagger } from "./config/swagger";

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const isProduction = process.env.NODE_ENV === "production";
const devOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

app.disable("x-powered-by");

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || (!isProduction && devOrigins.includes(origin))) {
      callback(null, true);
      return;
    }

    callback(null, false);
  }
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

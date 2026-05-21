import express from "express";
import cors from "cors";
import carroRoutes from "./routes/carroRoutes";
import usuarioRoutes from "./routes/usuarioRoutes";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", usuarioRoutes);
app.use("/carros", carroRoutes);

app.get("/health", (_req, res) => {
  return res.json({
    status: "ok",
    message: "AgendaCar API funcionando",
    timestamp: new Date()
  });
});

export default app;
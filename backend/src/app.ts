import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*"
}));

app.use(express.json());

app.get("/health", (_req, res) => {
  return res.json({
    status: "ok",
    message: "AgendaCar API funcionando",
    timestamp: new Date()
  });
});

export default app;
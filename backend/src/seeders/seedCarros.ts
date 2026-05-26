import "dotenv/config";
import sequelize from "../config/database";
import "../models";
import Carro from "../models/Carro";
import Reserva from "../models/Reserva";

interface CarroSeed {
  nome: string;
  tipo: string;
  imagem: string;
  capacidade: number;
  transmissao: string;
  tanque: number;
  precoDia: number;
  disponivel: boolean;
}

const carros: CarroSeed[] = [
  {
    nome: "BMW M3 Competition",
    tipo: "Sport",
    imagem: "/img/cars/bmw-m3.png",
    capacidade: 5,
    transmissao: "Automático",
    tanque: 59,
    precoDia: 2800,
    disponivel: true
  },
  {
    nome: "Audi TT RS",
    tipo: "Esportivo",
    imagem: "/img/cars/audi-tt.png",
    capacidade: 2,
    transmissao: "Automático",
    tanque: 85,
    precoDia: 1000,
    disponivel: true
  },
  {
    nome: "Toyota GR Corolla",
    tipo: "Sport",
    imagem: "/img/cars/gr-corolla.png",
    capacidade: 5,
    transmissao: "Manual",
    tanque: 50,
    precoDia: 1200,
    disponivel: true
  },
  {
    nome: "Toyota SW4",
    tipo: "SUV",
    imagem: "/img/cars/toyota-sw4.png",
    capacidade: 7,
    transmissao: "Automático",
    tanque: 80,
    precoDia: 650,
    disponivel: false
  }
];

async function seedCarros() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    await Reserva.destroy({ where: {} });
    await Carro.destroy({ where: {} });

    await Carro.bulkCreate(carros);

    console.log(`Carros cadastrados: ${carros.length}`);
    console.log("Seed de carros finalizado com sucesso.");
  } catch (error) {
    console.error("Erro ao executar seed de carros:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedCarros();
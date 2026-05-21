import "dotenv/config";
import sequelize from "../config/database";
import "../models";
import Carro from "../models/Carro";

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
    nome: "Porsche 911",
    tipo: "Sport",
    imagem: "/img/porsche.png",
    capacidade: 2,
    transmissao: "Automático",
    tanque: 64,
    precoDia: 3500,
    disponivel: true
  },
  {
    nome: "T-Cross",
    tipo: "SUV",
    imagem: "/img/comprar-sense-200-tsi-automatica_5b696e8da4.png",
    capacidade: 5,
    transmissao: "Automático",
    tanque: 52,
    precoDia: 200,
    disponivel: true
  },
  {
    nome: "Civic Type-R",
    tipo: "Sport",
    imagem: "/img/C462088_GA_Side.avif",
    capacidade: 4,
    transmissao: "Manual",
    tanque: 47,
    precoDia: 3500,
    disponivel: true
  },
  {
    nome: "Silverado",
    tipo: "Picape",
    imagem: "/img/2024-Silverado-EV-hero.avif",
    capacidade: 5,
    transmissao: "Automático",
    tanque: 91,
    precoDia: 800,
    disponivel: true
  }
];

async function seedCarros() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    let inseridos = 0;
    let atualizados = 0;

    for (const carroData of carros) {
      const [carro, criado] = await Carro.findOrCreate({
        where: { nome: carroData.nome },
        defaults: carroData
      });

      if (criado) {
        inseridos++;
      } else {
        await carro.update(carroData);
        atualizados++;
      }
    }

    console.log(`Carros inseridos: ${inseridos}`);
    console.log(`Carros atualizados: ${atualizados}`);
    console.log("Seed de carros finalizado com sucesso.");
  } catch (error) {
    console.error("Erro ao executar seed de carros:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedCarros();
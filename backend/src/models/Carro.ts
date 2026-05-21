import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface CarroAttributes {
  id: number;
  nome: string;
  tipo: string;
  imagem?: string | null;
  capacidade: number;
  transmissao: string;
  tanque: number;
  precoDia: number;
  disponivel: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type CarroCreationAttributes = Optional<CarroAttributes, "id" | "imagem" | "disponivel">;

class Carro extends Model<CarroAttributes, CarroCreationAttributes>
  implements CarroAttributes {
  declare id: number;
  declare nome: string;
  declare tipo: string;
  declare imagem: string | null;
  declare capacidade: number;
  declare transmissao: string;
  declare tanque: number;
  declare precoDia: number;
  declare disponivel: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Carro.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    imagem: {
      type: DataTypes.STRING,
      allowNull: true
    },
    capacidade: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    transmissao: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tanque: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    precoDia: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    disponivel: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: "carros",
    modelName: "Carro"
  }
);

export default Carro;

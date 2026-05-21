import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export type ReservaStatus = "ativa" | "cancelada" | "concluida";

interface ReservaAttributes {
  id: number;
  UsuarioId: number;
  CarroId: number;
  dataInicio: string;
  dataFim: string;
  valorTotal: number;
  status: ReservaStatus;
  destino?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type ReservaCreationAttributes = Optional<ReservaAttributes, "id" | "status" | "destino">;

class Reserva extends Model<ReservaAttributes, ReservaCreationAttributes>
  implements ReservaAttributes {
  declare id: number;
  declare UsuarioId: number;
  declare CarroId: number;
  declare dataInicio: string;
  declare dataFim: string;
  declare valorTotal: number;
  declare status: ReservaStatus;
  declare destino: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Reserva.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    UsuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    CarroId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dataInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    dataFim: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    valorTotal: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM("ativa", "cancelada", "concluida"),
      allowNull: false,
      defaultValue: "ativa"
    },
    destino: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "reservas",
    modelName: "Reserva"
  }
);

export default Reserva;

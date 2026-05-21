import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export type UsuarioRole = "user" | "admin";

interface UsuarioAttributes {
  id: number;
  nome: string;
  email: string;
  senha: string;
  role: UsuarioRole;
  createdAt?: Date;
  updatedAt?: Date;
}

type UsuarioCreationAttributes = Optional<UsuarioAttributes, "id" | "role">;

class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes>
  implements UsuarioAttributes {
  declare id: number;
  declare nome: string;
  declare email: string;
  declare senha: string;
  declare role: UsuarioRole;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Usuario.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      allowNull: false,
      defaultValue: "user"
    }
  },
  {
    sequelize,
    tableName: "usuarios",
    modelName: "Usuario"
  }
);

export default Usuario;

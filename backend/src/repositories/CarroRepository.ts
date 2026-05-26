import { Op } from "sequelize";
import Carro from "../models/Carro";
import {
  CarroPayload,
  ICarroRepository,
  ListarCarrosParams
} from "../contracts/CarroRepositoryContract";

class CarroRepository implements ICarroRepository {
  async listar(params: ListarCarrosParams): Promise<Carro[]> {
    const where: any = {};

    if (params.busca) {
      where[Op.or] = [
        { nome: { [Op.iLike]: `%${params.busca}%` } },
        { tipo: { [Op.iLike]: `%${params.busca}%` } }
      ];
    }

    if (params.tipo) {
      where.tipo = { [Op.iLike]: `%${params.tipo}%` };
    }

    if (params.disponivel !== undefined) {
      where.disponivel = params.disponivel === "true";
    }

    const order: any[] = [];

    if (params.ordenar === "preco-asc") {
      order.push(["precoDia", "ASC"]);
    }

    if (params.ordenar === "preco-desc") {
      order.push(["precoDia", "DESC"]);
    }

    if (params.ordenar === "capacidade-desc") {
      order.push(["capacidade", "DESC"]);
    }

    return Carro.findAll({
      where,
      order
    });
  }

  async buscarPorId(id: number): Promise<Carro | null> {
    return Carro.findByPk(id);
  }

  async criar(dados: CarroPayload): Promise<Carro> {
    return Carro.create(dados);
  }

  async atualizar(id: number, dados: CarroPayload): Promise<Carro | null> {
    const carro = await Carro.findByPk(id);

    if (!carro) {
      return null;
    }

    await carro.update(dados);
    return carro;
  }

  async deletar(id: number): Promise<boolean> {
    const carro = await Carro.findByPk(id);

    if (!carro) {
      return false;
    }

    await carro.destroy();
    return true;
  }
}

export default new CarroRepository();
import { Op } from "sequelize";
import Carro from "../models/Carro";

interface ListarCarrosParams {
  busca?: string;
  tipo?: string;
  disponivel?: string;
  ordenar?: string;
}

class CarroRepository {
  async listar(params: ListarCarrosParams) {
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

    if (params.ordenar === "preco-asc") order.push(["precoDia", "ASC"]);
    if (params.ordenar === "preco-desc") order.push(["precoDia", "DESC"]);
    if (params.ordenar === "capacidade-desc") order.push(["capacidade", "DESC"]);

    return Carro.findAll({
      where,
      order
    });
  }

  async buscarPorId(id: number) {
    return Carro.findByPk(id);
  }

  async criar(dados: any) {
    return Carro.create(dados);
  }

  async atualizar(id: number, dados: any) {
    const carro = await Carro.findByPk(id);
    if (!carro) return null;

    await carro.update(dados);
    return carro;
  }

  async deletar(id: number) {
    const carro = await Carro.findByPk(id);
    if (!carro) return false;

    await carro.destroy();
    return true;
  }
}

export default new CarroRepository();
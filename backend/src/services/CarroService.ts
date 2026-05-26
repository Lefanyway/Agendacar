import carroRepository from "../repositories/CarroRepository";
import {
  CarroPayload,
  ICarroRepository,
  ListarCarrosParams
} from "../contracts/CarroRepositoryContract";

interface CarroDTO {
  nome: string;
  tipo: string;
  imagem?: string | null;
  capacidade: number | string;
  transmissao: string;
  tanque: number | string;
  precoDia: number | string;
  disponivel?: boolean | string;
}

class CarroService {
  constructor(
    private readonly repository: ICarroRepository = carroRepository
  ) {}

  listar(query: ListarCarrosParams) {
    return this.repository.listar({
      busca: query.busca,
      tipo: query.tipo,
      disponivel: query.disponivel,
      ordenar: query.ordenar
    });
  }

  async buscarPorId(id: number) {
    const carro = await this.repository.buscarPorId(id);

    if (!carro) {
      throw new Error("Carro não encontrado.");
    }

    return carro;
  }

  criar(dados: CarroDTO) {
    const carroFormatado = this.formatarDados(dados);
    return this.repository.criar(carroFormatado);
  }

  async atualizar(id: number, dados: CarroDTO) {
    const carroFormatado = this.formatarDados(dados);
    const carro = await this.repository.atualizar(id, carroFormatado);

    if (!carro) {
      throw new Error("Carro não encontrado.");
    }

    return carro;
  }

  async deletar(id: number) {
    const removido = await this.repository.deletar(id);

    if (!removido) {
      throw new Error("Carro não encontrado.");
    }

    return { msg: "Carro removido." };
  }

  private formatarDados(dados: CarroDTO): CarroPayload {
    return {
      nome: dados.nome,
      tipo: dados.tipo,
      imagem: dados.imagem || null,
      capacidade: Number(dados.capacidade),
      transmissao: dados.transmissao,
      tanque: Number(dados.tanque),
      precoDia: Number(dados.precoDia),
      disponivel: this.normalizarDisponibilidade(dados.disponivel)
    };
  }

  private normalizarDisponibilidade(valor?: boolean | string): boolean {
    if (typeof valor === "boolean") {
      return valor;
    }

    if (typeof valor === "string") {
      return valor !== "false";
    }

    return true;
  }
}

export default new CarroService();
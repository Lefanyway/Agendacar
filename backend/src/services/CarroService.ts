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
    this.validarId(id);

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
    this.validarId(id);

    const carroFormatado = this.formatarDados(dados);
    const carro = await this.repository.atualizar(id, carroFormatado);

    if (!carro) {
      throw new Error("Carro não encontrado.");
    }

    return carro;
  }

  async deletar(id: number) {
    this.validarId(id);

    const removido = await this.repository.deletar(id);

    if (!removido) {
      throw new Error("Carro não encontrado.");
    }

    return { msg: "Carro removido." };
  }

  private formatarDados(dados: CarroDTO): CarroPayload {
    const capacidade = Number(dados.capacidade);
    const tanque = Number(dados.tanque);
    const precoDia = Number(dados.precoDia);

    if (!dados.nome?.trim() || !dados.tipo?.trim() || !dados.transmissao?.trim()) {
      throw new Error("Nome, tipo e transmissão são obrigatórios.");
    }

    if (!Number.isFinite(capacidade) || capacidade <= 0) {
      throw new Error("Capacidade deve ser um número maior que zero.");
    }

    if (!Number.isFinite(tanque) || tanque <= 0) {
      throw new Error("Tanque deve ser um número maior que zero.");
    }

    if (!Number.isFinite(precoDia) || precoDia <= 0) {
      throw new Error("Preço por dia deve ser um número maior que zero.");
    }

    return {
      nome: dados.nome.trim(),
      tipo: dados.tipo.trim(),
      imagem: dados.imagem || null,
      capacidade,
      transmissao: dados.transmissao.trim(),
      tanque,
      precoDia,
      disponivel: this.normalizarDisponibilidade(dados.disponivel)
    };
  }

  private validarId(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID inválido.");
    }
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

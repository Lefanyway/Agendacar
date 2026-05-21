import carroRepository from "../repositories/CarroRepository";

class CarroService {
  listar(query: any) {
    return carroRepository.listar({
      busca: query.busca,
      tipo: query.tipo,
      disponivel: query.disponivel,
      ordenar: query.ordenar
    });
  }

  async buscarPorId(id: number) {
    const carro = await carroRepository.buscarPorId(id);

    if (!carro) {
      throw new Error("Carro não encontrado.");
    }

    return carro;
  }

  criar(dados: any) {
    const carroFormatado = this.formatarDados(dados);
    return carroRepository.criar(carroFormatado);
  }

  async atualizar(id: number, dados: any) {
    const carroFormatado = this.formatarDados(dados);
    const carro = await carroRepository.atualizar(id, carroFormatado);

    if (!carro) {
      throw new Error("Carro não encontrado.");
    }

    return carro;
  }

  async deletar(id: number) {
    const removido = await carroRepository.deletar(id);

    if (!removido) {
      throw new Error("Carro não encontrado.");
    }

    return { msg: "Carro removido." };
  }

  private formatarDados(dados: any) {
    return {
      nome: dados.nome,
      tipo: dados.tipo,
      imagem: dados.imagem || null,
      capacidade: Number(dados.capacidade),
      transmissao: dados.transmissao,
      tanque: Number(dados.tanque),
      precoDia: Number(dados.precoDia),
      disponivel: dados.disponivel ?? true
    };
  }
}

export default new CarroService();
import carroRepository from "../repositories/CarroRepository";
import { ICarroRepository } from "../contracts/CarroRepositoryContract";

interface RecomendacaoDTO {
  orcamentoDia?: number;
  passageiros?: number;
  tipoViagem?: "economica" | "familia" | "esportiva" | "luxo";
  transmissao?: string;
}

class RecomendacaoService {
  constructor(
    private readonly carroRepo: ICarroRepository = carroRepository
  ) {}

  async recomendar(dados: RecomendacaoDTO) {
    const carros = await this.carroRepo.listar({
      disponivel: "true"
    });

    if (!carros.length) {
      throw new Error("Nenhum carro disponível para recomendação.");
    }

    const recomendacoes = carros.map((carro) => {
      let score = 0;
      const motivos: string[] = [];

      if (dados.orcamentoDia && carro.precoDia <= dados.orcamentoDia) {
        score += 30;
        motivos.push("preço dentro do orçamento informado");
      }

      if (dados.passageiros && carro.capacidade >= dados.passageiros) {
        score += 25;
        motivos.push("capacidade adequada para os passageiros");
      }

      if (
        dados.transmissao &&
        carro.transmissao.toLowerCase() === dados.transmissao.toLowerCase()
      ) {
        score += 15;
        motivos.push("transmissão compatível com a preferência");
      }

      if (dados.tipoViagem === "economica" && carro.precoDia <= 300) {
        score += 30;
        motivos.push("boa opção para viagem econômica");
      }

      if (dados.tipoViagem === "familia" && carro.capacidade >= 5) {
        score += 30;
        motivos.push("boa opção para viagem em família");
      }

      if (
        dados.tipoViagem === "esportiva" &&
        carro.tipo.toLowerCase().includes("sport")
      ) {
        score += 30;
        motivos.push("perfil esportivo compatível com a viagem");
      }

      if (dados.tipoViagem === "luxo" && carro.precoDia >= 800) {
        score += 20;
        motivos.push("perfil premium/luxo");
      }

      return {
        carro,
        score,
        motivos
      };
    });

    recomendacoes.sort((a, b) => b.score - a.score);

    const melhor = recomendacoes[0];

    return {
      carroRecomendado: melhor.carro,
      score: melhor.score,
      motivos: melhor.motivos.length
        ? melhor.motivos
        : ["melhor opção disponível com base nos dados informados"],
      alternativas: recomendacoes.slice(1, 4)
    };
  }
}

export default new RecomendacaoService();
import Carro from "../models/Carro";

export interface ListarCarrosParams {
  busca?: string;
  tipo?: string;
  disponivel?: string;
  ordenar?: string;
}

export interface CarroPayload {
  nome: string;
  tipo: string;
  imagem?: string | null;
  capacidade: number;
  transmissao: string;
  tanque: number;
  precoDia: number;
  disponivel: boolean;
}

export interface ICarroRepository {
  listar(params: ListarCarrosParams): Promise<Carro[]>;
  buscarPorId(id: number): Promise<Carro | null>;
  criar(dados: CarroPayload): Promise<Carro>;
  atualizar(id: number, dados: CarroPayload): Promise<Carro | null>;
  deletar(id: number): Promise<boolean>;
}
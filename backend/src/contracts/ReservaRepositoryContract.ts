import Reserva from "../models/Reserva";

export interface CriarReservaRepositoryDTO {
  UsuarioId: number;
  CarroId: number;
  dataInicio: string;
  dataFim: string;
  valorTotal: number;
  destino?: string | null;
}

export interface IReservaRepository {
  listarPorUsuario(usuarioId: number): Promise<Reserva[]>;
  buscarPorId(id: number): Promise<Reserva | null>;
  criar(dados: CriarReservaRepositoryDTO): Promise<Reserva>;
  cancelar(id: number): Promise<Reserva | null>;
}
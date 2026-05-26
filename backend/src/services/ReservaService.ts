import reservaRepository from "../repositories/ReservaRepository";
import carroRepository from "../repositories/CarroRepository";
import { IReservaRepository } from "../contracts/ReservaRepositoryContract";
import { ICarroRepository } from "../contracts/CarroRepositoryContract";

interface CriarReservaDTO {
  usuarioId: number;
  carroId: number;
  dataInicio: string;
  dataFim: string;
  destino?: string;
}

class ReservaService {
  constructor(
    private readonly reservaRepo: IReservaRepository = reservaRepository,
    private readonly carroRepo: ICarroRepository = carroRepository
  ) {}

  listarPorUsuario(usuarioId: number) {
    this.validarId(usuarioId, "Usuário inválido.");

    return this.reservaRepo.listarPorUsuario(usuarioId);
  }

  async criar({ usuarioId, carroId, dataInicio, dataFim, destino }: CriarReservaDTO) {
    this.validarId(usuarioId, "Usuário inválido.");
    this.validarId(carroId, "Carro inválido.");

    if (!usuarioId || !carroId || !dataInicio || !dataFim) {
      throw new Error("Carro, data inicial e data final são obrigatórios.");
    }

    const carro = await this.carroRepo.buscarPorId(carroId);

    if (!carro) {
      throw new Error("Carro não encontrado.");
    }

    if (!carro.disponivel) {
      throw new Error("Este carro não está disponível.");
    }

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) {
      throw new Error("Datas inválidas.");
    }

    if (fim <= inicio) {
      throw new Error("A data final deve ser maior que a data inicial.");
    }

    const diferencaEmMs = fim.getTime() - inicio.getTime();
    const dias = Math.ceil(diferencaEmMs / (1000 * 60 * 60 * 24));
    const valorTotal = dias * carro.precoDia;

    return this.reservaRepo.criar({
      UsuarioId: usuarioId,
      CarroId: carroId,
      dataInicio,
      dataFim,
      valorTotal,
      destino: destino || null
    });
  }

  async cancelar(id: number, usuarioId: number) {
    this.validarId(id, "Reserva inválida.");
    this.validarId(usuarioId, "Usuário inválido.");

    const reserva = await this.reservaRepo.buscarPorId(id);

    if (!reserva) {
      throw new Error("Reserva não encontrada.");
    }

    if (reserva.UsuarioId !== usuarioId) {
      throw new Error("Você não pode cancelar esta reserva.");
    }

    if (reserva.status === "cancelada") {
      throw new Error("Esta reserva já está cancelada.");
    }

    return this.reservaRepo.cancelar(id);
  }

  private validarId(id: number, mensagem: string) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(mensagem);
    }
  }
}

export default new ReservaService();

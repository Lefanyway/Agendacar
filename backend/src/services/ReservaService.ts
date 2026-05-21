import reservaRepository from "../repositories/ReservaRepository";
import carroRepository from "../repositories/CarroRepository";

interface CriarReservaDTO {
  usuarioId: number;
  carroId: number;
  dataInicio: string;
  dataFim: string;
  destino?: string;
}

class ReservaService {
  listarPorUsuario(usuarioId: number) {
    return reservaRepository.listarPorUsuario(usuarioId);
  }

  async criar({ usuarioId, carroId, dataInicio, dataFim, destino }: CriarReservaDTO) {
    if (!usuarioId || !carroId || !dataInicio || !dataFim) {
      throw new Error("Carro, data inicial e data final são obrigatórios.");
    }

    const carro = await carroRepository.buscarPorId(carroId);

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

    return reservaRepository.criar({
      UsuarioId: usuarioId,
      CarroId: carroId,
      dataInicio,
      dataFim,
      valorTotal,
      destino: destino || null
    });
  }

  async cancelar(id: number, usuarioId: number) {
    const reserva = await reservaRepository.buscarPorId(id);

    if (!reserva) {
      throw new Error("Reserva não encontrada.");
    }

    if (reserva.UsuarioId !== usuarioId) {
      throw new Error("Você não pode cancelar esta reserva.");
    }

    if (reserva.status === "cancelada") {
      throw new Error("Esta reserva já está cancelada.");
    }

    return reservaRepository.cancelar(id);
  }
}

export default new ReservaService();
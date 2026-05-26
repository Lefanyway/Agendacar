import { Carro, Reserva } from "../models";
import {
  CriarReservaRepositoryDTO,
  IReservaRepository
} from "../contracts/ReservaRepositoryContract";

class ReservaRepository implements IReservaRepository {
  async listarPorUsuario(usuarioId: number): Promise<Reserva[]> {
    return Reserva.findAll({
      where: { UsuarioId: usuarioId },
      include: [
        {
          model: Carro
        }
      ],
      order: [["createdAt", "DESC"]]
    });
  }

  async buscarPorId(id: number): Promise<Reserva | null> {
    return Reserva.findByPk(id, {
      include: [
        {
          model: Carro
        }
      ]
    });
  }

  async criar(dados: CriarReservaRepositoryDTO): Promise<Reserva> {
    return Reserva.create(dados);
  }

  async cancelar(id: number): Promise<Reserva | null> {
    const reserva = await Reserva.findByPk(id);

    if (!reserva) {
      return null;
    }

    await reserva.update({
      status: "cancelada"
    });

    return reserva;
  }
}

export default new ReservaRepository();
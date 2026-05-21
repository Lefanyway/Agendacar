import { Carro, Reserva } from "../models";

class ReservaRepository {
  async listarPorUsuario(usuarioId: number) {
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

  async buscarPorId(id: number) {
    return Reserva.findByPk(id, {
      include: [
        {
          model: Carro
        }
      ]
    });
  }

  async criar(dados: {
    UsuarioId: number;
    CarroId: number;
    dataInicio: string;
    dataFim: string;
    valorTotal: number;
    destino?: string | null;
  }) {
    return Reserva.create(dados);
  }

  async cancelar(id: number) {
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
import Usuario from "./Usuario";
import Carro from "./Carro";
import Reserva from "./Reserva";

Usuario.hasMany(Reserva, {
  foreignKey: "UsuarioId",
  onDelete: "CASCADE"
});

Reserva.belongsTo(Usuario, {
  foreignKey: "UsuarioId"
});

Carro.hasMany(Reserva, {
  foreignKey: "CarroId",
  onDelete: "CASCADE"
});

Reserva.belongsTo(Carro, {
  foreignKey: "CarroId"
});

export { Usuario, Carro, Reserva };

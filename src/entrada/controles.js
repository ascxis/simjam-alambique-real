const CAMPOS_CRUDOS = ['altura', 'x', 'pellizco', 'giro'];

export function crearManoControl() {
  return {
    altura: 0.5, x: 0, pellizco: 0, giro: 0,
    puno: false, dedos: 0, presente: false,
    u_crudo: { altura: 0.5, x: 0, pellizco: 0, giro: 0 },
    medidaCruda: { altura: 0.5, x: 0, pellizco: 0, giro: 0 }
  };
}

export function actualizarCrudos(manual) {
  manual.u_crudo ||= {};
  manual.medidaCruda ||= {};
  for (const campo of CAMPOS_CRUDOS) {
    manual.u_crudo[campo] = manual[campo];
    manual.medidaCruda[campo] = manual[campo];
  }
  return manual;
}

export const leerPreferencia = (clave, defecto) => {
  try { const valor = localStorage.getItem(clave); return valor === null ? defecto : valor; }
  catch { return defecto; }
};

export const guardarPreferencia = (clave, valor) => {
  try { localStorage.setItem(clave, valor); }
  catch {}
};

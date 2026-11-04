export function descargarCSV(registro, nombre = 'partida.csv') {
  if (!registro || typeof registro.csv !== 'function') return;
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(new Blob(['\ufeff' + registro.csv()], { type: 'text/csv;charset=utf-8' }));
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}

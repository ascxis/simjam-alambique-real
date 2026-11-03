export function crearPanelDepuracion(scene, { intercambiar = false, onIntercambiar = () => {}, alfa = 0.5, onAlfa = () => {} } = {}) {
  const panel = document.createElement('div'); panel.id = 'camera-debug-info';
  Object.assign(panel.style, { display: 'none', boxSizing: 'border-box', width: '620px', maxWidth: '620px', margin: '0', padding: '10px 12px', background: 'rgba(28,32,38,.94)', color: '#E6E8EA', font: '12px/1.45 monospace', whiteSpace: 'pre-wrap', border: '1px solid #B85A24', borderRadius: '8px', pointerEvents: 'auto' });
  const etiqueta = document.createElement('label'); etiqueta.style.cssText = 'display:block;font:13px system-ui;margin-top:6px'; etiqueta.innerHTML = '<input type="checkbox"> Intercambiar etiquetas der./izq.';
  const casilla = etiqueta.querySelector('input'); casilla.checked = intercambiar; casilla.addEventListener('change', () => onIntercambiar(casilla.checked));
  const fila = document.createElement('div');
  Object.assign(fila.style, { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', margin: '7px 0' });
  const tituloAlfa = document.createElement('span'); tituloAlfa.textContent = 'Filtro α:';
  const botonesAlfa = [];
  for (const valor of [0.2, 0.5, 0.8]) {
    const boton = document.createElement('button'); boton.type = 'button'; boton.textContent = String(valor).replace('.', ',');
    Object.assign(boton.style, { cursor: 'pointer', padding: '3px 8px', color: '#F2E6C9', background: '#3A3D40', border: '1px solid #B85A24', borderRadius: '5px', font: '12px system-ui' });
    boton.addEventListener('click', () => { onAlfa(valor); marcarAlfa(valor); });
    botonesAlfa.push({ boton, valor }); fila.append(boton);
  }
  function marcarAlfa(actual) {
    for (const item of botonesAlfa) {
      const seleccionado = Math.abs(item.valor - actual) < 1e-9;
      item.boton.setAttribute('aria-pressed', String(seleccionado));
      item.boton.style.background = seleccionado ? '#B85A24' : '#3A3D40';
      item.boton.style.fontWeight = seleccionado ? '700' : '400';
    }
  }
  fila.prepend(tituloAlfa); marcarAlfa(alfa);
  const texto = document.createElement('div');
  const mediciones = document.createElement('div'); mediciones.style.cssText = 'margin-top:5px;color:#F2E6C9';
  const filaCopiar = document.createElement('div'); filaCopiar.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:7px';
  const copiar = document.createElement('button'); copiar.type = 'button'; copiar.textContent = 'Copiar medición';
  Object.assign(copiar.style, { cursor: 'pointer', padding: '5px 9px', color: '#F2E6C9', background: '#B85A24', border: '1px solid #1A1B1D', borderRadius: '5px', font: '12px system-ui' });
  const estadoCopiar = document.createElement('span'); estadoCopiar.setAttribute('aria-live', 'polite');
  let lineaMedicion = '';
  copiar.addEventListener('click', async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(lineaMedicion);
      else {
        const auxiliar = document.createElement('textarea'); auxiliar.value = lineaMedicion; auxiliar.style.position = 'fixed'; auxiliar.style.opacity = '0'; document.body.append(auxiliar); auxiliar.select();
        if (!document.execCommand('copy')) throw new Error('El navegador no permitió copiar al portapapeles'); auxiliar.remove();
      }
      estadoCopiar.textContent = 'Medición copiada';
    } catch (error) { estadoCopiar.textContent = `No se pudo copiar: ${error.message}`; }
  });
  filaCopiar.append(copiar, estadoCopiar);
  panel.append(etiqueta, fila, texto, mediciones, filaCopiar);
  const dom = scene.add.dom(18, 105, panel).setOrigin(0, 0).setDepth(50).setVisible(false);
  return {
    setVisible(visible) { panel.style.display = visible ? 'block' : 'none'; if (visible) dom.setPosition(18, 105).setOrigin(0, 0); dom.setVisible(visible); },
    actualizar({ fps, fpsCamara, fpsJuego, tiempoDeteccionMs, tiempoCuadroMs, delegado, resolucion, avisoResolucion = '', alertaFPS = '', alfa, Ts, tau, controles, x, canales = {} }) {
      marcarAlfa(alfa);
      const formatMano = (id) => {
        const mano = controles?.[id] ?? {}, crudos = mano.u_crudo ?? {};
        return `${id} ${mano.presente ? 'en zona' : 'fuera'} | ` + ['altura', 'x', 'pellizco', 'giro'].map((k) => `${k} ${numero(crudos[k])}→${numero(mano[k])}`).join(' | ');
      };
      const alertaJuego = Number.isFinite(fpsJuego) && fpsJuego < 30 ? ' · AVISO: juego bajo 30 FPS' : '';
      const estado = Array.isArray(x) ? x : [];
      const dimensiones = resolucion ? `${resolucion.ancho}×${resolucion.alto}` : '—';
      const aviso = avisoResolucion ? `\nAVISO: ${avisoResolucion}` : '';
      texto.textContent = `Juego ${formato(fpsJuego, 1)} FPS (${formato(tiempoCuadroMs, 1)} ms/cuadro) · detección ${formato(fps, 1)} FPS (${formato(tiempoDeteccionMs, 1)} ms/detección) · cámara ${formato(fpsCamara, 1)} FPS\nMediaPipe ${delegado || '—'} · video ${dimensiones}${alertaFPS}${alertaJuego}${aviso}\nα=${formato(alfa, 3)} · Ts=${formato(Ts, 4)} s · τf=${formato(tau, 4)} s\n${formatMano('der')}\n${formatMano('izq')}\nx(t)=[${estado.map((v) => formato(v, 3)).join(', ')}]`;
      const lineaCanal = (nombre, datos) => `${nombre}: ruido p-p ${formato(datos?.ruido, 4)} · τf ${formato(tau * 1000, 1)} ms · retraso n=${datos?.n ?? 0}, último ${formatoMs(datos?.ultimoRetraso)} · media 5 ${formatoMs(datos?.retrasoPromedio)}`;
      mediciones.textContent = `${lineaCanal('der.altura', canales['der.altura'])}\n${lineaCanal('izq.pellizco', canales['izq.pellizco'])}`;
      lineaMedicion = `α=${formato(alfa, 3)}; Ts=${formato(Ts * 1000, 2)} ms; τ=${formato(tau * 1000, 2)} ms; ${lineaCanal('der.altura', canales['der.altura'])}; ${lineaCanal('izq.pellizco', canales['izq.pellizco'])}`;
    },
    destruir() { panel.remove(); dom.destroy(); }
  };
}

function formato(valor, decimales = 2) { return Number.isFinite(valor) ? Number(valor).toFixed(decimales) : '—'; }
function numero(valor) { return formato(Number(valor), 2); }
function formatoMs(valor) { return Number.isFinite(valor) ? `${Number(valor).toFixed(1)} ms` : '—'; }

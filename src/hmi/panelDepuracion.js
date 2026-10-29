export function crearPanelDepuracion(scene, { intercambiar = false, onIntercambiar = () => {} } = {}) {
  const panel = document.createElement('div'); panel.id = 'camera-debug-info';
  Object.assign(panel.style, { display: 'none', boxSizing: 'border-box', width: '540px', maxWidth: '540px', margin: '0', padding: '10px 12px', background: 'rgba(35,42,44,.88)', color: '#fff', font: '12px/1.5 monospace', whiteSpace: 'pre-wrap', borderRadius: '4px', pointerEvents: 'auto' });
  const etiqueta = document.createElement('label'); etiqueta.style.cssText = 'display:block;font:13px system-ui;margin-top:6px'; etiqueta.innerHTML = '<input type="checkbox"> Intercambiar etiquetas der./izq.';
  const casilla = etiqueta.querySelector('input'); casilla.checked = intercambiar; casilla.addEventListener('change', () => onIntercambiar(casilla.checked));
  const texto = document.createElement('div'); panel.append(etiqueta, texto);
  const dom = scene.add.dom(18, 105, panel).setOrigin(0, 0).setDepth(50).setVisible(false);
  return {
    setVisible(visible) { panel.style.display = visible ? 'block' : 'none'; if (visible) dom.setPosition(18, 105).setOrigin(0, 0); dom.setVisible(visible); },
    actualizar({ fps, fpsCamara, fpsJuego, tiempoDeteccionMs, tiempoCuadroMs, delegado, resolucion, avisoResolucion = '', alertaFPS = '', alfa, Ts, tau, controles, x }) {
      const formatMano = (id) => {
        const mano = controles?.[id] ?? {}, crudos = mano.u_crudo ?? {};
        return `${id} ${mano.presente ? 'en zona' : 'fuera'} | ` + ['altura', 'x', 'pellizco', 'giro'].map((k) => `${k} ${numero(crudos[k])}→${numero(mano[k])}`).join(' | ');
      };
      const alertaJuego = Number.isFinite(fpsJuego) && fpsJuego < 30 ? ' · AVISO: juego bajo 30 FPS' : '';
      const estado = Array.isArray(x) ? x : [];
      const dimensiones = resolucion ? `${resolucion.ancho}×${resolucion.alto}` : '—';
      const aviso = avisoResolucion ? `\nAVISO: ${avisoResolucion}` : '';
      texto.textContent = `Juego ${formato(fpsJuego, 1)} FPS (${formato(tiempoCuadroMs, 1)} ms/cuadro) · detección ${formato(fps, 1)} FPS (${formato(tiempoDeteccionMs, 1)} ms/detección) · cámara ${formato(fpsCamara, 1)} FPS\nMediaPipe ${delegado || '—'} · video ${dimensiones}${alertaFPS}${alertaJuego}${aviso}\nα=${formato(alfa, 3)} · Ts=${formato(Ts, 4)} s · τf=${formato(tau, 4)} s\n${formatMano('der')}\n${formatMano('izq')}\nx(t)=[${estado.map((v) => formato(v, 3)).join(', ')}]`;
    },
    destruir() { panel.remove(); dom.destroy(); }
  };
}

function formato(valor, decimales = 2) { return Number.isFinite(valor) ? Number(valor).toFixed(decimales) : '—'; }
function numero(valor) { return formato(Number(valor), 2); }

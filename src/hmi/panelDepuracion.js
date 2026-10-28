export function crearPanelDepuracion(scene, { intercambiar = false, onIntercambiar = () => {} } = {}) {
  const panel = document.createElement('div'); panel.id = 'camera-debug-info';
  Object.assign(panel.style, { display: 'none', boxSizing: 'border-box', width: '540px', maxWidth: '540px', padding: '10px 12px', background: 'rgba(35,42,44,.88)', color: '#fff', font: '12px/1.5 monospace', whiteSpace: 'pre-wrap', borderRadius: '4px' });
  const etiqueta = document.createElement('label'); etiqueta.style.cssText = 'display:block;font:13px system-ui;margin-top:6px'; etiqueta.innerHTML = '<input type="checkbox"> Intercambiar etiquetas der./izq.';
  const casilla = etiqueta.querySelector('input'); casilla.checked = intercambiar; casilla.addEventListener('change', () => onIntercambiar(casilla.checked));
  const texto = document.createElement('div'); panel.append(etiqueta, texto);
  const dom = scene.add.dom(18, 105, panel).setOrigin(0, 0).setVisible(false);
  return {
    setVisible(visible) { panel.style.display = visible ? 'block' : 'none'; dom.setVisible(visible); },
    actualizar({ fps, fpsCamara, alertaFPS = '', alfa, Ts, tau, controles, x }) {
      const formatMano = (id) => {
        const mano = controles?.[id] ?? {}, crudos = mano.u_crudo ?? {};
        return `${id} ${mano.presente ? 'en zona' : 'fuera'} | ` + ['altura', 'x', 'pellizco', 'giro'].map((k) => `${k} ${Number(crudos[k] ?? 0).toFixed(2)}→${Number(mano[k] ?? 0).toFixed(2)}`).join(' | ');
      };
      texto.textContent = `Detección ${fps?.toFixed(1) ?? '—'} FPS · cámara ${fpsCamara?.toFixed(1) ?? '—'} FPS${alertaFPS}\nα=${alfa} · Ts=${Ts.toFixed(4)} s · τf=${tau.toFixed(4)} s\n${formatMano('der')}\n${formatMano('izq')}\nx(t)=[${x.map((v) => v.toFixed(3)).join(', ')}]`;
    },
    destruir() { panel.remove(); dom.destroy(); }
  };
}

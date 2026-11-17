// Ventana "Configurar controles": muestra cada acción del juego con su control actual (teclado o gamepad)
// y permite cambiarlo. Es HTML encima del canvas, igual que los selectores del menú.
import {
  ACCIONES, TECLAS_RESERVADAS, cargarConfig, guardarConfig, restablecerConfig, asignarControl,
  nombreControl, nombreTecla, elegirGamepad, reposoGamepad, detectarPulsacion
} from '../entrada/configControles.js';

const CSS = {
  fondo: 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:50;display:flex;align-items:center;justify-content:center;font:14px Segoe UI,Arial,sans-serif;color:#E6E8EA',
  caja: 'background:#1C2026;border:2px solid #B85A24;border-radius:10px;padding:18px 22px;width:min(640px,94vw);max-height:94vh;overflow:auto',
  boton: 'background:#B85A24;color:#fff;border:0;border-radius:7px;padding:7px 14px;font:14px Segoe UI,Arial,sans-serif;cursor:pointer',
  botonSec: 'background:#3a3d40;color:#E6E8EA;border:1px solid #64777d;border-radius:7px;padding:7px 14px;font:14px Segoe UI,Arial,sans-serif;cursor:pointer'
};

export function abrirPanelControles(origen, { alCerrar = () => {} } = {}) {
  let cfg = cargarConfig();
  let escuchando = null;            // { accion, cancelar }
  let raf = 0;
  const esTeclado = origen === 'teclado';
  const fondo = document.createElement('div'); fondo.style.cssText = CSS.fondo; fondo.dataset.panelControles = origen;
  const caja = document.createElement('div'); caja.style.cssText = CSS.caja; fondo.append(caja);
  document.body.append(fondo);
  // Phaser escucha mouseup en toda la ventana: sin esto, "Listo" también pulsaba el botón que queda debajo.
  for (const tipo of ['mousedown', 'mouseup', 'pointerdown', 'pointerup', 'touchstart', 'touchend', 'click']) {
    fondo.addEventListener(tipo, (ev) => { ev.stopPropagation(); if (tipo.startsWith('mouse')) ev.preventDefault(); });
  }

  const cerrar = () => {
    cancelAnimationFrame(raf); escuchando?.cancelar(); document.removeEventListener('keydown', alTecla, true); fondo.remove(); alCerrar();
  };

  const pintar = (mensaje = '') => {
    caja.replaceChildren();
    const titulo = document.createElement('div');
    titulo.style.cssText = 'font:bold 20px Georgia,serif;color:#F2E6C9;margin-bottom:4px';
    titulo.textContent = `Configurar controles · ${esTeclado ? 'Teclado' : 'Gamepad'}`;
    const sub = document.createElement('div'); sub.style.cssText = 'color:#b9c0c4;margin-bottom:10px';
    sub.textContent = 'Pulsa "Cambiar" en una acción y luego ' + (esTeclado ? 'la tecla que quieras usar' : 'el botón (o mueve el stick) que quieras usar') + '. Se guarda solo.';
    caja.append(titulo, sub);
    if (!esTeclado) {
      const estado = document.createElement('div'); estado.id = 'estado-gamepad';
      estado.style.cssText = 'background:#12161a;border:1px solid #3a3d40;border-radius:7px;padding:7px 10px;margin-bottom:10px;font-size:13px;white-space:pre-wrap';
      caja.append(estado);
    }
    const tabla = document.createElement('div'); tabla.style.cssText = 'display:grid;grid-template-columns:1fr auto auto;gap:6px 10px;align-items:center';
    for (const a of ACCIONES) {
      const t = document.createElement('div');
      t.innerHTML = `<div>${a.texto}</div><div style="color:#9aa3a8;font-size:12px">${a.ayuda}</div>`;
      const actual = document.createElement('div');
      const enEspera = escuchando?.accion === a.id;
      actual.style.cssText = `min-width:150px;text-align:center;padding:6px 10px;border-radius:7px;border:1px solid ${enEspera ? '#FFD700' : '#64777d'};background:#12161a;font-weight:bold;color:${enEspera ? '#FFD700' : '#F2E6C9'}`;
      actual.textContent = enEspera ? (esTeclado ? 'Pulsa una tecla…' : 'Pulsa un botón…') : nombreControl(origen, cfg[origen][a.id]);
      const b = document.createElement('button'); b.style.cssText = CSS.botonSec; b.textContent = enEspera ? 'Cancelar' : 'Cambiar';
      b.addEventListener('click', () => { if (enEspera) { escuchando.cancelar(); pintar(); } else escuchar(a.id); });
      tabla.append(t, actual, b);
    }
    caja.append(tabla);
    const msg = document.createElement('div'); msg.id = 'mensaje-controles'; msg.style.cssText = 'min-height:20px;margin-top:10px;color:#FFD700'; msg.textContent = mensaje;
    caja.append(msg);
    const pie = document.createElement('div'); pie.style.cssText = 'display:flex;gap:10px;justify-content:flex-end;margin-top:6px';
    const nota = document.createElement('div'); nota.style.cssText = 'flex:1;color:#9aa3a8;font-size:12px;align-self:center';
    nota.textContent = esTeclado ? 'Fijas: P parámetros · D depuración · M silencio.' : 'Chrome solo ve el gamepad después de pulsar un botón.';
    const rest = document.createElement('button'); rest.style.cssText = CSS.botonSec; rest.textContent = 'Restablecer valores';
    rest.addEventListener('click', () => { escuchando?.cancelar(); cfg = restablecerConfig(origen); pintar('Valores por defecto restablecidos.'); });
    const ok = document.createElement('button'); ok.style.cssText = CSS.boton; ok.textContent = 'Listo'; ok.addEventListener('click', cerrar);
    pie.append(nota, rest, ok); caja.append(pie);
  };

  const asignar = (accion, control) => {
    const intercambio = asignarControl(cfg, origen, accion, control);
    guardarConfig(cfg); escuchando = null;
    const otro = intercambio ? ACCIONES.find((a) => a.id === intercambio)?.texto : null;
    pintar(otro ? `Listo. "${otro}" tenía ese control y recibió el anterior.` : 'Guardado.');
  };

  const escuchar = (accion) => {
    escuchando?.cancelar();
    if (esTeclado) { escuchando = { accion, cancelar: () => { escuchando = null; } }; pintar(); return; }
    // Gamepad: se espera un botón nuevo o un eje que se mueva respecto de su valor inicial.
    const gp0 = elegirGamepad();
    const reposo = reposoGamepad(gp0);
    let activo = true;
    escuchando = { accion, cancelar: () => { activo = false; escuchando = null; } };
    pintar(gp0 ? '' : 'No se detecta el gamepad: pulsa cualquier botón del control.');
    const sondear = () => {
      if (!activo) return;
      const gp = elegirGamepad();
      const control = detectarPulsacion(gp, reposo);
      if (control) return asignar(accion, control);
      if (gp) reposo.botones = reposoGamepad(gp).botones;
      requestAnimationFrame(sondear);
    };
    requestAnimationFrame(sondear);
  };

  function alTecla(ev) {
    if (!esTeclado || !escuchando) { if (ev.code === 'Escape') cerrar(); return; }
    ev.preventDefault(); ev.stopPropagation();
    if (ev.code === 'Escape') { escuchando = null; pintar(); return; }
    if (TECLAS_RESERVADAS[ev.code]) { const a = escuchando.accion; escuchando = null; pintar(`${nombreTecla(ev.code)} está reservada para ${TECLAS_RESERVADAS[ev.code]}. Elige otra.`); escuchar(a); return; }
    asignar(escuchando.accion, ev.code);
  }
  document.addEventListener('keydown', alTecla, true);

  // Lectura en vivo del gamepad: ayuda a saber qué número tiene cada botón o eje.
  if (!esTeclado) {
    const refrescar = () => {
      const el = caja.querySelector('#estado-gamepad');
      if (el) {
        const gp = elegirGamepad();
        if (!gp) el.textContent = 'Gamepad: no detectado. Conéctalo y pulsa un botón.';
        else {
          const botones = gp.buttons.map((b, i) => (b.pressed || b.value > .5 ? i : null)).filter((i) => i !== null);
          const ejes = gp.axes.map((v, i) => (Math.abs(v) > .15 ? `${i}:${v.toFixed(2)}` : null)).filter(Boolean);
          el.textContent = `Gamepad: ${gp.id.slice(0, 60)} · mapeo ${gp.mapping || 'no estándar'}\nBotones pulsados: ${botones.join(', ') || '—'}   Ejes activos: ${ejes.join('  ') || '—'}`;
        }
      }
      raf = requestAnimationFrame(refrescar);
    };
    refrescar();
  }
  pintar();
  return { cerrar };
}

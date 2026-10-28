import { EscenaBase } from './EscenaBase.js';
import { dibujarTendencia } from '../hmi/tendencia.js';
import { evaluarNivel } from '../modelo/niveles.js';
import { PARAMETROS_TANQUES } from '../modelo/tanques.js';
import { contextoJuego } from './contexto.js';

function metricasTanque(muestras, nivel) {
  const dentro = (m) => Math.abs(m.y - m.h_sp) <= m.tolerancia;
  let iae = 0, ise = 0, tiempoEnBanda = 0, nivelMaximo = 0;
  for (let i = 0; i < muestras.length; i++) {
    const m = muestras[i]; nivelMaximo = Math.max(nivelMaximo, ...(m.x || [m.y]));
    if (i) {
      const p = muestras[i - 1], dt = m.t - p.t;
      iae += (Math.abs(m.h_sp - m.y) + Math.abs(p.h_sp - p.y)) * .5 * dt;
      ise += ((m.h_sp - m.y) ** 2 + (p.h_sp - p.y) ** 2) * .5 * dt;
      if (dentro(m) && dentro(p)) tiempoEnBanda += dt;
    }
  }
  return { iae, ise, tiempoEnBanda, nivelMaximo, valorFinal: muestras.at(-1)?.y ?? nivel.referencia };
}

function medirTauPrimerTramo(muestras) {
  for (let i = 1; i < muestras.length; i++) {
    const inicio = muestras[i].t;
    let j = i, minimo = Infinity, maximo = -Infinity;
    while (j < muestras.length && muestras[j].t - inicio <= 2.001) {
      minimo = Math.min(minimo, muestras[j].u);
      maximo = Math.max(maximo, muestras[j].u);
      j++;
    }
    if (muestras[j - 1].t - inicio < 2 || maximo - minimo >= .02) continue;
    const v1 = muestras.slice(i, j).reduce((s, m) => s + m.u, 0) / (j - i);
    const inicioCambio = Math.max(0, inicio - 2);
    let huboCambio = false;
    for (let k = i - 1; k >= 0 && muestras[k].t >= inicioCambio; k--) {
      if (Math.abs(muestras[k].u - v1) > .02) { huboCambio = true; break; }
    }
    if (!huboCambio) continue;
    const hInicial = muestras[i].x?.[0], equilibrio = (PARAMETROS_TANQUES.caudalEntradaMaximo * v1 / PARAMETROS_TANQUES.coeficienteDescarga1) ** 2;
    if (!Number.isFinite(hInicial) || equilibrio <= 0 || Math.abs(equilibrio - hInicial) < 1e-9) continue;
    const objetivo = hInicial + .632 * (equilibrio - hInicial);
    for (let k = i + 1; k < muestras.length; k++) {
      const anterior = muestras[k - 1], actual = muestras[k], a = anterior.x?.[0], b = actual.x?.[0];
      const cruzo = equilibrio > hInicial ? a < objetivo && b >= objetivo : a > objetivo && b <= objetivo;
      if (!cruzo) continue;
      const fraccion = (objetivo - a) / (b - a);
      const cruce = anterior.t + fraccion * (actual.t - anterior.t);
      return { tau: cruce - inicio, teorico: 2 * PARAMETROS_TANQUES.area * Math.sqrt(equilibrio) / PARAMETROS_TANQUES.coeficienteDescarga1, equilibrio, v1 };
    }
    i = j - 1;
  }
  return null;
}

export class Fin extends EscenaBase {
  constructor() { super('Fin'); }
  create(data) {
    const inicio = performance.now();
    console.info('[DIAG] Fin.create inicio', '0.0 ms');
    this.events.once('render', () => console.info('[DIAG] Fin primer render'));
    try {
      this.time.delayedCall(500, () => {
        try {
          contextoJuego.camara?.pausarDeteccion();
          console.info('cámara detenida: detección pausada; stream y detector conservados');
        } catch (error) { console.error('[ERROR JUEGO] Fin.create', error); }
      });
      this.renderFin(data || {});
    } catch (error) {
      console.error('[ERROR JUEGO] Fin.create', error);
      try { this.mostrarFinFallback(data || {}); }
      catch (errorFallback) { console.error('[ERROR JUEGO] Fin.create', errorFallback); }
    } finally {
      console.info('[DIAG] Fin.create fin', `${(performance.now() - inicio).toFixed(1)} ms`);
    }
    this.events.once('shutdown', () => { try { contextoJuego.camara?.pausarDeteccion(); } catch (error) { console.error('[ERROR JUEGO] Fin.create', error); } });
  }

  renderFin(data) {
    this.crearFondo('Lo que pasó en el modelo');
    const nivel = data.nivel || { nombre: 'Nivel', tanques: 1, referencia: 1 };
    const muestras = data.muestras || [], resultado = data.resultado || evaluarNivel(nivel, muestras, data.alarmas || []);
    const metricas = metricasTanque(muestras, nivel);
    const tau = medirTauPrimerTramo(muestras);
    const estado = data.desborde ? 'DESBORDE · partida terminada' : resultado.superado ? 'NIVEL SUPERADO' : 'NIVEL NO SUPERADO';
    this.add.text(36, 108, `${nivel.nombre} · ${estado} · criterio: ${resultado.texto}`, { fontSize: '19px', color: resultado.superado && !data.desborde ? '#2f7146' : '#922d2d', fontStyle: 'bold' });
    this.add.text(36, 143, `Nivel final ${metricas.valorFinal.toFixed(3)} m · máximo ${metricas.nivelMaximo.toFixed(3)} m · tiempo en banda ${metricas.tiempoEnBanda.toFixed(1)} s · IAE ${metricas.iae.toFixed(3)} m·s`, { fontSize: '16px', color: '#252b2d' });
    const alturas = muestras.map((m) => ({ ...m, h: m.y }));
    dibujarTendencia(this, { x: 45, y: 190, ancho: 565, alto: 235, muestras: alturas, clave: 'h', min: 0, max: 3, unidad: 'm', titulo: 'Nivel controlado h(t) y tolerancia', series: [{ clave: 'h', nombre: `h${nivel.tanques}`, color: 0x325f68 }, { clave: 'h_sp', nombre: 'referencia', color: 0x75643d }], bandaInferiorClave: 'banda_inf', bandaSuperiorClave: 'banda_sup', tiempoCompleto: true, ejeTiempo: true });
    dibujarTendencia(this, { x: 640, y: 190, ancho: 565, alto: 235, muestras, clave: 'u', min: 0, max: 1, unidad: '', titulo: 'Apertura de válvulas v(t)', series: [{ clave: 'u', nombre: 'v1 entrada', color: 0x425e67 }, ...(nivel.tanques === 2 ? [{ clave: 'v2', nombre: 'v2 salida', color: 0x875a3e }] : [])], tiempoCompleto: true, ejeTiempo: true });
    const alarmasTexto = (data.alarmas || []).length ? data.alarmas.map((a) => `${a.tipo}${a.tanque} @ ${a.t.toFixed(1)} s (${a.altura.toFixed(2)} m)`).join(' · ') : 'sin alarmas H / HH';
    const comparacionTau = tau ? `${tau.tau.toFixed(2)} s frente a ${tau.teorico.toFixed(2)} s (v₁=${tau.v1.toFixed(2)}, h_eq=${tau.equilibrio.toFixed(2)} m)` : 'no disponible';
    this.add.text(45, 440, `Modelo: A·dh₁/dt = 0.4v₁ − 0.2√h₁; A·dh₂/dt = 0.2√h₁ − 0.2v₂√h₂ − qd\nParámetros: A=${data.parametros?.area ?? 1} m² · c₁=c₂=0.2 m²·⁵/s · qin,max=0.4 m³/s · slew=0.25 s⁻¹\nAlarmas: ${alarmasTexto}\nτ medido / teórico tras estabilizar v₁: ${comparacionTau} · ISE ${metricas.ise.toFixed(3)}`, { fontSize: '14px', color: '#303638', lineSpacing: 5, wordWrap: { width: 1135 } });
    this.add.text(45, 545, 'El caudal de salida depende de √h, por eso el tanque es no lineal.\nAlrededor de una altura de operación, la ecuación se aproxima por un modelo lineal con τ y K locales.\nLa válvula limita la rapidez del caudal y la perturbación qd cambia el equilibrio.\nLas tendencias y alarmas permiten comparar la respuesta con la referencia y su banda.', { fontSize: '14px', color: '#414b4e', lineSpacing: 5 });
    this.boton(45, 637, 'Descargar CSV', () => data.registro?.descargar(`nivel-${nivel.id}-partida.csv`));
    this.boton(260, 637, 'Volver al menú', () => this.scene.start('Menu'));
    this.add.text(510, 645, `CSV: t,u_crudo,u,x1,x2,y,v2,q_d,h_sp · τ local ${tau?.teorico.toFixed(2) ?? 'n/d'} s`, { fontSize: '12px', color: '#424c4f' });
  }

  mostrarFinFallback(data) {
    const nivel = data.nivel || { id: '?', nombre: 'Nivel' };
    const resultado = data.resultado || {};
    const estado = data.desborde ? 'Desborde' : resultado.superado ? 'Nivel superado' : 'Nivel no superado';
    this.add.text(36, 62, 'Lo que pasó en el modelo', { fontSize: '30px', color: '#252b2d', fontStyle: 'bold' });
    this.add.text(36, 120, `${nivel.nombre} · ${estado} · ${resultado.texto || 'resultado no disponible'}`, { fontSize: '19px', color: '#252b2d', wordWrap: { width: 1180 } });
    this.boton(45, 637, 'Descargar CSV', () => data.registro?.descargar(`nivel-${nivel.id}-partida.csv`));
    this.boton(260, 637, 'Volver al menú', () => this.scene.start('Menu'));
  }
}

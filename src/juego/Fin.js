import { EscenaBase } from './EscenaBase.js';
import { dibujarTendencia } from '../hmi/tendencia.js';
import { evaluarNivel } from '../modelo/niveles.js';
import { PARAMETROS_TANQUES } from '../modelo/tanques.js';
import { contextoJuego } from './contexto.js';
import { LAYOUT } from '../hmi/layout.js';
import { fuenteInterfaz, fuenteTitulo } from '../hmi/estilo.js';

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
    this.crearFondo();
    const F = LAYOUT.final;
    if (this.textures.exists('panel-final')) this.add.image(F.marco.x + F.marco.ancho / 2, F.marco.y + F.marco.alto / 2, 'panel-final').setDisplaySize(F.marco.ancho, F.marco.alto).setDepth(-4);
    else this.panel(F.marco, { profundidad: -4 });
    this.panel(F.panel, { profundidad: -4 });
    const nivel = data.nivel || { nombre: 'Nivel', tanques: 1, referencia: 1 };
    const muestras = data.muestras || [], resultado = data.resultado || evaluarNivel(nivel, muestras, data.alarmas || []);
    const metricas = metricasTanque(muestras, nivel);
    const tau = medirTauPrimerTramo(muestras);
    const estado = data.desborde ? 'DESBORDE · PARTIDA TERMINADA' : resultado.superado ? 'NIVEL SUPERADO' : 'NO SUPERADO';
    this.add.text(F.titulo.x, F.titulo.y, 'Lo que pasó en el modelo', fuenteTitulo(22)).setOrigin(.5);
    this.add.text(F.resultado.x, F.resultado.y, `${estado} · ${resultado.texto || ''}`, fuenteInterfaz(18, resultado.superado && !data.desborde ? '#2ECC71' : '#FF1744', { fontStyle: 'bold' })).setWordWrapWidth(F.resultado.ancho);
    this.add.text(F.metricasHeading.x, F.metricasHeading.y, 'Métricas de la partida', fuenteInterfaz(16, '#F2E6C9', { fontStyle: 'bold' }));
    this.add.text(F.metricas.x, F.metricas.y, `Nivel final: ${metricas.valorFinal.toFixed(3)} m\nMáximo: ${metricas.nivelMaximo.toFixed(3)} m\nTiempo en banda: ${metricas.tiempoEnBanda.toFixed(1)} s\nIAE: ${metricas.iae.toFixed(3)} m·s · ISE: ${metricas.ise.toFixed(3)} m²·s`, fuenteInterfaz(16)).setLineSpacing(5);
    const alturas = muestras.map((m) => ({ ...m, h: m.y }));
    dibujarTendencia(this, { ...F.graficaH, muestras: alturas, clave: 'h', min: 0, max: 3, unidad: 'm', titulo: 'h(t)', series: [{ clave: 'h', nombre: `h${nivel.tanques}`, color: 0xe6e8ea }, { clave: 'h_sp', nombre: 'referencia', color: 0xc9a227 }], bandaInferiorClave: 'banda_inf', bandaSuperiorClave: 'banda_sup', tiempoCompleto: true, ejeTiempo: true, fondoTransparente: true, rejillaPanel: true });
    dibujarTendencia(this, { ...F.graficaV, muestras, clave: 'u', min: 0, max: 1, unidad: '', titulo: 'v(t)', tituloEjeY: 'apertura', formatoTickY: (v) => Number(v.toFixed(2)).toString(), series: [{ clave: 'u', nombre: 'v1', color: 0xe6e8ea }, ...(nivel.tanques === 2 ? [{ clave: 'v2', nombre: 'v2', color: 0x2ecc71 }] : [])], tiempoCompleto: true, ejeTiempo: true, fondoTransparente: true, rejillaPanel: true });
    const alarmasTexto = (data.alarmas || []).length ? data.alarmas.map((a) => `${a.tipo}${a.tanque} @ ${a.t.toFixed(1)} s (${a.altura.toFixed(2)} m)`).join(' · ') : 'sin alarmas H / HH';
    const comparacionTau = tau ? `${tau.tau.toFixed(2)} s frente a ${tau.teorico.toFixed(2)} s (v₁=${tau.v1.toFixed(2)}, h_eq=${tau.equilibrio.toFixed(2)} m)` : 'no disponible';
    this.add.text(F.rightTitle.x, F.rightTitle.y, 'Modelo, parámetros y análisis', fuenteTitulo(25));
    this.add.text(F.modelo.x, F.modelo.y, `A·dh₁/dt = 0.4v₁ − 0.2√h₁\nA·dh₂/dt = 0.2√h₁ − 0.2v₂√h₂ − qd\nParámetros: A=${data.parametros?.area ?? 1} m² · c₁=c₂=0.2 m²·⁵/s\nqin,max=0.4 m³/s · slew=0.25 s⁻¹\nAlarmas: ${alarmasTexto}\nτ medido / teórico: ${comparacionTau}`, fuenteInterfaz(14, '#E6E8EA', { lineSpacing: 3 })).setWordWrapWidth(F.modelo.ancho);
    this.add.text(F.explicacion.x, F.explicacion.y, 'El caudal de salida depende de √h, por eso el tanque es no lineal.\nCerca de una altura de operación se aproxima con un modelo lineal y valores locales de τ y K.\nLa válvula limita la rapidez del caudal; qd modifica el equilibrio.\nLas tendencias comparan la respuesta con la referencia y su banda.', fuenteInterfaz(16, '#E6E8EA', { lineSpacing: 8 })).setWordWrapWidth(F.explicacion.ancho);
    this.boton(F.descarga, 'Descargar CSV', () => data.registro?.descargar(`nivel-${nivel.id}-partida.csv`), { tamano: 11 });
    this.add.text(F.encabezadosCsv.x, F.encabezadosCsv.y, 'CSV: t,u_crudo,u,x1,x2,y,v2,q_d,h_sp', fuenteInterfaz(13)).setDepth(5);
    this.boton(F.volver, 'Volver al menú', () => this.scene.start('Menu'));
  }

  mostrarFinFallback(data) {
    const nivel = data.nivel || { id: '?', nombre: 'Nivel' };
    const resultado = data.resultado || {};
    const estado = data.desborde ? 'Desborde' : resultado.superado ? 'Nivel superado' : 'Nivel no superado';
    const F = LAYOUT.final;
    this.crearFondo(); this.panel(F.marco); this.panel(F.panel);
    this.add.text(F.titulo.x, F.titulo.y, 'Lo que pasó en el modelo', fuenteTitulo(22)).setOrigin(.5);
    this.add.text(F.resultado.x, F.resultado.y, `${nivel.nombre} · ${estado} · ${resultado.texto || 'resultado no disponible'}`, fuenteInterfaz(18, resultado.superado ? '#2ECC71' : '#FF1744')).setWordWrapWidth(F.resultado.ancho);
    this.boton(F.descarga, 'Descargar CSV', () => data.registro?.descargar(`nivel-${nivel.id}-partida.csv`), { tamano: 11 });
    this.boton(F.volver, 'Volver al menú', () => this.scene.start('Menu'));
  }
}

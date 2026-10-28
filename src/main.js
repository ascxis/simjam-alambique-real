import './style.css';
import { GestorEntrada } from './entrada/gestorEntrada.js';
import { CamaraManos } from './vision/camara.js';
import { SistemaContinuo } from './modelo/sistema.js';
import { Actuador } from './modelo/actuador.js';
import { Registro } from './modelo/registro.js';
import { calcularMetricas } from './modelo/metricas.js';
import { dibujarTendencia } from './hmi/tendencia.js';
import { dibujarBarraActuador } from './hmi/actuadores.js';

const W = 1280, H = 720;
const PAL = { fondo: 0xe7e8e8, panel: 0xd5d8d9, tinta: '#252b2d', neutro: 0x64777d };
let camara;
function videoPreview() {
  let video = document.getElementById('camera-preview');
  if (!video) { video = document.createElement('video'); video.id = 'camera-preview'; video.autoplay = true; video.muted = true; video.playsInline = true; Object.assign(video.style, { position: 'fixed', right: '18px', bottom: '18px', width: '220px', height: '165px', objectFit: 'cover', transform: 'scaleX(-1)', border: '2px solid #64777d', zIndex: 10, display: 'none' }); document.body.append(video); }
  return video;
}
function dibujarDepuracion(frame) {
  let canvas = document.getElementById('camera-debug');
  if (!canvas) { canvas = document.createElement('canvas'); canvas.id = 'camera-debug'; canvas.width = 220; canvas.height = 165; Object.assign(canvas.style, { position: 'fixed', right: '18px', bottom: '18px', width: '220px', height: '165px', zIndex: 11, pointerEvents: 'none' }); document.body.append(canvas); }
  const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, 220, 165); ctx.save(); ctx.translate(220, 0); ctx.scale(-1, 1); ctx.strokeStyle = '#fff'; ctx.strokeRect(22, 16.5, 176, 132); ctx.restore();
  for (const mano of frame.manos) { ctx.fillStyle = mano.etiqueta === 'der' ? '#ffd700' : '#4ed4ce'; for (const p of mano.puntos) { ctx.beginPath(); ctx.arc((1 - p.x) * 220, p.y * 165, 2.2, 0, Math.PI * 2); ctx.fill(); } ctx.fillText(mano.etiqueta, (1 - mano.puntos[0].x) * 220, mano.puntos[0].y * 165); }
  ctx.fillStyle = '#fff'; ctx.fillText(`${frame.fps.toFixed(0)} FPS`, 5, 13);
}
class EscenaBase extends Phaser.Scene {
  constructor(key) { super(key); }
  crearFondo(titulo) { this.cameras.main.setBackgroundColor(PAL.fondo); this.add.text(36, 26, 'ALAMBIQUE REAL  /  EL ARTE DE LA ALQUIMIA', { fontSize: '17px', color: '#515b5e' }); this.add.text(36, 62, titulo, { fontSize: '30px', color: PAL.tinta, fontStyle: 'bold' }); }
  boton(x, y, texto, callback) { const b = this.add.text(x, y, texto, { fontSize: '18px', color: '#f7f8f8', backgroundColor: '#52666d', padding: { x: 14, y: 9 } }).setInteractive({ useHandCursor: true }); b.on('pointerdown', callback); return b; }
}
class Arranque extends EscenaBase {
  constructor() { super('Arranque'); }
  create() { this.crearFondo('Preparando el laboratorio'); this.add.rectangle(640, 370, 500, 22, 0xc4c8c9); const bar = this.add.rectangle(390, 370, 0, 16, PAL.neutro).setOrigin(0, .5); this.tweens.add({ targets: bar, width: 490, duration: 650, onComplete: () => this.scene.start('Menu') }); }
}
class Menu extends EscenaBase {
  constructor() { super('Menu'); }
  create() {
    this.crearFondo('Menú de operación'); this.add.text(40, 130, 'Simulador base · sistema continuo de primer orden', { fontSize: '19px', color: '#424c4f' });
    this.add.text(40, 195, 'Fuente de control', { fontSize: '20px', color: PAL.tinta });
    const select = document.createElement('select'); select.innerHTML = '<option value="camara">Cámara (por defecto)</option><option value="gamepad">Gamepad</option><option value="teclado">Teclado</option><option value="escalon">Escalón de prueba (2 s)</option>'; select.value = new URLSearchParams(location.search).get('control') || 'camara'; Object.assign(select.style, { position: 'absolute', left: '45px', top: '250px', zIndex: 5, padding: '10px', fontSize: '16px' }); document.body.append(select); this.events.once('shutdown', () => select.remove());
    this.add.text(40, 306, 'Nivel de práctica', { fontSize: '20px', color: PAL.tinta }); this.add.text(40, 347, 'Prueba común · K = 1, τ = 5 s · actuador sin límite de velocidad', { fontSize: '16px', color: '#414b4e' });
    this.boton(45, 408, 'Iniciar simulación', async () => { window.fuenteElegida = select.value; if (select.value === 'camara') { try { if (!camara) camara = new CamaraManos({ onFrame: (frame) => { window.gestor?.procesarManos(frame); dibujarDepuracion(frame); } }); const video = videoPreview(); await camara.iniciar(video); video.style.display = 'block'; } catch (e) { const usar = confirm(`No se pudo iniciar la cámara (${e.message}). ¿Continuar con teclado?`); if (!usar) return; window.fuenteElegida = 'teclado'; } } this.scene.start('Simulacion'); }); this.boton(45, 472, 'Calibrar cámara', async () => { window.fuenteElegida = select.value; window.gestor = new GestorEntrada({ fuente: 'camara' }); try { if (!camara) camara = new CamaraManos({ onFrame: (frame) => { window.gestor?.procesarManos(frame); dibujarDepuracion(frame); } }); const video = videoPreview(); await camara.iniciar(video); video.style.display = 'block'; } catch (e) { alert(`Cámara no disponible: ${e.message}`); } this.scene.start('Calibracion'); });
    this.add.text(40, 555, 'Controles: mano derecha arriba/abajo · gamepad stick derecho · teclado ↑ / ↓\nP: parámetros · D: depuración · Enter / Start: pausa', { fontSize: '16px', color: '#414b4e', lineSpacing: 6 });
    this.boton(800, 408, 'Activar cámara', async () => { try { const video = videoPreview(); await camara?.iniciar(video); video.style.display = 'block'; const devices = await camara.dispositivos(); alert(`Cámara activa. Dispositivos detectados: ${devices.map((d, i) => `${i + 1}. ${d.label || 'Cámara'}`).join('\n') || '1'}.`); } catch (e) { alert(`No se pudo iniciar la cámara: ${e.message}\nPuedes continuar con gamepad o teclado desde la selección de control.`); } });
  }
}
class Calibracion extends EscenaBase {
  constructor() { super('Calibracion'); }
  create() { this.crearFondo('Calibración de las manos'); const pasos = ['Mano abajo', 'Mano arriba', 'Pellizco cerrado', 'Pellizco abierto', 'Giro a la izquierda', 'Giro a la derecha']; let i = 0; const txt = this.add.text(100, 180, '', { fontSize: '25px', color: PAL.tinta }); const tick = () => { if (i >= pasos.length) { window.gestor?.camara.guardarCalibracion(); txt.setText('Calibración guardada.'); this.time.delayedCall(1200, () => this.scene.start('Menu')); return; } let restante = 3; txt.setText(`${pasos[i]} · ${restante}`); const timer = this.time.addEvent({ delay: 1000, repeat: 2, callback: () => { restante--; txt.setText(`${pasos[i]} · ${restante}`); if (!restante) { const mano = window.gestor?.camara.controles.der; const v = mano?.[i < 2 ? 'altura' : i < 4 ? 'pellizco' : 'giro'] ?? 0; const canal = i < 2 ? 'altura' : i < 4 ? 'pellizco' : 'giro'; const lado = i % 2 ? 'max' : 'min'; const cal = window.gestor.camara.calibracion.der ||= {}; cal[canal] ||= { min: v, max: v }; cal[canal][lado] = v; i++; this.time.delayedCall(300, tick); } } }); }; tick(); this.boton(100, 310, 'Omitir calibración', () => this.scene.start('Menu')); }
}
class Simulacion extends EscenaBase {
  constructor() { super('Simulacion'); }
  create() {
    this.crearFondo('Operación · planta de prueba'); this.add.text(1030, 32, 'HMI · 30 s', { fontSize: '15px', color: '#515b5e' });
    this.gestor = window.gestor = new GestorEntrada({ fuente: window.fuenteElegida || undefined }); this.gestor.elegir(window.fuenteElegida || this.gestor.fuente);
    this.actuador = new Actuador({ velocidadMaxima: Infinity }); this.sistema = new SistemaContinuo({ f: ([x], [u], t, p) => [(p.K * u - x) / p.tau], g: (x) => x, p: { K: 1, tau: 5 }, x0: [0] });
    this.registro = new Registro({ encabezados: ['t (s)', 'u_crudo (0-1)', 'u (0-1)', 'x1 (u)', 'y (u)'] }); this.muestras = []; this.muestrasVista = []; this.tiempoJuego = 0; this.pausado = false; this.debug = false; this.panel = null;
    this.tank = this.add.graphics(); this.add.text(92, 135, 'Tanque', { fontSize: '18px', color: PAL.tinta }); this.add.text(690, 132, 'Tendencia de proceso', { fontSize: '17px', color: PAL.tinta });
    this.events.on('shutdown', () => camara?.detener());
    this.input.keyboard.on('keydown', (e) => { this.gestor.tecla(e.code, true); if (e.code === 'KeyP') this.toggleParametros(); if (e.code === 'KeyD') this.debug = !this.debug; }); this.input.keyboard.on('keyup', (e) => this.gestor.tecla(e.code, false)); this.finKey = this.input.keyboard.addKey('F');
    this.gestor.eventos.addEventListener('pausa', () => { this.pausado = !this.pausado; }); this.ayuda = this.add.text(36, 675, '', { fontSize: '14px', color: '#414b4e' });
    this.input.gamepad?.once('connected', () => {}); this.cartas = [];
  }
  toggleParametros() { if (this.panel) { this.panel.destruir(); this.panel = null; return; } this.panel = { destruir: () => this.panelElems.forEach((e) => e.destroy()) }; const bg = this.add.rectangle(640, 360, 520, 300, 0xe1e3e3).setStrokeStyle(2, PAL.neutro); const title = this.add.text(430, 230, 'Parámetros (P cierra) · clic para aumentar', { fontSize: '18px', color: PAL.tinta }); const k = this.add.text(430, 290, `K: ${this.sistema.p.K}   [+]`, { fontSize: '20px', color: PAL.tinta }).setInteractive(); const tau = this.add.text(430, 340, `τ: ${this.sistema.p.tau} s   [+]`, { fontSize: '20px', color: PAL.tinta }).setInteractive(); k.on('pointerdown', () => { this.sistema.p.K += .1; k.setText(`K: ${this.sistema.p.K.toFixed(1)}   [+]`); }); tau.on('pointerdown', () => { this.sistema.p.tau += .5; tau.setText(`τ: ${this.sistema.p.tau.toFixed(1)} s   [+]`); }); this.panelElems = [bg, title, k, tau]; this.panel.destruir = () => this.panelElems.forEach((e) => e.destroy()); }
  update(_, deltaMs) {
    const dt = Math.min(deltaMs / 1000, .1), c = this.gestor.actualizar(dt);
    if (camara?.activo && this.gestor.fuente === 'camara') { const hayManos = c.der.presente || c.izq.presente; if (hayManos) this.noManosDesde = null; else this.noManosDesde ??= performance.now(); if (!hayManos && performance.now() - this.noManosDesde > 3000) this.pausado = true; }
    if (!this.pausado && !this.panel) { const u = this.actuador.avanzar(c.der.altura ?? .5, dt); const y = this.sistema.avanzar([u], dt)[0]; this.tiempoJuego = this.sistema.t; const muestra = { t: this.tiempoJuego, u_crudo: c.der.u_crudo?.altura ?? c.der.altura, u, x: [...this.sistema.x], y }; this.muestras.push(muestra); this.registro.agregar(dt, muestra); if (this.tiempoJuego - (this.ultimoVista || 0) >= 1 / 30) { this.muestrasVista.push(muestra); this.ultimoVista = this.tiempoJuego; } }
    this.tank.clear(); this.tank.fillStyle(0xcbd0d1).fillRoundedRect(130, 190, 190, 390, 18); this.tank.fillStyle(0x71858b).fillRoundedRect(143, 203 + (1 - Math.max(0, Math.min(1, this.sistema.x[0]))) * 360, 164, Math.max(0, Math.min(1, this.sistema.x[0])) * 360, 8);
    this.tank.lineStyle(3, PAL.neutro).strokeRoundedRect(130, 190, 190, 390, 18); this.children.list.filter((o) => o.getData?.('dynamic')).forEach((o) => o.destroy());
    const val = this.add.text(135, 595, `y = ${this.sistema.x[0].toFixed(3)} u`, { fontSize: '17px', color: PAL.tinta }); val.setData('dynamic', true);
    this.cartas.forEach((c) => c.destruir()); this.cartas = [dibujarTendencia(this, { x: 690, y: 170, ancho: 525, alto: 330, muestras: this.muestrasVista, min: 0, max: 1, unidad: 'u', titulo: 'y(t) · nivel normalizado' }), dibujarBarraActuador(this, 690, 545, 'Apertura actuador', this.actuador.salida(), this.sistema.x[0])];
    const sinManos = camara?.activo && this.gestor.fuente === 'camara' && this.noManosDesde && performance.now() - this.noManosDesde > 3000;
    const label = this.add.text(36, 640, `${sinManos ? 'Muestra las manos · ' : ''}${this.pausado ? 'PAUSADO · Enter para reanudar' : `Tiempo ${this.tiempoJuego.toFixed(1)} s`}    Control: ${this.gestor.fuente}    P parámetros · D depuración · F fin`, { fontSize: '15px', color: this.pausado ? '#7c5144' : '#424c4f' }); label.setData('dynamic', true);
    const visor = document.getElementById('camera-debug'); if (visor) visor.style.display = this.debug ? 'block' : 'none';
    const alertaFPS = camara?.activo && camara.fps < 15 ? ' · Detección lenta: mejora la luz, cierra pestañas o baja resolución' : '';
    this.ayuda.setText(this.debug ? `Depuración · FPS ${camara?.fps?.toFixed(0) ?? '—'}${alertaFPS} · α ${this.gestor.camara.alfa} · τf ${this.gestor.camara.depuracion().tau.toFixed(3)} s · u crudo ${this.muestras.at(-1)?.u_crudo?.toFixed(2) ?? '—'} → filtro ${this.muestras.at(-1)?.u?.toFixed(2) ?? '—'} · x=[${this.sistema.x.map((v) => v.toFixed(2)).join(', ')}]` : 'Sistema continuo: τ dy/dt + y = K u · use F para terminar y revisar resultados.');
    if (Phaser.Input.Keyboard.JustDown(this.finKey)) this.scene.start('Fin', { muestras: this.muestras, registro: this.registro, p: this.sistema.p });
  }
}
class Fin extends EscenaBase {
  constructor() { super('Fin'); }
  create(data) { this.crearFondo('Lo que pasó en el modelo'); const muestras = data.muestras || []; const metricas = calcularMetricas(muestras, { referencia: 1, banda: .02 }); this.add.text(36, 120, `Valor final: ${metricas.valorFinal.toFixed(3)}   Mp: ${metricas.Mp.toFixed(2)}%   ts (2%): ${metricas.ts?.toFixed(2) ?? '—'} s\nIAE: ${metricas.IAE.toFixed(3)}   ISE: ${metricas.ISE.toFixed(3)}   Tiempo en banda: ${metricas.tiempoEnBanda.toFixed(2)} s`, { fontSize: '18px', color: PAL.tinta, lineSpacing: 12 });
    dibujarTendencia(this, { x: 50, y: 270, ancho: 550, alto: 260, muestras, min: 0, max: 1, unidad: 'u', titulo: 'Salida del sistema y(t)' }); dibujarTendencia(this, { x: 650, y: 270, ancho: 550, alto: 260, muestras, clave: 'u', min: 0, max: 1, unidad: 'u', titulo: 'Entrada aplicada u(t)' });
    this.boton(50, 585, 'Descargar CSV de la partida', () => data.registro?.descargar()); this.boton(420, 585, 'Volver al menú', () => this.scene.start('Menu')); }
}
const config = { type: Phaser.AUTO, parent: 'game-container', width: W, height: H, backgroundColor: PAL.fondo, physics: { default: 'arcade', arcade: { debug: false } }, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: [Arranque, Menu, Calibracion, Simulacion, Fin] };
new Phaser.Game(config);

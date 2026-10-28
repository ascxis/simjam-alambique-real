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
const leerPreferencia = (clave, defecto) => { try { const valor = localStorage.getItem(clave); return valor === null ? defecto : valor; } catch { return defecto; } };
const guardarPreferencia = (clave, valor) => { try { localStorage.setItem(clave, valor); } catch {} };
function crearCamara() {
  const intercambiar = leerPreferencia('alambique.intercambiarEtiquetas', 'false') === 'true';
  return new CamaraManos({ intercambiar, onFrame: (frame) => { window.gestor?.procesarManos(frame); dibujarDepuracion(frame); } });
}
function videoPreview() {
  let video = document.getElementById('camera-preview');
  if (!video) { video = document.createElement('video'); video.id = 'camera-preview'; video.autoplay = true; video.muted = true; video.playsInline = true; Object.assign(video.style, { position: 'fixed', right: '18px', bottom: '18px', width: '220px', height: '165px', objectFit: 'cover', transform: 'scaleX(-1)', border: '2px solid #64777d', zIndex: 10, display: 'none' }); document.body.append(video); }
  return video;
}
function dibujarDepuracion(frame) {
  let canvas = document.getElementById('camera-debug');
  if (!canvas) { canvas = document.createElement('canvas'); canvas.id = 'camera-debug'; canvas.width = 220; canvas.height = 165; Object.assign(canvas.style, { position: 'fixed', right: '18px', bottom: '18px', width: '220px', height: '165px', zIndex: 11, pointerEvents: 'none', display: 'none' }); document.body.append(canvas); }
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
    document.getElementById('camera-debug-info')?.remove();
    this.crearFondo('Menú de operación'); this.add.text(40, 130, 'Simulador base · sistema continuo de primer orden', { fontSize: '19px', color: '#424c4f' });
    this.add.text(40, 195, 'Fuente de control', { fontSize: '20px', color: PAL.tinta });
    const valoresFuente = ['camara', 'gamepad', 'teclado', 'escalon'];
    const solicitada = new URLSearchParams(location.search).get('control');
    let fuenteActiva = valoresFuente.includes(solicitada) ? solicitada : 'camara';
    const select = document.createElement('select');
    select.innerHTML = '<option value="camara">Cámara</option><option value="gamepad">Gamepad</option><option value="teclado">Teclado</option><option value="escalon">Escalón de prueba</option>';
    Object.assign(select.style, { width: '310px', height: '40px', padding: '7px', fontSize: '16px' });
    const fuenteDom = this.add.dom(40, 226, select).setOrigin(0, 0);
    select.value = fuenteActiva;
    select.addEventListener('change', () => { if (valoresFuente.includes(select.value)) fuenteActiva = select.value; });
    window.fuenteElegida = fuenteActiva;
    this.add.text(40, 306, 'Nivel de práctica', { fontSize: '20px', color: PAL.tinta }); this.add.text(40, 347, 'Prueba común · K = 1, τ = 5 s · actuador sin límite de velocidad', { fontSize: '16px', color: '#414b4e' });
    const camSelect = document.createElement('select'); camSelect.id = 'camera-select'; camSelect.innerHTML = '<option value="">Cámara predeterminada</option>'; camSelect.value = leerPreferencia('alambique.cameraId', ''); Object.assign(camSelect.style, { width: '245px', height: '38px', padding: '6px', fontSize: '14px' }); const cameraSelectDom = this.add.dom(1025, 366, camSelect).setOrigin(0, 0.5);
    const invertir = document.createElement('label'); invertir.style.cssText = 'display:flex;align-items:center;gap:6px;width:220px;height:38px;font:14px system-ui;color:#252b2d'; invertir.innerHTML = '<input type="checkbox"> Intercambiar derecha / izquierda'; invertir.querySelector('input').checked = leerPreferencia('alambique.intercambiarEtiquetas', 'false') === 'true'; const invertirDom = this.add.dom(800, 366, invertir).setOrigin(0, 0.5);
    invertir.querySelector('input').addEventListener('change', (ev) => { const valor = ev.target.checked; guardarPreferencia('alambique.intercambiarEtiquetas', String(valor)); if (camara) camara.intercambiar = valor; });
    const poblarCamaras = async () => { if (!navigator.mediaDevices?.enumerateDevices) return []; const devices = await navigator.mediaDevices.enumerateDevices(); const cams = devices.filter((d) => d.kind === 'videoinput'); const actual = leerPreferencia('alambique.cameraId', ''); camSelect.replaceChildren(new Option('Cámara predeterminada', '')); cams.forEach((d, i) => camSelect.add(new Option(d.label || `Cámara ${i + 1}`, d.deviceId))); camSelect.value = cams.some((d) => d.deviceId === actual) ? actual : ''; return cams; };
    camSelect.addEventListener('change', async () => { guardarPreferencia('alambique.cameraId', camSelect.value); if (camara?.activo) { try { await camara.iniciar(videoPreview(), camSelect.value || undefined); } catch (e) { alert(`No se pudo abrir esa cámara: ${e.message}`); } } });
    this.events.once('shutdown', () => { fuenteDom.destroy(); cameraSelectDom.destroy(); invertirDom.destroy(); }); poblarCamaras().catch(() => {});
    const activarCamara = async () => { try { if (!camara) camara = crearCamara(); camara.intercambiar = invertir.querySelector('input').checked; await camara.iniciar(videoPreview(), camSelect.value || leerPreferencia('alambique.cameraId', '') || undefined); videoPreview().style.display = 'block'; const cams = await poblarCamaras(); return cams; } catch (e) { const gamepad = confirm(`No se pudo iniciar la cámara (${e.message}).\nAceptar: usar gamepad. Cancelar: elegir teclado.`); window.fuenteElegida = gamepad ? 'gamepad' : 'teclado'; return null; } };
    this.boton(45, 408, 'Iniciar simulación', async () => { if (valoresFuente.includes(select.value)) fuenteActiva = select.value; window.fuenteElegida = fuenteActiva; if (fuenteActiva === 'camara' && !await activarCamara()) { /* Se conserva el control alternativo elegido en el aviso. */ } this.scene.start('Simulacion'); }); this.boton(45, 472, 'Calibrar cámara', async () => { window.fuenteElegida = 'camara'; window.gestor = new GestorEntrada({ fuente: 'camara' }); if (!camara) camara = crearCamara(); camara.intercambiar = invertir.querySelector('input').checked; try { await camara.iniciar(videoPreview(), camSelect.value || leerPreferencia('alambique.cameraId', '') || undefined); videoPreview().style.display = 'block'; await poblarCamaras(); this.scene.start('Calibracion'); } catch (e) { const gamepad = confirm(`No se pudo iniciar la cámara (${e.message}).\nAceptar: usar gamepad. Cancelar: usar teclado.`); window.fuenteElegida = gamepad ? 'gamepad' : 'teclado'; this.scene.start('Menu'); } });
    this.add.text(40, 555, 'Controles: mano derecha arriba/abajo · gamepad stick derecho · teclado ↑ / ↓\nP: parámetros · D: depuración · Enter / Start: pausa', { fontSize: '16px', color: '#414b4e', lineSpacing: 6 });
    this.boton(800, 408, 'Probar / actualizar cámaras', async () => { const cams = await activarCamara(); if (cams?.length === 1) alert('Cámara activa. Se encontró una cámara.'); else if (cams?.length > 1) alert(`Cámara activa. Elige dispositivo en el selector. Se encontraron ${cams.length} cámaras.`); });
  }
}
class Calibracion extends EscenaBase {
  constructor() { super('Calibracion'); }
  create() {
    this.crearFondo('Calibración de las manos');
    const pasos = [
      { canal: 'altura', lado: 'min', instruccion: 'Mano abajo' }, { canal: 'altura', lado: 'max', instruccion: 'Mano arriba' },
      { canal: 'pellizco', lado: 'min', instruccion: 'Pellizco cerrado' }, { canal: 'pellizco', lado: 'max', instruccion: 'Pellizco abierto' },
      { canal: 'giro', lado: 'min', instruccion: 'Giro a la izquierda' }, { canal: 'giro', lado: 'max', instruccion: 'Giro a la derecha' }
    ];
    const tareas = ['der', 'izq'].flatMap((mano) => pasos.map((paso) => ({ ...paso, mano })));
    let indice = 0, segundo = 3, acumulados = [];
    const texto = this.add.text(100, 180, '', { fontSize: '25px', color: PAL.tinta });
    const mostrar = () => {
      if (indice >= tareas.length) { window.gestor.camara.guardarCalibracion(); texto.setText('Calibración de ambas manos guardada.'); this.time.delayedCall(1200, () => this.scene.start('Menu')); return; }
      const tarea = tareas[indice]; segundo = 3; acumulados = [];
      texto.setText(`Mano ${tarea.mano === 'der' ? 'derecha' : 'izquierda'} · ${tarea.instruccion}\nMantén la posición: ${segundo} s`);
      this.time.addEvent({ delay: 1000, repeat: 2, callback: () => {
        const estado = window.gestor.camara.controles[tarea.mano]; const valorCrudo = estado.medidaCruda?.[tarea.canal];
        if (estado.presente && Number.isFinite(valorCrudo)) acumulados.push(valorCrudo);
        segundo -= 1;
        texto.setText(`Mano ${tarea.mano === 'der' ? 'derecha' : 'izquierda'} · ${tarea.instruccion}\nMantén la posición: ${segundo} s${estado.presente ? '' : ' · muestra la mano dentro de la zona'}`);
        if (segundo === 0) {
          if (acumulados.length) { const valor = acumulados.reduce((a, b) => a + b, 0) / acumulados.length; const cal = window.gestor.camara.calibracion[tarea.mano] ||= {}; cal[tarea.canal] ||= {}; cal[tarea.canal][tarea.lado] = valor; indice += 1; }
          else texto.setText(`No detecté la mano ${tarea.mano === 'der' ? 'derecha' : 'izquierda'} dentro de la zona. Repetimos este paso.`);
          this.time.delayedCall(250, mostrar);
        }
      } });
    };
    mostrar(); this.boton(100, 380, 'Omitir calibración', () => this.scene.start('Menu'));
  }
}
class Simulacion extends EscenaBase {
  constructor() { super('Simulacion'); }
  create() {
    this.crearFondo('Operación · planta de prueba'); this.add.text(1030, 32, 'HMI · 30 s', { fontSize: '15px', color: '#515b5e' });
    this.gestor = window.gestor = new GestorEntrada({ fuente: window.fuenteElegida || undefined }); this.gestor.elegir(window.fuenteElegida || this.gestor.fuente);
    this.actuador = new Actuador({ velocidadMaxima: Infinity }); this.sistema = new SistemaContinuo({ f: ([x], [u], t, p) => [(p.K * u - x) / p.tau], g: (x) => x, p: { K: 1, tau: 5 }, x0: [0] });
    this.registro = new Registro({ encabezados: ['t', 'u_crudo', 'u', ...this.sistema.x.map((_, i) => `x${i + 1}`), 'y'] }); this.muestras = []; this.muestrasVista = []; this.tiempoJuego = 0; this.pausado = false; this.debug = false; this.panel = null;
    this.tank = this.add.graphics(); this.add.text(92, 135, 'Tanque', { fontSize: '18px', color: PAL.tinta }); this.add.text(690, 132, 'Tendencia de proceso', { fontSize: '17px', color: PAL.tinta });
    this.debugPanel = document.createElement('div'); this.debugPanel.id = 'camera-debug-info'; Object.assign(this.debugPanel.style, { display: 'none', boxSizing: 'border-box', width: '540px', maxWidth: '540px', padding: '10px 12px', background: 'rgba(35,42,44,.88)', color: '#fff', font: '12px/1.5 monospace', whiteSpace: 'pre-wrap', borderRadius: '4px' }); this.debugDom = this.add.dom(18, 105, this.debugPanel).setOrigin(0, 0).setVisible(false);
    const swap = document.createElement('label'); swap.style.cssText = 'display:block;font:13px system-ui;margin-top:6px'; swap.innerHTML = '<input type="checkbox"> Intercambiar etiquetas der./izq.'; swap.querySelector('input').checked = camara?.intercambiar ?? (leerPreferencia('alambique.intercambiarEtiquetas', 'false') === 'true');
    swap.querySelector('input').addEventListener('change', (ev) => { const value = ev.target.checked; guardarPreferencia('alambique.intercambiarEtiquetas', String(value)); if (camara) camara.intercambiar = value; }); this.debugPanel.append(swap); this.debugTexto = document.createElement('div'); this.debugPanel.append(this.debugTexto);
    this.events.on('shutdown', () => { camara?.detener(); this.debugPanel.remove(); this.debugDom.destroy(); });
    this.input.keyboard.on('keydown', (e) => { this.gestor.tecla(e.code, true); if (e.code === 'KeyP') this.toggleParametros(); if (e.code === 'KeyD') this.debug = !this.debug; }); this.input.keyboard.on('keyup', (e) => this.gestor.tecla(e.code, false)); this.finKey = this.input.keyboard.addKey('F');
    this.gestor.eventos.addEventListener('pausa', () => { this.pausado = !this.pausado; this.pausaPorManos = false; }); this.ayuda = this.add.text(36, 675, '', { fontSize: '14px', color: '#414b4e' }); this.estadoCamara = this.add.text(1000, 68, '', { fontSize: '14px', color: '#414b4e' });
    this.input.gamepad?.once('connected', () => {}); this.cartas = [];
    this.selectStart = null; this.selectWasLong = false;
  }
  toggleParametros() { if (this.panel) { this.panel.destruir(); this.panel = null; return; } this.panel = { destruir: () => this.panelElems.forEach((e) => e.destroy()) }; const bg = this.add.rectangle(640, 360, 520, 300, 0xe1e3e3).setStrokeStyle(2, PAL.neutro); const title = this.add.text(430, 230, 'Parámetros (P cierra) · clic para aumentar', { fontSize: '18px', color: PAL.tinta }); const k = this.add.text(430, 290, `K: ${this.sistema.p.K}   [+]`, { fontSize: '20px', color: PAL.tinta }).setInteractive(); const tau = this.add.text(430, 340, `τ: ${this.sistema.p.tau} s   [+]`, { fontSize: '20px', color: PAL.tinta }).setInteractive(); k.on('pointerdown', () => { this.sistema.p.K += .1; k.setText(`K: ${this.sistema.p.K.toFixed(1)}   [+]`); }); tau.on('pointerdown', () => { this.sistema.p.tau += .5; tau.setText(`τ: ${this.sistema.p.tau.toFixed(1)} s   [+]`); }); this.panelElems = [bg, title, k, tau]; this.panel.destruir = () => this.panelElems.forEach((e) => e.destroy()); }
  update(_, deltaMs) {
    const dt = Math.min(deltaMs / 1000, .1), c = this.gestor.actualizar(dt) ?? {};
    if (camara?.activo && this.gestor.fuente === 'camara') { const hayManos = Boolean(c?.der?.presente || c?.izq?.presente); if (hayManos) { this.noManosDesde = null; if (this.pausaPorManos) { this.pausado = false; this.pausaPorManos = false; } } else { this.noManosDesde ??= performance.now(); if (performance.now() - this.noManosDesde > 3000) { this.pausado = true; this.pausaPorManos = true; } } }
    if (!this.pausado && !this.panel) { const altura = Number.isFinite(c?.der?.altura) ? c.der.altura : .5; const u = this.actuador.avanzar(altura, dt); const y = this.sistema.avanzar([u], dt)[0]; this.tiempoJuego = this.sistema.t; const crudo = Number.isFinite(c?.der?.u_crudo?.altura) ? c.der.u_crudo.altura : altura; const muestra = { t: this.tiempoJuego, u_crudo: crudo, u, x: [...this.sistema.x], y }; this.muestras.push(muestra); this.registro.agregar(dt, muestra); if (this.tiempoJuego - (this.ultimoVista || 0) >= 1 / 30) { this.muestrasVista.push(muestra); this.ultimoVista = this.tiempoJuego; } }
    this.tank.clear(); this.tank.fillStyle(0xcbd0d1).fillRoundedRect(130, 190, 190, 390, 18); this.tank.fillStyle(0x71858b).fillRoundedRect(143, 203 + (1 - Math.max(0, Math.min(1, this.sistema.x[0]))) * 360, 164, Math.max(0, Math.min(1, this.sistema.x[0])) * 360, 8);
    this.tank.lineStyle(3, PAL.neutro).strokeRoundedRect(130, 190, 190, 390, 18); this.children.list.filter((o) => o.getData?.('dynamic')).forEach((o) => o.destroy());
    const val = this.add.text(135, 595, `y = ${this.sistema.x[0].toFixed(3)} u`, { fontSize: '17px', color: PAL.tinta }); val.setData('dynamic', true);
    this.cartas.forEach((c) => c.destruir()); this.cartas = [dibujarTendencia(this, { x: 690, y: 170, ancho: 525, alto: 330, muestras: this.muestrasVista, min: 0, max: 1, unidad: 'u', titulo: 'y(t) · nivel normalizado' }), dibujarBarraActuador(this, 690, 545, 'Apertura actuador', this.actuador.salida(), this.sistema.x[0])];
    const sinManos = camara?.activo && this.gestor.fuente === 'camara' && this.noManosDesde && performance.now() - this.noManosDesde > 3000;
    this.estadoCamara.setText(this.gestor.fuente === 'camara' ? (camara?.activo ? 'CÁMARA ACTIVA' : 'CÁMARA INACTIVA') : '');
    const label = this.add.text(36, 640, `${sinManos ? 'Muestra las manos · ' : ''}${this.pausado ? 'PAUSADO · Enter para reanudar' : `Tiempo ${this.tiempoJuego.toFixed(1)} s`}    Control: ${this.gestor.fuente}    P parámetros · D depuración · F fin`, { fontSize: '15px', color: this.pausado ? '#7c5144' : '#424c4f' }); label.setData('dynamic', true);
    const visor = document.getElementById('camera-debug'), video = document.getElementById('camera-preview');
    if (visor) visor.style.display = this.debug ? 'block' : 'none'; if (video) video.style.display = this.debug ? 'block' : 'none';
    const alertaFPS = camara?.activo && camara.fps < 15 ? ' · Detección lenta: mejora la luz, cierra pestañas o baja resolución' : '';
    if (this.debug) {
      const gd = this.gestor.camara.depuracion();
      const formatMano = (id) => {
        const mano = c?.[id] ?? {}, crudos = mano.u_crudo ?? {};
        return `${id} ${mano.presente ? 'en zona' : 'fuera'} | ` + ['altura', 'x', 'pellizco', 'giro'].map((k) => `${k} ${Number(crudos[k] ?? 0).toFixed(2)}→${Number(mano[k] ?? 0).toFixed(2)}`).join(' | ');
      };
      this.debugTexto.textContent = `Detección ${camara?.fps?.toFixed(1) ?? '—'} FPS · cámara ${camara?.fpsCamara?.toFixed(1) ?? '—'} FPS${alertaFPS}\nα=${gd.alfa} · Ts=${gd.Ts.toFixed(4)} s · τf=${gd.tau.toFixed(4)} s\n${formatMano('der')}\n${formatMano('izq')}\nx(t)=[${this.sistema.x.map((v) => v.toFixed(3)).join(', ')}]`;
    }
    this.debugPanel.style.display = this.debug ? 'block' : 'none'; this.debugDom.setVisible(this.debug);
    if (this.debug && camara?.activo && camara.fps < 15) this.ayuda.setText(`Aviso: detección ${camara.fps.toFixed(1)} FPS (menos de 15). Mejora la iluminación, cierra pestañas o baja la resolución.`);
    else this.ayuda.setText(this.debug ? `Depuración activa · FPS ${camara?.fps?.toFixed(1) ?? '—'} · x(t)=[${this.sistema.x.map((v) => v.toFixed(2)).join(', ')}]` : `Sistema continuo: τ dy/dt + y = K u · use F para terminar.${alertaFPS}`);
    const gp = navigator.getGamepads?.().find(Boolean), selectPressed = !!gp?.buttons?.[8]?.pressed;
    if (selectPressed) { this.selectStart ??= performance.now(); if (!this.selectWasLong && performance.now() - this.selectStart >= 700) { this.debug = !this.debug; this.selectWasLong = true; } } else { this.selectStart = null; this.selectWasLong = false; }
    if (Phaser.Input.Keyboard.JustDown(this.finKey)) this.scene.start('Fin', { muestras: this.muestras, registro: this.registro, p: this.sistema.p });
  }
}
class Fin extends EscenaBase {
  constructor() { super('Fin'); }
  create(data) { this.crearFondo('Lo que pasó en el modelo'); const muestras = data.muestras || []; const metricas = calcularMetricas(muestras, { referencia: 1, banda: .02 }); this.add.text(36, 120, `Valor final: ${metricas.valorFinal.toFixed(3)}   Mp: ${metricas.Mp.toFixed(2)}%   ts (2%): ${metricas.ts?.toFixed(2) ?? '—'} s\nIAE: ${metricas.IAE.toFixed(3)}   ISE: ${metricas.ISE.toFixed(3)}   Tiempo en banda: ${metricas.tiempoEnBanda.toFixed(2)} s`, { fontSize: '18px', color: PAL.tinta, lineSpacing: 12 });
    dibujarTendencia(this, { x: 50, y: 270, ancho: 550, alto: 260, muestras, min: 0, max: 1, unidad: 'u', titulo: 'Salida del sistema y(t)', tiempoCompleto: true, ejeTiempo: true, autoEscala: true }); dibujarTendencia(this, { x: 650, y: 270, ancho: 550, alto: 260, muestras, clave: 'u', min: 0, max: 1, unidad: '', titulo: 'Entrada aplicada u(t)', tiempoCompleto: true, ejeTiempo: true, autoEscala: true });
    this.boton(50, 585, 'Descargar CSV de la partida', () => data.registro?.descargar()); this.boton(420, 585, 'Volver al menú', () => this.scene.start('Menu'));
    this.add.text(50, 630, 'Unidades: t en s; u_crudo y u de 0 a 1 (adimensionales); x1 e y en unidades del modelo (u).', { fontSize: '14px', color: '#424c4f' }); }
}
const config = { type: Phaser.AUTO, parent: 'game-container', width: W, height: H, backgroundColor: PAL.fondo, dom: { createContainer: true }, physics: { default: 'arcade', arcade: { debug: false } }, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: [Arranque, Menu, Calibracion, Simulacion, Fin] };
new Phaser.Game(config);

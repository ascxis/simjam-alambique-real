import { EscenaBase } from './EscenaBase.js';
import { contextoJuego } from './contexto.js';
import { leerPreferencia, guardarPreferencia } from './preferencias.js';
import { obtenerSesionCamara, listarCamaras } from '../vision/servicioCamara.js';
import { obtenerVideoPreview } from '../hmi/vistaCamara.js';
import { GestorEntrada } from '../entrada/gestorEntrada.js';
import { cargarNiveles } from '../modelo/niveles.js';
import { LAYOUT } from '../hmi/layout.js';
import { fuenteInterfaz } from '../hmi/estilo.js';
import { GestorAudio, VOLUMENES_AUDIO_INICIALES } from './audio.js';

const selectCss = 'box-sizing:border-box;background:#1C2026;color:#E6E8EA;border:1px solid #B85A24;border-radius:8px;padding:7px 10px;font:15px Segoe UI,Arial,sans-serif;';

export class Menu extends EscenaBase {
  constructor() { super('Menu'); }
  create() {
    this.audio = this.registry.get('gestorAudio') || new GestorAudio(this);
    this.registry.set('gestorAudio', this.audio);
    this.audio.vincular(this);
    this.audio.setMusic('musica_menu');
    document.getElementById('camera-debug-info')?.remove();
    this.crearFondo();
    const M = LAYOUT.menu;
    if (this.textures.exists('logotipo')) this.add.image(M.logo.x, M.logo.y, 'logotipo').setDisplaySize(M.logo.ancho, M.logo.alto);
    this.panel(M.panel);
    this.panel(M.controles, { profundidad: 1 });
    this.add.text(M.izquierda.x, M.fuenteLabelY, 'Fuente de control', fuenteInterfaz(17, '#F2E6C9', { fontStyle: 'bold' }));
    this.add.text(M.izquierda.x, M.nivelLabelY, 'Nivel', fuenteInterfaz(17, '#F2E6C9', { fontStyle: 'bold' }));
    this.add.text(M.derecha.x, M.camaraLabelY, 'Cámara', fuenteInterfaz(17, '#F2E6C9', { fontStyle: 'bold' }));

    const valoresFuente = ['camara', 'gamepad', 'teclado', 'escalon'];
    const solicitada = new URLSearchParams(location.search).get('control');
    let fuenteActiva = valoresFuente.includes(solicitada) ? solicitada : 'camara';
    const select = document.createElement('select');
    select.innerHTML = '<option value="camara">Cámara</option><option value="gamepad">Gamepad</option><option value="teclado">Teclado</option><option value="escalon">Escalón de prueba</option>';
    select.style.cssText = `${selectCss}width:${M.izquierda.ancho}px;height:${M.fuenteAlto}px`;
    const fuenteDom = this.add.dom(M.izquierda.x + M.izquierda.ancho / 2, M.fuenteY + M.fuenteAlto / 2, select);
    select.value = fuenteActiva;
    select.addEventListener('change', () => { if (valoresFuente.includes(select.value)) fuenteActiva = select.value; });
    contextoJuego.fuenteElegida = fuenteActiva;

    const niveles = cargarNiveles();
    const nivelSelect = document.createElement('select');
    niveles.forEach((nivel) => nivelSelect.add(new Option(`${nivel.id}. ${nivel.nombre}`, String(nivel.id))));
    nivelSelect.style.cssText = `${selectCss}width:${M.izquierda.ancho}px;height:${M.nivelAlto}px`;
    const nivelDom = this.add.dom(M.izquierda.x + M.izquierda.ancho / 2, M.nivelY + M.nivelAlto / 2, nivelSelect);
    nivelSelect.value = String(contextoJuego.nivelElegido || 1);
    nivelSelect.addEventListener('change', () => { contextoJuego.nivelElegido = Number(nivelSelect.value); });

    const camSelect = document.createElement('select'); camSelect.id = 'camera-select'; camSelect.innerHTML = '<option value="">Cámara predeterminada</option>';
    camSelect.style.cssText = `${selectCss}width:${M.derecha.ancho}px;height:${M.camaraAlto}px`;
    const cameraSelectDom = this.add.dom(M.derecha.x + M.derecha.ancho / 2, M.camaraY + M.camaraAlto / 2, camSelect);
    const invertir = document.createElement('label');
    invertir.style.cssText = `display:flex;align-items:center;gap:8px;width:${M.derecha.ancho}px;height:${M.checkbox.alto}px;color:#E6E8EA;font:14px Segoe UI,Arial,sans-serif`;
    invertir.innerHTML = '<input type="checkbox" style="accent-color:#B85A24"> Intercambiar derecha / izquierda';
    invertir.querySelector('input').checked = leerPreferencia('alambique.intercambiarEtiquetas', 'false') === 'true';
    const invertirDom = this.add.dom(M.derecha.x + M.derecha.ancho / 2, M.invertirY + M.checkbox.alto / 2, invertir);
    invertir.querySelector('input').addEventListener('change', (ev) => {
      guardarPreferencia('alambique.intercambiarEtiquetas', String(ev.target.checked));
      if (contextoJuego.camara) contextoJuego.camara.intercambiar = ev.target.checked;
    });
    const reducir = document.createElement('label');
    reducir.style.cssText = `display:flex;align-items:center;gap:7px;width:${M.derecha.ancho}px;height:22px;color:#E6E8EA;font:13px Segoe UI,Arial,sans-serif`;
    reducir.innerHTML = '<input type="checkbox" style="accent-color:#B85A24"> Reducir efectos';
    reducir.querySelector('input').checked = leerPreferencia('alambique.reducirEfectos', 'false') === 'true';
    contextoJuego.reducirEfectos = reducir.querySelector('input').checked;
    const reducirDom = this.add.dom(M.derecha.x + M.derecha.ancho / 2, M.reducirY + 11, reducir);
    reducir.querySelector('input').addEventListener('change', (ev) => {
      contextoJuego.reducirEfectos = ev.target.checked;
      guardarPreferencia('alambique.reducirEfectos', String(ev.target.checked));
    });
    const indicadores = document.createElement('label');
    indicadores.style.cssText = `display:flex;align-items:center;gap:7px;width:${M.derecha.ancho}px;height:22px;color:#E6E8EA;font:13px Segoe UI,Arial,sans-serif`;
    indicadores.innerHTML = '<input type="checkbox" style="accent-color:#B85A24"> Indicadores visuales de sonido';
    indicadores.querySelector('input').checked = leerPreferencia('alambique.indicadoresSonido', 'true') === 'true';
    contextoJuego.indicadoresSonido = indicadores.querySelector('input').checked;
    const indicadoresDom = this.add.dom(M.derecha.x + M.derecha.ancho / 2, M.indicadoresY + 11, indicadores);
    indicadores.querySelector('input').addEventListener('change', (ev) => {
      contextoJuego.indicadoresSonido = ev.target.checked;
      guardarPreferencia('alambique.indicadoresSonido', String(ev.target.checked));
    });

    const slidersAudio = [];
    const etiquetasCanal = { musica: 'Música', efectos: 'Efectos', interfaz: 'Interfaz', sonificacion: 'Sonificación' };
    const audioFilas = [
      ['musica', M.audio.izquierdaX, M.audio.fila1Y], ['efectos', M.audio.derechaX, M.audio.fila1Y],
      ['interfaz', M.audio.izquierdaX, M.audio.fila2Y], ['sonificacion', M.audio.derechaX, M.audio.fila2Y],
    ];
    for (const [canal, centroX, y] of audioFilas) {
      const control = document.createElement('label');
      control.style.cssText = `display:flex;align-items:center;justify-content:space-between;gap:8px;width:${M.audio.ancho}px;height:${M.audio.alto}px;color:#E6E8EA;font:12px Segoe UI,Arial,sans-serif`;
      control.innerHTML = `<span>${etiquetasCanal[canal]}</span><input type="range" min="0" max="1" step="0.05" style="accent-color:#B85A24;width:170px"><span></span>`;
      const slider = control.querySelector('input');
      const valor = control.querySelector('span:last-child');
      slider.value = String(this.audio.volumenes[canal] ?? VOLUMENES_AUDIO_INICIALES[canal]);
      valor.textContent = Number(slider.value).toFixed(2);
      slider.addEventListener('input', () => { valor.textContent = Number(slider.value).toFixed(2); this.audio.setVolumen(canal, slider.value); });
      control.addEventListener('pointerdown', () => this.audio.desbloquear(), { once: true });
      slidersAudio.push(this.add.dom(centroX, y, control));
    }
    const audioPrompt = this.add.text(M.audioPrompt.x, M.audioPrompt.y, 'Toca o haz un gesto para activar el sonido', fuenteInterfaz(12, '#F2E6C9')).setOrigin(.5);
    this.audio.instalarDesbloqueo(this, audioPrompt);
    audioPrompt.setVisible(!this.audio.desbloqueado);

    const poblarCamaras = async () => {
      const cams = await listarCamaras();
      const actual = leerPreferencia('alambique.cameraId', '');
      camSelect.replaceChildren(new Option('Cámara predeterminada', ''));
      cams.forEach((d, i) => camSelect.add(new Option(d.label || `Cámara ${i + 1}`, d.deviceId)));
      camSelect.value = cams.some((d) => d.deviceId === actual) ? actual : '';
      return cams;
    };
    camSelect.addEventListener('change', async () => {
      guardarPreferencia('alambique.cameraId', camSelect.value);
      const camara = contextoJuego.camara;
      if (camara?.activo) { try { await camara.iniciar(obtenerVideoPreview(), camSelect.value || undefined); } catch (e) { alert(`No se pudo abrir esa cámara: ${e.message}`); } }
    });
    this.events.once('shutdown', () => [fuenteDom, nivelDom, cameraSelectDom, invertirDom, reducirDom, indicadoresDom, ...slidersAudio].forEach((dom) => dom.destroy()));
    poblarCamaras().catch(() => {});

    const activarCamara = async () => {
      try {
        const camara = obtenerSesionCamara();
        camara.intercambiar = invertir.querySelector('input').checked;
        const numHands = Number(nivelSelect.value) === 3 ? 2 : 1;
        await camara.iniciar(obtenerVideoPreview(), camSelect.value || leerPreferencia('alambique.cameraId', '') || undefined, { numHands });
        obtenerVideoPreview().style.display = 'block';
        return await poblarCamaras();
      } catch (e) {
        const gamepad = confirm(`No se pudo iniciar la cámara (${e.message}).\nAceptar: usar gamepad. Cancelar: elegir teclado.`);
        contextoJuego.fuenteElegida = gamepad ? 'gamepad' : 'teclado';
        return null;
      }
    };
    this.boton(M.botones[0], 'Iniciar simulación', async () => {
      if (valoresFuente.includes(select.value)) fuenteActiva = select.value;
      contextoJuego.fuenteElegida = fuenteActiva;
      contextoJuego.nivelElegido = Number(nivelSelect.value) || 1;
      if (fuenteActiva === 'camara') await activarCamara();
      this.scene.start('Simulacion');
    });
    this.boton(M.botones[1], 'Calibrar cámara', async () => {
      contextoJuego.fuenteElegida = 'camara'; contextoJuego.gestor = new GestorEntrada({ fuente: 'camara' });
      try {
        const camara = obtenerSesionCamara(); camara.intercambiar = invertir.querySelector('input').checked;
        await camara.iniciar(obtenerVideoPreview(), camSelect.value || leerPreferencia('alambique.cameraId', '') || undefined, { numHands: 2 });
        obtenerVideoPreview().style.display = 'block'; await poblarCamaras(); this.scene.start('Calibracion');
      } catch (e) { alert(`No se pudo iniciar la cámara: ${e.message}`); }
    });
    this.boton(M.botones[2], 'Probar cámaras', async () => {
      const cams = await activarCamara();
      if (cams?.length) alert(`Cámara activa. ${cams.length} dispositivo(s) disponible(s).`);
    });
    this.add.text(M.controles.x + M.controles.ancho / 2, M.controles.y + M.controles.alto / 2,
      'Controles: derecha → entrada · pellizco izquierdo → salida v2 · teclado / gamepad · P parámetros · D depuración · F terminar · M / Select silencio',
      fuenteInterfaz(14, '#E6E8EA', { align: 'center', lineSpacing: 4 })).setOrigin(.5).setWordWrapWidth(M.controles.ancho - M.margenControl.horizontal).setAlpha(1);
  }

  update() { this.audio?.actualizarDesbloqueo(); }
}

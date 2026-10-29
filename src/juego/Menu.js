import { EscenaBase } from './EscenaBase.js';
import { contextoJuego } from './contexto.js';
import { leerPreferencia, guardarPreferencia } from './preferencias.js';
import { obtenerSesionCamara, listarCamaras } from '../vision/servicioCamara.js';
import { obtenerVideoPreview } from '../hmi/vistaCamara.js';
import { GestorEntrada } from '../entrada/gestorEntrada.js';
import { cargarNiveles } from '../modelo/niveles.js';

export class Menu extends EscenaBase {
  constructor() { super('Menu'); }
  create() {
    document.getElementById('camera-debug-info')?.remove();
    this.crearFondo('Menú de operación');
    if (this.textures.exists('logotipo')) this.add.image(1080, 178, 'logotipo').setDisplaySize(250, 160).setAlpha(.95);
    this.add.text(40, 130, 'Operador de tanques · sistema hidráulico no lineal', { fontSize: '19px', color: '#424c4f' });
    this.add.text(40, 195, 'Fuente de control', { fontSize: '20px', color: '#252b2d' });

    const valoresFuente = ['camara', 'gamepad', 'teclado', 'escalon'];
    const solicitada = new URLSearchParams(location.search).get('control');
    let fuenteActiva = valoresFuente.includes(solicitada) ? solicitada : 'camara';
    const select = document.createElement('select');
    select.innerHTML = '<option value="camara">Cámara</option><option value="gamepad">Gamepad</option><option value="teclado">Teclado</option><option value="escalon">Escalón de prueba</option>';
    Object.assign(select.style, { width: '310px', height: '40px', padding: '7px', fontSize: '16px' });
    const fuenteDom = this.add.dom(40, 226, select).setOrigin(0, 0);
    select.value = fuenteActiva;
    select.addEventListener('change', () => { if (valoresFuente.includes(select.value)) fuenteActiva = select.value; });
    contextoJuego.fuenteElegida = fuenteActiva;

    this.add.text(40, 300, 'Nivel', { fontSize: '20px', color: '#252b2d' });
    const niveles = cargarNiveles();
    const nivelSelect = document.createElement('select');
    niveles.forEach((nivel) => nivelSelect.add(new Option(`${nivel.id}. ${nivel.nombre}`, String(nivel.id))));
    Object.assign(nivelSelect.style, { width: '380px', height: '38px', padding: '6px', fontSize: '15px' });
    const nivelDom = this.add.dom(40, 330, nivelSelect).setOrigin(0, 0);
    nivelSelect.value = String(contextoJuego.nivelElegido || 1);
    nivelSelect.addEventListener('change', () => { contextoJuego.nivelElegido = Number(nivelSelect.value); });
    this.add.text(40, 378, 'Mano derecha: válvula de entrada · pellizco izquierdo: salida del tanque 2', { fontSize: '15px', color: '#414b4e' });
    const camSelect = document.createElement('select'); camSelect.id = 'camera-select'; camSelect.innerHTML = '<option value="">Cámara predeterminada</option>'; camSelect.value = leerPreferencia('alambique.cameraId', '');
    Object.assign(camSelect.style, { width: '245px', height: '38px', padding: '6px', fontSize: '14px' });
    const cameraSelectDom = this.add.dom(1025, 366, camSelect).setOrigin(0, 0.5);
    const invertir = document.createElement('label'); invertir.style.cssText = 'display:flex;align-items:center;gap:6px;width:220px;height:38px;font:14px system-ui;color:#252b2d'; invertir.innerHTML = '<input type="checkbox"> Intercambiar derecha / izquierda';
    invertir.querySelector('input').checked = leerPreferencia('alambique.intercambiarEtiquetas', 'false') === 'true';
    const invertirDom = this.add.dom(800, 366, invertir).setOrigin(0, 0.5);
    invertir.querySelector('input').addEventListener('change', (ev) => { const valor = ev.target.checked; guardarPreferencia('alambique.intercambiarEtiquetas', String(valor)); if (contextoJuego.camara) contextoJuego.camara.intercambiar = valor; });

    const poblarCamaras = async () => {
      const cams = await listarCamaras();
      const actual = leerPreferencia('alambique.cameraId', ''); camSelect.replaceChildren(new Option('Cámara predeterminada', ''));
      cams.forEach((d, i) => camSelect.add(new Option(d.label || `Cámara ${i + 1}`, d.deviceId)));
      camSelect.value = cams.some((d) => d.deviceId === actual) ? actual : '';
      return cams;
    };
    camSelect.addEventListener('change', async () => {
      guardarPreferencia('alambique.cameraId', camSelect.value);
      const camara = contextoJuego.camara;
      if (camara?.activo) { try { await camara.iniciar(obtenerVideoPreview(), camSelect.value || undefined); } catch (e) { alert(`No se pudo abrir esa cámara: ${e.message}`); } }
    });
    this.events.once('shutdown', () => { fuenteDom.destroy(); nivelDom.destroy(); cameraSelectDom.destroy(); invertirDom.destroy(); });
    poblarCamaras().catch(() => {});

    const activarCamara = async () => {
      try {
        const camara = obtenerSesionCamara();
        camara.intercambiar = invertir.querySelector('input').checked;
        await camara.iniciar(obtenerVideoPreview(), camSelect.value || leerPreferencia('alambique.cameraId', '') || undefined);
        obtenerVideoPreview().style.display = 'block';
        return await poblarCamaras();
      } catch (e) {
        const gamepad = confirm(`No se pudo iniciar la cámara (${e.message}).\nAceptar: usar gamepad. Cancelar: elegir teclado.`);
        contextoJuego.fuenteElegida = gamepad ? 'gamepad' : 'teclado';
        return null;
      }
    };
    this.boton(45, 408, 'Iniciar simulación', async () => {
      if (valoresFuente.includes(select.value)) fuenteActiva = select.value;
      contextoJuego.fuenteElegida = fuenteActiva;
      contextoJuego.nivelElegido = Number(nivelSelect.value) || 1;
      if (fuenteActiva === 'camara') await activarCamara();
      this.scene.start('Simulacion');
    });
    this.boton(45, 478, 'Calibrar cámara', async () => {
      contextoJuego.fuenteElegida = 'camara'; contextoJuego.gestor = new GestorEntrada({ fuente: 'camara' });
      try {
        const camara = obtenerSesionCamara(); camara.intercambiar = invertir.querySelector('input').checked;
        await camara.iniciar(obtenerVideoPreview(), camSelect.value || leerPreferencia('alambique.cameraId', '') || undefined);
        obtenerVideoPreview().style.display = 'block'; await poblarCamaras(); this.scene.start('Calibracion');
      } catch (e) {
        const gamepad = confirm(`No se pudo iniciar la cámara (${e.message}).\nAceptar: usar gamepad. Cancelar: usar teclado.`);
        contextoJuego.fuenteElegida = gamepad ? 'gamepad' : 'teclado'; this.scene.start('Menu');
      }
    });
    this.add.text(40, 555, 'Controles: mano derecha → entrada · pellizco izquierdo → salida tanque 2\nGamepad / teclado alternativos · P parámetros · D depuración · Enter pausa', { fontSize: '15px', color: '#414b4e', lineSpacing: 6 });
    this.boton(800, 408, 'Probar / actualizar cámaras', async () => {
      const cams = await activarCamara();
      if (cams?.length === 1) alert('Cámara activa. Se encontró una cámara.');
      else if (cams?.length > 1) alert(`Cámara activa. Elige dispositivo en el selector. Se encontraron ${cams.length} cámaras.`);
    });
  }
}

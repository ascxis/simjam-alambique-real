import { EscenaBase } from './EscenaBase.js';
import { contextoJuego } from './contexto.js';
import { leerPreferencia, guardarPreferencia } from './preferencias.js';
import { obtenerSesionCamara, listarCamaras } from '../vision/servicioCamara.js';
import { obtenerVideoPreview } from '../hmi/vistaCamara.js';
import { GestorEntrada } from '../entrada/gestorEntrada.js';
import { cargarNiveles } from '../modelo/niveles.js';
import { LAYOUT } from '../hmi/layout.js';
import { fuenteInterfaz } from '../hmi/estilo.js';

const selectCss = 'box-sizing:border-box;background:#1C2026;color:#E6E8EA;border:1px solid #B85A24;border-radius:8px;padding:7px 10px;font:15px Segoe UI,Arial,sans-serif;';

export class Menu extends EscenaBase {
  constructor() { super('Menu'); }
  create() {
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
    this.events.once('shutdown', () => [fuenteDom, nivelDom, cameraSelectDom, invertirDom].forEach((dom) => dom.destroy()));
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
        await camara.iniciar(obtenerVideoPreview(), camSelect.value || leerPreferencia('alambique.cameraId', '') || undefined);
        obtenerVideoPreview().style.display = 'block'; await poblarCamaras(); this.scene.start('Calibracion');
      } catch (e) { alert(`No se pudo iniciar la cámara: ${e.message}`); }
    });
    this.boton(M.botones[2], 'Probar cámaras', async () => {
      const cams = await activarCamara();
      if (cams?.length) alert(`Cámara activa. ${cams.length} dispositivo(s) disponible(s).`);
    });
    this.add.text(M.controles.x + M.margenControl.x, M.controles.y + M.margenControl.y,
      'Controles: derecha → entrada · pellizco izquierdo → salida v2 · teclado / gamepad · P parámetros · D depuración · F terminar',
      fuenteInterfaz(14)).setWordWrapWidth(M.controles.ancho - M.margenControl.horizontal);
  }
}

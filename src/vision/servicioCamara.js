import { CamaraManos } from './camara.js';
import { dibujarPuntosDepuracion } from '../hmi/vistaCamara.js';
import { contextoJuego } from '../juego/contexto.js';
import { leerPreferencia } from '../juego/preferencias.js';

export function obtenerSesionCamara() {
  if (!contextoJuego.camara) {
    const intercambiar = leerPreferencia('alambique.intercambiarEtiquetas', 'false') === 'true';
    contextoJuego.camara = new CamaraManos({ intercambiar, onFrame: (frame) => { contextoJuego.gestor?.procesarManos(frame); dibujarPuntosDepuracion(frame); } });
  }
  return contextoJuego.camara;
}

export function detenerSesionCamara() { return contextoJuego.camara?.detener() ?? Promise.resolve(); }

export async function listarCamaras() {
  if (!navigator.mediaDevices?.enumerateDevices) return [];
  return obtenerSesionCamara().dispositivos();
}

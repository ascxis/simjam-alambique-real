import { EscenaBase } from './EscenaBase.js';
import { calcularMetricas } from '../modelo/metricas.js';
import { dibujarTendencia } from '../hmi/tendencia.js';

export class Fin extends EscenaBase {
  constructor() { super('Fin'); }
  create(data) {
    this.crearFondo('Lo que pasó en el modelo');
    const muestras = data.muestras || [], metricas = calcularMetricas(muestras, { referencia: 1, banda: .02 });
    this.add.text(36, 120, `Valor final: ${metricas.valorFinal.toFixed(3)}   Mp: ${metricas.Mp.toFixed(2)}%   ts (2%): ${metricas.ts?.toFixed(2) ?? '—'} s\nIAE: ${metricas.IAE.toFixed(3)}   ISE: ${metricas.ISE.toFixed(3)}   Tiempo en banda: ${metricas.tiempoEnBanda.toFixed(2)} s`, { fontSize: '18px', color: '#252b2d', lineSpacing: 12 });
    dibujarTendencia(this, { x: 50, y: 270, ancho: 550, alto: 260, muestras, min: 0, max: 1, unidad: 'u', titulo: 'Salida del sistema y(t)', tiempoCompleto: true, ejeTiempo: true, autoEscala: true });
    dibujarTendencia(this, { x: 650, y: 270, ancho: 550, alto: 260, muestras, clave: 'u', min: 0, max: 1, unidad: '', titulo: 'Entrada aplicada u(t)', tiempoCompleto: true, ejeTiempo: true, autoEscala: true });
    this.boton(50, 585, 'Descargar CSV de la partida', () => data.registro?.descargar());
    this.boton(420, 585, 'Volver al menú', () => this.scene.start('Menu'));
    this.add.text(50, 630, 'Unidades: t en s; u_crudo y u de 0 a 1 (adimensionales); x1 e y en unidades del modelo (u).', { fontSize: '14px', color: '#424c4f' });
  }
}

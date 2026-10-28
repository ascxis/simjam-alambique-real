export function obtenerVideoPreview() {
  let video = document.getElementById('camera-preview');
  if (!video) {
    video = document.createElement('video'); video.id = 'camera-preview'; video.autoplay = true; video.muted = true; video.playsInline = true;
    Object.assign(video.style, { position: 'fixed', right: '18px', bottom: '18px', width: '220px', height: '165px', objectFit: 'cover', transform: 'scaleX(-1)', border: '2px solid #64777d', zIndex: 10, display: 'none' });
    document.body.append(video);
  }
  return video;
}

export function dibujarPuntosDepuracion(frame) {
  let canvas = document.getElementById('camera-debug');
  if (!canvas) {
    canvas = document.createElement('canvas'); canvas.id = 'camera-debug'; canvas.width = 220; canvas.height = 165;
    Object.assign(canvas.style, { position: 'fixed', right: '18px', bottom: '18px', width: '220px', height: '165px', zIndex: 11, pointerEvents: 'none', display: 'none' });
    document.body.append(canvas);
  }
  const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, 220, 165); ctx.save(); ctx.translate(220, 0); ctx.scale(-1, 1); ctx.strokeStyle = '#fff'; ctx.strokeRect(22, 16.5, 176, 132); ctx.restore();
  for (const mano of frame.manos) {
    ctx.fillStyle = mano.etiqueta === 'der' ? '#ffd700' : '#4ed4ce';
    for (const p of mano.puntos) { ctx.beginPath(); ctx.arc((1 - p.x) * 220, p.y * 165, 2.2, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillText(mano.etiqueta, (1 - mano.puntos[0].x) * 220, mano.puntos[0].y * 165);
  }
  ctx.fillStyle = '#fff'; ctx.fillText(`${frame.fps.toFixed(0)} FPS`, 5, 13);
}

export function mostrarVistaCamaraDepuracion(visible) {
  const display = visible ? 'block' : 'none';
  const canvas = document.getElementById('camera-debug'), video = document.getElementById('camera-preview');
  if (canvas) canvas.style.display = display;
  if (video) video.style.display = display;
}

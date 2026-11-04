import { spawn } from 'node:child_process';
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegStatic from 'ffmpeg-static';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const entrada = path.join(raiz, 'arte_fuente', 'audio_originales');
const salida = path.join(raiz, 'public', 'assets', 'audio');
const nombresMusica = new Set(['musica_menu', 'musica_operacion', 'musica_perturbacion', 'musica_superado', 'musica_fallido']);
const duracionMusica = { musica_menu: 60, musica_operacion: 60, musica_perturbacion: 60, musica_superado: 36, musica_fallido: 42 };
const inicioMusica = { musica_menu: 30, musica_operacion: 30, musica_perturbacion: 17, musica_superado: 2, musica_fallido: 20 };

function ejecutar(args) {
  return new Promise((resolve, reject) => {
    const proceso = spawn(ffmpegStatic, args, { stdio: 'ignore', windowsHide: true });
    proceso.once('error', reject);
    proceso.once('close', (codigo) => codigo === 0 ? resolve() : reject(new Error(`ffmpeg terminó con código ${codigo}`)));
  });
}

await mkdir(salida, { recursive: true });
let archivos;
try { archivos = await readdir(entrada); }
catch (error) { throw new Error(`No se pueden leer los originales de audio en ${entrada}`, { cause: error }); }
const fuentes = archivos.filter((nombre) => /\.(wav|mp3)$/i.test(nombre));
if (!fuentes.length) throw new Error(`No hay WAV o MP3 en ${entrada}`);

for (const nombre of fuentes) {
  const base = path.parse(nombre).name;
  const musica = nombresMusica.has(base);
  const origen = path.join(entrada, nombre);
  const formato = musica ? '96 kbps estéreo' : '64 kbps mono, recortado y normalizado';
  for (const [extension, codec] of [['ogg', ['-c:a', 'libvorbis']], ['mp3', ['-c:a', 'libmp3lame']]]) {
    const destino = path.join(salida, `${base}.${extension}`);
    try {
      const prefijo = ['-y', '-hide_banner', '-loglevel', 'error', '-i', origen];
      const parametros = musica
        ? [
            '-filter_complex',
            `[0:a]atrim=start=${inicioMusica[base]}:duration=${duracionMusica[base]},asetpts=PTS-STARTPTS,asplit=3[a][colaBase][cabezaBase];` +
            `[a]atrim=start=0:end=${duracionMusica[base] - 2}[cuerpo];` +
            `[colaBase]atrim=start=${duracionMusica[base] - 2}:end=${duracionMusica[base]}[cola];` +
            `[cabezaBase]atrim=start=0:end=2[cabeza];` +
            `[cola][cabeza]acrossfade=d=2:c1=tri:c2=tri[union];` +
            `[cuerpo][union]concat=n=2:v=0:a=1,loudnorm=I=-16:LRA=7:TP=-1[out]`,
            '-map', '[out]', '-ac', '2', '-ar', '44100', '-b:a', '96k',
          ]
        : [
            '-af', 'silenceremove=start_periods=1:start_duration=0.02:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-45dB,areverse,loudnorm=I=-18:LRA=7:TP=-1.5,apad=pad_dur=0.08',
            '-ac', '1', '-ar', '44100', '-b:a', '64k',
          ];
      await ejecutar([...prefijo, ...parametros, ...codec, destino]);
      const bytes = (await stat(destino)).size;
      console.info(`[AUDIO] ${base}.${extension}: ${formato}, ${(bytes / 1024).toFixed(1)} KiB`);
    } catch (error) {
      console.warn(`[AVISO AUDIO] No se pudo procesar ${nombre} a ${extension}: ${error.message}`);
    }
  }
}

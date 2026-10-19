// Free on-device speech recognition (Whisper tiny, English) via Transformers.js. Runs in the browser; no server, no key.
// The library and model download once from public CDNs and are cached by the browser.
const LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0";
const MODEL = "Xenova/whisper-tiny.en";
let asr = null;
let loading = null;

export function loadAsr(onProgress) {
  if (asr) return Promise.resolve(asr);
  if (loading) return loading;
  loading = (async () => {
    const tf = await new Function("u", "return import(u)")(LIB); // loaded straight from the CDN, bypassing the bundler
    tf.env.allowLocalModels = false;
    asr = await tf.pipeline("automatic-speech-recognition", MODEL, {
      progress_callback: (p) => { if (onProgress && p && p.status === "progress" && typeof p.progress === "number") onProgress(Math.round(p.progress)); },
    });
    return asr;
  })().catch(() => { loading = null; throw new Error("Could not load the on-device AI model. Please check your internet connection (needed once) and try again."); });
  return loading;
}

export async function transcribeBlob(blob, onProgress) {
  const a = await loadAsr(onProgress);
  const buf = await blob.arrayBuffer();
  const Ctx = window.AudioContext || window.webkitAudioContext;
  const ctx = new Ctx({ sampleRate: 16000 });
  const audio = await ctx.decodeAudioData(buf);
  const data = audio.getChannelData(0);
  ctx.close();
  const out = await a(data);
  return (out && out.text ? out.text : "").trim();
}

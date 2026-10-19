// Records a short clip with the microphone. Returns { stop, done } where done resolves to an audio Blob.
export function startClip(maxMs = 8000) {
  return navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    const rec = new MediaRecorder(stream);
    const chunks = [];
    let finish;
    const done = new Promise((res) => { finish = res; });
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.onstop = () => { stream.getTracks().forEach((t) => t.stop()); finish(new Blob(chunks, { type: rec.mimeType || "audio/webm" })); };
    rec.start();
    const timer = setTimeout(() => { if (rec.state === "recording") rec.stop(); }, maxMs);
    return { stop: () => { clearTimeout(timer); if (rec.state === "recording") rec.stop(); }, done };
  });
}

export const drawCountdownOverlay = (
  now: number,
  startTime: number,
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) => {
  const canvas = canvasRef.current;
  const video = videoRef.current;
  if (!canvas || !video) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = video.videoWidth || 640;
  const height = video.videoHeight || 480;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  ctx.clearRect(0, 0, width, height);

  // gunakan startTime dari argumen, bukan angka tetap
  const elapsed = now - startTime;
  const duration = 3000; // total 3 detik
  const remainingMs = Math.max(0, duration - elapsed);
  const remainingSec = Math.ceil(remainingMs / 1000);

  if (remainingMs <= 0) {
    ctx.clearRect(0, 0, width, height);
    return;
  }

  // semi-transparent dark overlay
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // teks besar countdown di tengah + caption di atas angka
  const label = String(remainingSec);
  const caption = "Capturing photo in";

  ctx.save();
  // Mirrored draw to match preview mirror
  ctx.translate(width, 0);
  ctx.scale(-1, 1);

  const minDim = Math.min(width, height);
  // buat angkanya sedikit lebih kecil dan beri lebih banyak space
  const numberFontSize = Math.round(minDim * 0.16); // sebelumnya ~0.22, dikurangi
  const captionFontSize = Math.round(minDim * 0.06);
  const gap = Math.round(numberFontSize * 0.6); // jarak antar caption dan angka

  // posisikan sedikit lebih rendah agar ada ruang atas
  const centerX = width / 2;
  const centerY = height / 2 + Math.round(minDim * 0.06);

  // caption (above number) -- lebih atas dengan gap
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = `500 ${captionFontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(caption, centerX, centerY - gap / 2);

  // optional subtle shadow for number
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;

  // big number (slightly smaller than before)
  ctx.fillStyle = "rgba(255,255,255,0.98)";
  ctx.font = `700 ${numberFontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(label, centerX, centerY - gap / 2 + 6);

  // reset shadow
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.restore();
};

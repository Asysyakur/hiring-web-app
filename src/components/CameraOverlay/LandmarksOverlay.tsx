
import React from "react";

export const drawLandmarksOverlay = (
  landmarks: any[] | null,
  detectedPose: number,
  requiredPose: number,
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  isCountdownActiveRef: React.RefObject<boolean>,
  stepRef: React.RefObject<number>
) => {
  return () => {
    // skip jika countdown sedang aktif
    if (isCountdownActiveRef.current) return;

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
    if (!landmarks || landmarks.length === 0) return;

    // Hitung bounding box tangan
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const lm of landmarks) {
      const x = lm.x * width;
      const y = lm.y * height;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }

    const pad = Math.max(16, Math.min(width, height) * 0.03);
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(width, maxX + pad);
    maxY = Math.min(height, maxY + pad);
    const boxW = maxX - minX;
    const boxH = maxY - minY;

    // Tentukan warna overlay berdasarkan apakah pose yang terdeteksi benar
    // POSES was not defined here; only compare detectedPose to requiredPose
    const isCorrectPose = detectedPose === requiredPose;

    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = isCorrectPose
      ? "rgba(34,197,94,1)" // hijau
      : "rgba(239,68,68,1)"; // merah
    roundRect(ctx, minX, minY, boxW, boxH, 12);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.lineWidth = 4;
    ctx.strokeStyle = isCorrectPose
      ? "rgba(34,197,94,0.95)"
      : "rgba(239,68,68,0.95)";
    roundRect(ctx, minX, minY, boxW, boxH, 12);
    ctx.stroke();
    ctx.restore();

    // Label pose
    ctx.font = "14px sans-serif";
    ctx.textBaseline = "top";
    const label = isCorrectPose ? `Pose ${stepRef.current + 1}` : "Align pose";
    const measured = ctx.measureText(label);
    const labelW = measured.width + 12;
    const labelH = 22;
    const labelX = Math.max(8, minX);
    const labelY = Math.max(8, minY - labelH - 6);

    // Mirrored text fix (biar gak kebalik di canvas mirror)
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    const bgX = labelX - 6;
    const bgY = labelY - 4;
    const bgW = labelW;
    const bgH = labelH;
    const internalBgX = width - bgW - bgX;

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    roundRect(ctx, internalBgX, bgY, bgW, bgH, 6);
    ctx.fill();

    ctx.fillStyle = isCorrectPose ? "rgba(34,197,94,1)" : "rgba(239,68,68,1)";
    const textInternalX = width - (labelX + measured.width);
    ctx.fillText(label, textInternalX, labelY + 2);
    ctx.restore();
  };

  // helpers for rounded rect fill and stroke
  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }
};
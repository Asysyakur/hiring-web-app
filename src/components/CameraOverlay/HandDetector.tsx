// components/HandDetector.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";

interface HandDetectorProps {
  onModelLoaded?: () => void;
}

export const HandDetector: React.FC<HandDetectorProps> = ({ onModelLoaded }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let hands: Hands | null = null;

    const initHands = async () => {
      hands = new Hands({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      await hands.initialize(); // pastikan model siap
      onModelLoaded?.(); // panggil callback ketika model selesai load

      const camera = new Camera(videoRef.current!, {
        onFrame: async () => {
          if (videoRef.current) {
            await hands!.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      camera.start();
    };

    initHands();

    return () => {
      hands?.close();
    };
  }, [onModelLoaded]);

  return (
    <div className="relative">
      <video ref={videoRef} className="rounded-lg" autoPlay playsInline />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
};

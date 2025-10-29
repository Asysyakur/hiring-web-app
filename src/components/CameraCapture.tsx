"use client";

import React, { useRef, useState, useEffect } from "react";
import Hand1 from "@/assets/Hand Vector (1).svg";
import Hand2 from "@/assets/Hand Vector (2).svg";
import Hand3 from "@/assets/Hand Vector (3).svg";
import Image from "next/image";
import Button from "./Form/Button";
import { drawLandmarksOverlay } from "./CameraOverlay/LandmarksOverlay";
import { drawCountdownOverlay } from "./CameraOverlay/CountdownOverlay";
import { ChevronRight, X, Upload } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
}

const POSES = {
  NONE: 0,
  INDEX: 1,
  INDEX_MIDDLE: 2,
  INDEX_MIDDLE_RING: 3,
};

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [step, setStep] = useState(0);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isCountdownActiveRef = useRef(false);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const stepRef = useRef<number>(0);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  // mediapipe refs
  const handsRef = useRef<any | null>(null);
  const cameraInstanceRef = useRef<any | null>(null);
  const resizeHandlerRef = useRef<(() => void) | null>(null);

  const stableCountRef = useRef(0);
  const sequence = [POSES.INDEX, POSES.INDEX_MIDDLE, POSES.INDEX_MIDDLE_RING];

  useEffect(() => {
    return () => {
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAll = () => {
    try {
      if (cameraInstanceRef.current?.stop) cameraInstanceRef.current.stop();
    } catch {}
    try {
      if (handsRef.current?.close) handsRef.current.close();
    } catch {}
    // remove resize listener
    try {
      if (resizeHandlerRef.current) {
        window.removeEventListener("resize", resizeHandlerRef.current);
        resizeHandlerRef.current = null;
      }
    } catch {}
    // stop tracks if exist (compat)
    try {
      const stream = (videoRef.current as any)?.srcObject as MediaStream | null;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
      }
      if (videoRef.current) videoRef.current.onloadedmetadata = null;
    } catch {}
  };

  const detectPoseFromLandmarks = (landmarks: any[] | null): number => {
    if (!landmarks || landmarks.length === 0) return POSES.NONE;

    const has = (i: number) => landmarks[i] !== undefined;

    // helper: finger extended (tip above pip)
    const isExtended = (tip: number, pip: number) =>
      has(tip) && has(pip) ? landmarks[tip].y < landmarks[pip].y : false;

    const indexExt = isExtended(8, 6);
    const middleExt = isExtended(12, 10);
    const ringExt = isExtended(16, 14);
    const pinkyExt = isExtended(20, 18);

    // thumb extension check (use horizontal distance from wrist as proxy)
    const thumbExt =
      has(4) && has(0)
        ? Math.abs(landmarks[4].x - landmarks[0].x) > 0.06
        : false;

    // if thumb is extended, invalidate any pose
    if (thumbExt) return POSES.NONE;

    // Strict detection: required fingers must be extended and all other fingers must NOT be extended
    // 1) only index extended
    if (indexExt && !middleExt && !ringExt && !pinkyExt) return POSES.INDEX;
    // 2) index + middle extended, ring and pinky not
    if (indexExt && middleExt && !ringExt && !pinkyExt)
      return POSES.INDEX_MIDDLE;
    // 3) index + middle + ring extended, pinky not
    if (indexExt && middleExt && ringExt && !pinkyExt)
      return POSES.INDEX_MIDDLE_RING;

    return POSES.NONE;
  };

  const onResults = (results: any) => {
    const landmarks = results.multiHandLandmarks?.[0] ?? null;
    const currentStep = stepRef.current;
    const requiredPose = sequence[currentStep];

    const detectedPose = detectPoseFromLandmarks(landmarks);

    // kalau countdown sedang aktif, lewati semua overlay & pose detection
    if (isCountdownActiveRef.current) return;

    // gambar overlay pose hanya jika belum countdown
    drawLandmarksOverlay(
      landmarks,
      detectedPose,
      requiredPose,
      videoRef,
      canvasRef,
      isCountdownActiveRef,
      stepRef
    )();

    const detected = detectPoseFromLandmarks(landmarks);

    if (detectedPose === requiredPose) {
      const now = performance.now();
      if (stableCountRef.current === 0) {
        stableCountRef.current = now;
      } else {
        const elapsedSec = (now - stableCountRef.current) / 1000;
        setStatusText(
          `Hold pose ${currentStep + 1}... (${elapsedSec.toFixed(2)}/1.00s)`
        );

        if (elapsedSec >= 1.0) {
          stableCountRef.current = 0;
          if (currentStep < sequence.length - 1) {
            setStep((prev) => {
              const next = prev + 1;
              stepRef.current = next;
              return next;
            });
          } else {
            // FINAL STEP SELESAI
            setStep((prev) => {
              {
                const next = prev + 1;
                stepRef.current = next;
                return next;
              }
            });
            setStatusText("Pose sequence complete! Capturing photo...");
            isCountdownActiveRef.current = true; // <- aktifkan flag countdown

            const startTime = performance.now();
            const countdownInterval = setInterval(() => {
              const now = performance.now();
              drawCountdownOverlay(now, startTime, videoRef, canvasRef); // ← kirim startTime ke fungsi
              if (now - startTime >= 3000) {
                clearInterval(countdownInterval);
                isCountdownActiveRef.current = false;
                capturePreview();
                setIsCaptured(true);
              }
            }, 100);
          }
        }
      }
    } else {
      stableCountRef.current = 0;
      if (detected === sequence[Math.max(0, currentStep - 1)]) {
        setStatusText(
          `Back to previous pose, continue to pose ${currentStep + 1}`
        );
      } else {
        if (detected === POSES.NONE) {
          setStatusText(`No hand detected. Do pose ${currentStep + 1}`);
        } else {
          setStatusText(`Wrong pose. Do pose ${currentStep + 1}`);
        }
      }
    }
  };

  // sync overlay canvas size to displayed video size (handles DPR for crisp overlays)
  const adjustOverlayCanvas = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    try {
      const rect = video.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${Math.round(rect.width)}px`;
      canvas.style.height = `${Math.round(rect.height)}px`;
    } catch {}
  };

  const openCamera = async () => {
    setIsModelLoading(true);
    setShowCamera(true);
    setStep(0);
    setIsCaptured(false);
    stableCountRef.current = 0;

    try {
      const [{ Hands }, { Camera }] = await Promise.all([
        import("@mediapipe/hands"),
        import("@mediapipe/camera_utils"),
      ]);

      const hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      });

      hands.onResults(onResults);
      handsRef.current = hands;

      if (!videoRef.current) throw new Error("Video element not mounted");

      // choose camera resolution based on actual displayed size for responsiveness
      let desiredWidth = 1280;
      let desiredHeight = 720;
      try {
        const rect = videoRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          desiredWidth = Math.round(
            rect.width * (window.devicePixelRatio || 1)
          );
          desiredHeight = Math.round((desiredWidth * 9) / 16);
        } else {
          // fallback to window width for smaller devices
          const winW = Math.min(window.innerWidth, 1280);
          desiredWidth = Math.round(winW * (window.devicePixelRatio || 1));
          desiredHeight = Math.round((desiredWidth * 9) / 16);
        }
      } catch {}

      // @ts-ignore - Camera accepts facingMode: "user" on most builds; prefer front camera on mobile
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (!videoRef.current) return;
          await hands.send({ image: videoRef.current });
        },
        width: desiredWidth,
        height: desiredHeight,
        facingMode: "user",
      });

      cameraInstanceRef.current = camera;

      // ensure overlay canvas matches video after metadata / size changes
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = () => {
          adjustOverlayCanvas();
        };
      }

      // add resize handler so canvas follows layout changes (mobile rotate / resize)
      const onResize = () => adjustOverlayCanvas();
      resizeHandlerRef.current = onResize;
      window.addEventListener("resize", onResize);

      await camera.start();

      // adjust canvas right after camera start
      setTimeout(() => adjustOverlayCanvas(), 100);
    } catch (err) {
      console.error("Could not open camera / initialize hands", err);
      setShowCamera(false);
      setStatusText(null);
      stopAll();
    } finally {
      setIsModelLoading(false);
    }
  };

  const capturePreview = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // mirror agar hasil sesuai tampilan preview
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/png");
    setPreviewImage(dataUrl);
  };

  const handleSubmit = () => {
    if (previewImage) {
      onCapture(previewImage);
      setPreviewImage(null);
      closeCamera();
    }
  };

  const closeCamera = () => {
    stopAll();
    setShowCamera(false);
    setStatusText(null);
    setStep(0);
  };

  const handleRetake = () => {
    setIsCaptured(false);
    setStep(0);
    stableCountRef.current = 0;
    openCamera();
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-primaryBg text-primaryText text-sm font-bold rounded-xl border-2 hover:bg-gray-100 transition w-full sm:w-auto">
        <Upload strokeWidth={3} size={18} />

        <button
          type="button"
          onClick={openCamera}
          className="w-full sm:w-auto text-left"
        >
          Take a Picture
        </button>
      </div>

      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg w-full max-w-full sm:max-w-2xl h-auto max-h-[90vh] overflow-auto p-3 sm:p-4">
            <div className="flex justify-between items-center px-1 mb-4">
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold">
                  Raise Your Hand to Capture
                </h2>
                <h3 className="text-sm">
                  We’ll take the photo once your hand pose is detected in
                  sequence.
                </h3>
              </div>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-gray-200 transition"
                onClick={closeCamera}
                aria-label="Close"
                title="Close"
              >
                <X />
              </button>
            </div>

            <div
              className="relative w-full bg-black flex items-center justify-center mx-auto overflow-hidden rounded-lg aspect-[4/3] sm:aspect-video"
              style={{
              height: "auto",
              maxHeight: "calc(100vh - 220px)",
              }}
            >
              {isCaptured ? (
                <div className="absolute inset-0">
                  <Image
                    src={previewImage || "/placeholder-image.png"}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <>
                  {isModelLoading && (
                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-50">
                      <div className="w-10 h-10 border-4 border-gray-300 border-t-[#01959F] rounded-full animate-spin mb-2"></div>
                      <p className="text-sm text-gray-700 font-medium">
                        Loading hand detection model...
                      </p>
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    className="w-full h-auto object-contain"
                    playsInline
                    muted
                    autoPlay
                    style={{ transform: "scaleX(-1)" }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    style={{ transform: "scaleX(-1)" }}
                  />
                </>
              )}
            </div>

            <div className="mt-3 flex flex-col justify-center gap-4">
              <p className="text-sm text-primaryText">
                To take a picture, follow the hand poses in the order shown
                below. The system will automatically capture the image once the
                final pose is detected.
              </p>
              <div className="flex flex-col items-center gap-2 md:gap-4">
                {isCaptured ? (
                  <div className="mt-4 flex flex-col justify-center sm:flex-row items-center gap-3 w-full">
                    <Button
                      onClick={handleRetake}
                      label="Retake"
                      className="w-full sm:w-auto"
                    />
                    <Button
                      onClick={handleSubmit}
                      className="ml-0 sm:ml-4 w-full sm:w-auto"
                      label="Use Photo"
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center items-center gap-1 md:gap-4">
                    {[
                      { img: Hand1, label: "Pose 1" },
                      { img: Hand2, label: "Pose 2" },
                      { img: Hand3, label: "Pose 3" },
                    ].map((p, i, arr) => {
                      const isCurrent = step === i;
                      const isDone = step > i;
                      // compute progress from stableCountRef when current step is being held
                      let progress = 0;
                      if (isCurrent && stableCountRef.current !== 0) {
                        progress = Math.min(
                          1,
                          (performance.now() - stableCountRef.current) / 1000
                        );
                      }

                      return (
                        <React.Fragment key={i}>
                          <div
                            className={`flex flex-col items-center p-2 rounded-md w-16 sm:w-24 ${
                              isDone
                                ? "bg-white border-2 border-success shadow-sm"
                                : isCurrent
                                ? "bg-white border-2 border-secondary shadow-md"
                                : "bg-white border border-gray-200"
                            }`}
                            title={p.label}
                          >
                            <Image
                              src={p.img}
                              alt={p.label}
                              className="w-8 h-8 sm:w-12 sm:h-12 object-contain p-0 md:p-1"
                            />
                            <div className="w-full mt-2 text-xs text-center">
                              {isDone ? (
                                <span className="text-success font-medium">
                                  Done
                                </span>
                              ) : isCurrent ? (
                                <>
                                  {/* show status and progress when current */}
                                  <div className="w-full mt-1">
                                    <div className="h-2 w-full bg-gray-200 rounded overflow-hidden">
                                      <div
                                        className={`bg-success h-full`}
                                        style={{
                                          width: `${Math.round(
                                            progress * 100
                                          )}%`,
                                        }}
                                      />
                                    </div>
                                    <div className="text-xs mt-1 text-gray-600">
                                      {isCurrent && stableCountRef.current !== 0
                                        ? "Holding..."
                                        : "Ready"}
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <span className="text-gray-500">Next</span>
                              )}
                            </div>
                          </div>

                          {/* static chevron between steps (no animations, no transitions) */}
                          {i < arr.length - 1 && (
                            <div
                              className="mx-0 sm:mx-4 flex items-center"
                              aria-hidden
                            >
                              <ChevronRight size={24} strokeWidth={2} />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CameraCapture;

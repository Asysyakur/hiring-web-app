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
  const stepRef = useRef<number>(0);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  // mediapipe refs
  const handsRef = useRef<any | null>(null);
  const cameraInstanceRef = useRef<any | null>(null);

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
    // stop tracks if exist (compat)
    try {
      const stream = (videoRef.current as any)?.srcObject as MediaStream | null;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
      }
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

  const openCamera = async () => {
    setShowCamera(true);
    setStep(0);
    setIsCaptured(false);
    stableCountRef.current = 0;

    try {
      // dynamic imports to avoid SSR/bundle issues
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

      // create camera helper that feeds video frames into Hands
      // @ts-ignore Camera type from mediapipe
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (!videoRef.current) return;
          await hands.send({ image: videoRef.current });
        },
        width: 1280,
        height: 720,
      });

      cameraInstanceRef.current = camera;
      await camera.start();
    } catch (err) {
      console.error("Could not open camera / initialize hands", err);
      setShowCamera(false);
      setStatusText(null);
      stopAll();
    }
  };

  const capturePreview = () => {
    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth || video.clientWidth || 1280;
    const height =
      video.videoHeight || video.clientHeight || Math.round((width * 9) / 16);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // mirror capture to match preview
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
      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-primaryBg text-primaryText text-sm font-bold rounded-xl border-2 hover:bg-gray-100 transition">
        <Upload strokeWidth={3} size={18} />

        <button type="button" onClick={openCamera}>
          Take a Picture
        </button>
      </div>

      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-4 w-[90%] max-w-2xl">
            <div className="flex justify-between items-center px-2 mb-4">
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
              className="w-full bg-black flex items-center justify-center relative"
              style={{ aspectRatio: "16/9" }}
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
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                    style={{ transform: "scaleX(-1)" }} // preview mirror
                  />
                  {/* overlay canvas draws landmarks and numbers */}
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
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
              <div className="flex flex-col items-center gap-4">
                {isCaptured ? (
                  <div className="mt-4">
                    <Button onClick={handleRetake} label="Retake" />
                    <Button
                      onClick={handleSubmit}
                      className="ml-4"
                      label="Use Photo"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center gap-4">
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
                            className={`flex flex-col items-center p-2 rounded-md w-20 ${
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
                              className="w-12 h-12 object-contain p-1"
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
                            <div className="mx-4 flex items-center" aria-hidden>
                              <ChevronRight size={32} strokeWidth={2} />
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

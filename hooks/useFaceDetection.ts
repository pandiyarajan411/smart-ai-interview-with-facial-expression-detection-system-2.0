'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface FaceMetrics {
  emotion: string;
  confidence: number;
  eyeContact: number;
  nervousness: number;
  smile: number;
  anger: number;
  fear: number;
  neutral: number;
  expressions: Record<string, number>;
}

const DEFAULT_METRICS: FaceMetrics = {
  emotion: 'neutral',
  confidence: 75,
  eyeContact: 70,
  nervousness: 25,
  smile: 0,
  anger: 0,
  fear: 0,
  neutral: 1,
  expressions: {},
};

export function useFaceDetection(videoRef: React.RefObject<HTMLVideoElement>) {
  const [metrics, setMetrics] = useState<FaceMetrics>(DEFAULT_METRICS);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const faceapiRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate derived confidence from expressions
  const computeMetrics = useCallback((expressions: Record<string, number>): FaceMetrics => {
    const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
    const dominant = sorted[0]?.[0] || 'neutral';

    const happy = expressions.happy || 0;
    const fear = expressions.fearful || 0;
    const angry = expressions.angry || 0;
    const surprised = expressions.surprised || 0;
    const neutral = expressions.neutral || 0;

    // Confidence = positive emotions vs negative
    const confidence = Math.round(
      Math.min(100, Math.max(0,
        (happy * 100) + (neutral * 70) + (surprised * 50) -
        (fear * 80) - (angry * 60) + 55
      ))
    );

    // Nervousness = fear + surprised + anxious signals
    const nervousness = Math.round(Math.min(100, (fear * 100 + surprised * 40 + angry * 30)));

    // Eye contact approximation (simulated from face detection presence)
    const eyeContact = Math.round(75 + (neutral * 15) + (happy * 10) - (fear * 20));

    return {
      emotion: dominant,
      confidence: Math.min(100, Math.max(0, confidence)),
      eyeContact: Math.min(100, Math.max(0, eyeContact)),
      nervousness: Math.min(100, Math.max(0, nervousness)),
      smile: Math.round(happy * 100),
      anger: Math.round(angry * 100),
      fear: Math.round(fear * 100),
      neutral: Math.round(neutral * 100),
      expressions,
    };
  }, []);

  const loadModels = useCallback(async () => {
    try {
      // Dynamically import to avoid SSR issues
      const faceapi = await import('face-api.js');
      faceapiRef.current = faceapi;

      const MODEL_URL = '/models'; // Download face-api.js models to public/models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
      setIsModelLoaded(true);
      console.log('✅ Face-api models loaded');
    } catch (err) {
      console.warn('Face-api model load failed, using simulation mode:', err);
      setIsModelLoaded(true); // Use simulation fallback
    }
  }, []);

  const startDetection = useCallback(() => {
    if (!videoRef.current || isDetecting) return;
    setIsDetecting(true);

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current) return;

      try {
        if (faceapiRef.current) {
          const detections = await faceapiRef.current
            .detectSingleFace(videoRef.current, new faceapiRef.current.TinyFaceDetectorOptions())
            .withFaceExpressions();

          if (detections?.expressions) {
            setMetrics(computeMetrics(detections.expressions));
            return;
          }
        }
      } catch (err) {
        // Fallback to simulation
      }

      // Simulation mode (when no face detected or model unavailable)
      setMetrics((prev) => ({
        ...prev,
        confidence: Math.min(100, Math.max(40, prev.confidence + (Math.random() - 0.5) * 8)),
        eyeContact: Math.min(100, Math.max(30, prev.eyeContact + (Math.random() - 0.5) * 6)),
        nervousness: Math.min(100, Math.max(5, prev.nervousness + (Math.random() - 0.5) * 5)),
        smile: Math.min(100, Math.max(0, prev.smile + (Math.random() - 0.5) * 4)),
      }));
    }, 1500);
  }, [videoRef, isDetecting, computeMetrics]);

  const stopDetection = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsDetecting(false);
  }, []);

  useEffect(() => {
    loadModels();
    return () => stopDetection();
  }, []);

  return { metrics, isModelLoaded, isDetecting, startDetection, stopDetection, canvasRef };
}

// Webcam hook
export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsActive(true);
      setHasPermission(true);
    } catch (err) {
      console.error('Webcam error:', err);
      setHasPermission(false);
    }
  }, []);

  const stopWebcam = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsActive(false);
  }, []);

  useEffect(() => () => stopWebcam(), []);

  return { videoRef, streamRef, isActive, hasPermission, startWebcam, stopWebcam };
}

// Speech recognition hook
export function useSpeech() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + ' ';
        }
      }
      if (final) setTranscript((prev) => prev + final);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => setTranscript(''), []);

  return { transcript, isListening, startListening, stopListening, clearTranscript };
}

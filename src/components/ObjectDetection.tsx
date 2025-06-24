import React, { useRef, useEffect, useState } from 'react';
import { Camera, Play, Square, Loader, BarChart } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

interface Detection {
  class: string;
  score: number;
  bbox: [number, number, number, number];
}

const ObjectDetection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [model, setModel] = useState<tf.GraphModel | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Model configuration
  const modelUrl = 'https://raw.githubusercontent.com/shubham5027/YOLOv5-Fruits/main/model.json';
  const classNames = ['apple', 'banana', 'orange', 'mango', 'strawberry'];
  const threshold = 0.5;

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        tf.setBackend('webgl');
        const loadedModel = await tf.loadGraphModel(modelUrl);
        setModel(loadedModel);
        setIsModelLoading(false);
      } catch (err) {
        setError('Failed to load object detection model');
        setIsModelLoading(false);
      }
    };

    loadModel();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (err) {
      setError('Failed to access camera');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsDetecting(false);
  };

  const detect = async () => {
    if (!model || !videoRef.current || !canvasRef.current) return;

    const detectFrame = async () => {
      if (!isDetecting) return;

      try {
        // Convert video frame to tensor
        const videoFrame = tf.browser.fromPixels(videoRef.current);
        const resized = tf.image.resizeBilinear(videoFrame, [640, 640]);
        const expanded = resized.expandDims(0);
        const normalized = expanded.div(255);

        // Run detection
        const predictions = await model.executeAsync(normalized) as tf.Tensor[];
        const boxes = await predictions[0].array();
        const scores = await predictions[1].array();
        const classes = await predictions[2].array();

        // Clean up tensors
        tf.dispose([videoFrame, resized, expanded, normalized, ...predictions]);

        // Draw detections
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const newCounts: Record<string, number> = {};

        boxes[0].forEach((box: number[], i: number) => {
          if (scores[0][i] > threshold) {
            const className = classNames[classes[0][i]];
            newCounts[className] = (newCounts[className] || 0) + 1;

            // Draw bounding box
            const [y, x, height, width] = box;
            ctx.strokeStyle = '#16a34a';
            ctx.lineWidth = 2;
            ctx.strokeRect(
              x * ctx.canvas.width,
              y * ctx.canvas.height,
              width * ctx.canvas.width,
              height * ctx.canvas.height
            );

            // Draw label
            ctx.fillStyle = '#16a34a';
            ctx.font = '16px sans-serif';
            ctx.fillText(
              `${className} (${Math.round(scores[0][i] * 100)}%)`,
              x * ctx.canvas.width,
              y * ctx.canvas.height - 5
            );
          }
        });

        setCounts(newCounts);
      } catch (err) {
        console.error('Detection error:', err);
      }

      requestAnimationFrame(detectFrame);
    };

    setIsDetecting(true);
    detectFrame();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Camera className="h-8 w-8 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Object Detection</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Video Feed */}
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                width={640}
                height={640}
              />

              {isModelLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="text-center text-white">
                    <Loader className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Loading model...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {!stream ? (
                <button
                  onClick={startCamera}
                  disabled={isModelLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Camera className="h-5 w-5" />
                  Start Camera
                </button>
              ) : (
                <>
                  <button
                    onClick={detect}
                    disabled={isDetecting}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Play className="h-5 w-5" />
                    Start Detection
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Square className="h-5 w-5" />
                    Stop
                  </button>
                </>
              )}
            </div>

            {/* Detection Results */}
            {Object.keys(counts).length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-green-600" />
                  Detection Results
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(counts).map(([fruit, count]) => (
                    <div key={fruit} className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900 capitalize">
                        {fruit}
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectDetection;
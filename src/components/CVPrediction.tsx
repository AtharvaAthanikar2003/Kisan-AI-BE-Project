import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader, AlertCircle } from 'lucide-react';

const CVPrediction = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{ class: string; confidence: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Replace this URL with your Teachable Machine model URL
  const modelUrl = "https://teachablemachine.withgoogle.com/models/LnKEYWCug/"

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setPrediction(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setPrediction(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please drop an image file');
    }
  };

  const handlePredict = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    try {
      // Load the model
      const modelURL = modelUrl + "model.json";
      const metadataURL = modelUrl + "metadata.json";
      
      // Load the model using TensorFlow.js
      const model = await window.tmImage.load(modelURL, metadataURL);

      // Create an image element
      const img = new Image();
      img.src = selectedImage;
      await img.decode(); // Wait for the image to load

      // Make prediction
      const prediction = await model.predict(img);

      // Get the highest confidence prediction
      const maxPrediction = prediction.reduce((prev, current) => {
        return (prev.probability > current.probability) ? prev : current;
      });

      setPrediction({
        class: maxPrediction.className,
        confidence: maxPrediction.probability * 100
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Camera className="h-8 w-8 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Plant Disease Detection</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Drag and drop your image here, or click to browse</p>
            <p className="text-sm text-gray-500">Supports: JPG, PNG, WEBP</p>
          </div>

          {/* Preview and Results */}
          {selectedImage && (
            <div className="mt-8 space-y-6">
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={selectedImage}
                  alt="Selected plant"
                  className="object-contain w-full h-full"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                onClick={handlePredict}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5" />
                    <span>Detect Disease</span>
                  </>
                )}
              </button>

              {prediction && (
                <div className="p-6 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">Detection Results</h3>
                  <div className="space-y-2">
                    <p className="text-green-700">
                      <strong>Detected Disease:</strong> {prediction.class}
                    </p>
                    <p className="text-green-700">
                      <strong>Confidence:</strong> {prediction.confidence.toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVPrediction;
"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

interface QRScannerProps {
  onScan: (participantId: string, participantNumber: number) => void;
  onError: (error: string) => void;
  isScanning?: boolean;
}

export default function QRScanner({
  onScan,
  onError,
  isScanning = false,
}: QRScannerProps) {
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "qr-scanner-region";

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch((err) => console.error("Error stopping scanner:", err));
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setCameraError("");

      // Initialize scanner
      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;
      setScanner(html5QrCode);

      // Start scanning
      await html5QrCode.start(
        { facingMode: "environment" }, // Use back camera on mobile
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR code successfully scanned
          try {
            // Expected format: JSON with participantId and participantNumber
            const data = JSON.parse(decodedText);
            if (data.participantId && data.participantNumber) {
              onScan(data.participantId, data.participantNumber);
            } else {
              onError("Invalid QR code format");
            }
          } catch (err) {
            onError("Could not read QR code data");
          }
        },
        (errorMessage) => {
          // Scanning error (can be ignored for continuous scanning)
        }
      );

      setCameraActive(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      setCameraError(
        "Unable to access camera. Please ensure camera permissions are granted."
      );
      onError("Camera access denied or not available");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setCameraActive(false);
        scannerRef.current = null;
        setScanner(null);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Scanner Container */}
      <div className="relative bg-black rounded-2xl overflow-hidden">
        <div
          id={scannerId}
          className={`${cameraActive ? "" : "h-64 flex items-center justify-center"}`}
        />
        {!cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-[#bfc0c0] mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              <p className="text-[#bfc0c0]">Camera not active</p>
            </div>
          </div>
        )}
      </div>

      {/* Camera Error */}
      {cameraError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <p className="text-red-400 text-sm">{cameraError}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {!cameraActive ? (
          <Button
            fullWidth
            onClick={startScanning}
            disabled={isScanning}
          >
            {isScanning ? "Processing..." : "Start Camera"}
          </Button>
        ) : (
          <Button
            fullWidth
            variant="danger"
            onClick={stopScanning}
            disabled={isScanning}
          >
            Stop Camera
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
        <p className="text-sm text-blue-300">
          <strong>How to scan:</strong>
        </p>
        <ul className="text-sm text-blue-200 mt-2 space-y-1 ml-4">
          <li>• Point your camera at another participant&apos;s QR code</li>
          <li>• Hold steady until it scans automatically</li>
          <li>• The selection will be added instantly</li>
        </ul>
      </div>
    </div>
  );
}

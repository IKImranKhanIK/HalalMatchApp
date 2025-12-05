"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function RegistrationQRPage() {
  const [qrCode, setQrCode] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    try {
      setLoading(true);

      // Import QRCode dynamically (client-side only)
      const QRCode = (await import("qrcode")).default;

      // Get the registration URL
      const registrationUrl = `${window.location.origin}/register`;

      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(registrationUrl, {
        width: 800,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCode(qrDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = "halal-match-registration-qr.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Registration QR Code</h1>
        <p className="text-[#bfc0c0] mt-1">
          Display this QR code on a projector for participants to scan and register
        </p>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-[#bfc0c0]">
            <li>Display this QR code on a projector or large screen</li>
            <li>Participants scan the QR code with their phones</li>
            <li>The QR code opens the registration form</li>
            <li>They fill in their details (name, email, phone, gender)</li>
            <li>After registration, they receive a participant number</li>
            <li>They can then select other participants by their numbers</li>
          </ol>
        </CardContent>
      </Card>

      {/* QR Code Display */}
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-6">
            <div className="bg-white p-8 rounded-2xl inline-block mx-auto">
              {qrCode && (
                <img
                  src={qrCode}
                  alt="Registration QR Code"
                  className="w-full max-w-md mx-auto"
                />
              )}
            </div>

            <div>
              <p className="text-2xl font-bold text-[#ef8354] mb-2">
                Scan to Register
              </p>
              <p className="text-[#bfc0c0]">
                {typeof window !== "undefined" && `${window.location.origin}/register`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button onClick={handleDownload}>
                Download QR Code
              </Button>
              <Button variant="secondary" onClick={handlePrint}>
                Print QR Code
              </Button>
              <Button variant="secondary" onClick={generateQRCode}>
                Regenerate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Display for Projector */}
      <Card>
        <CardContent className="py-6">
          <div className="text-center">
            <p className="text-[#bfc0c0] mb-4">
              For projector display, click the button below to show QR code in fullscreen
            </p>
            <Button
              onClick={() => {
                const elem = document.getElementById("fullscreen-qr");
                if (elem) {
                  elem.requestFullscreen();
                }
              }}
            >
              Show in Fullscreen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden fullscreen container */}
      <div
        id="fullscreen-qr"
        className="hidden fixed inset-0 bg-white flex flex-col items-center justify-center p-8"
        style={{ display: "none" }}
      >
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-[#2d3142]">Halal Match</h1>
          <p className="text-3xl text-[#4f5d75]">Scan to Register</p>
          {qrCode && (
            <img
              src={qrCode}
              alt="Registration QR Code"
              className="w-full max-w-2xl mx-auto"
            />
          )}
          <p className="text-2xl text-[#4f5d75]">
            {typeof window !== "undefined" && window.location.origin}/register
          </p>
          <p className="text-xl text-[#bfc0c0]">
            Press ESC to exit fullscreen
          </p>
        </div>
      </div>
    </div>
  );
}

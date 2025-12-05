/**
 * QR Code Utilities
 * Handles generation and encoding of QR codes for participants
 */

import QRCode from 'qrcode';

/**
 * QR code data structure
 */
export interface ParticipantQRData {
  participantId: string;
  participantNumber: number;
  eventId?: string;
}

/**
 * Generate QR code as base64 data URL
 * @param data Participant data to encode
 * @param options QR code generation options
 * @returns Base64 data URL string
 */
export async function generateQRCode(
  data: ParticipantQRData,
  options?: {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }
): Promise<string> {
  const jsonData = JSON.stringify(data);

  const qrCodeDataUrl = await QRCode.toDataURL(jsonData, {
    width: options?.width || 300,
    margin: options?.margin || 2,
    errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  return qrCodeDataUrl;
}

/**
 * Generate QR code as SVG string
 * @param data Participant data to encode
 * @returns SVG string
 */
export async function generateQRCodeSVG(
  data: ParticipantQRData
): Promise<string> {
  const jsonData = JSON.stringify(data);

  const svg = await QRCode.toString(jsonData, {
    type: 'svg',
    errorCorrectionLevel: 'M',
  });

  return svg;
}

/**
 * Parse QR code data from scanned string
 * @param qrData Raw string from QR code scanner
 * @returns Parsed participant data or null if invalid
 */
export function parseQRCode(qrData: string): ParticipantQRData | null {
  try {
    const parsed = JSON.parse(qrData);

    // Validate required fields
    if (
      !parsed.participantId ||
      typeof parsed.participantId !== 'string' ||
      !parsed.participantNumber ||
      typeof parsed.participantNumber !== 'number'
    ) {
      return null;
    }

    return {
      participantId: parsed.participantId,
      participantNumber: parsed.participantNumber,
      eventId: parsed.eventId || undefined,
    };
  } catch (error) {
    console.error('Failed to parse QR code data:', error);
    return null;
  }
}

/**
 * Validate QR code data structure
 * @param data Data to validate
 * @returns True if valid
 */
export function isValidQRData(data: unknown): data is ParticipantQRData {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.participantId === 'string' &&
    obj.participantId.length > 0 &&
    typeof obj.participantNumber === 'number' &&
    obj.participantNumber > 0
  );
}

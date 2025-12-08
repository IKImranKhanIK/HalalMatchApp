'use client';

/**
 * Global error page that renders independently of the root layout
 * This prevents SessionProvider context errors during static generation
 */

// Force dynamic rendering to prevent SSG issues with SessionProvider
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
          <h2>Something went wrong!</h2>
          <p>{error.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

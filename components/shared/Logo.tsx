/**
 * Logo Component
 * Professional Islamic-themed branding for Halal Match
 */

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export default function Logo({ size = 'md', showTagline = true, className = '' }: LogoProps) {
  const sizes = {
    sm: {
      title: 'text-xl',
      tagline: 'text-xs',
      icon: 'text-2xl',
    },
    md: {
      title: 'text-3xl',
      tagline: 'text-sm',
      icon: 'text-4xl',
    },
    lg: {
      title: 'text-5xl',
      tagline: 'text-base',
      icon: 'text-6xl',
    },
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Crescent Moon Icon */}
      <div className={`${sizes[size].icon} text-[#ef8354] inline-block`} style={{ transform: 'rotate(-30deg)' }}>
        ☪
      </div>

      {/* Text Content */}
      <div className="flex flex-col">
        <h1 className={`${sizes[size].title} font-bold tracking-tight`}>
          <span className="text-white">Halal </span>
          <span className="text-[#ef8354]">Match</span>
        </h1>
        {showTagline && (
          <p className={`${sizes[size].tagline} text-[#bfc0c0] font-light tracking-wide`}>
            By Bidita Paprie
          </p>
        )}
      </div>
    </div>
  );
}

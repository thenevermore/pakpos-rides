import Image from 'next/image';

interface LogoImageProps {
  src: string | null;
  alt: string;
  fallbackText: string;
  size?: number;
  className?: string;
  bgColor?: string;
}

export default function LogoImage({ src, alt, fallbackText, size = 48, className = '', bgColor = 'bg-gradient-to-br from-slate-600 to-slate-800' }: LogoImageProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={`object-contain ${className}`}
        unoptimized
      />
    );
  }

  // Styled text badge fallback
  const fontSize = size <= 32 ? 'text-xs' : size <= 48 ? 'text-sm' : 'text-base';
  const initials = fallbackText
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`${bgColor} rounded-xl flex items-center justify-center font-bold text-white shadow-md ${fontSize} ${className}`}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

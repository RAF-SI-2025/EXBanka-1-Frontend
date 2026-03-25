import type { CardBrand } from '@/types/card'

interface CardBrandLogoProps {
  brand: CardBrand
  className?: string
}

function VisaLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 780 500" className={className} role="img">
      <title>Visa</title>
      <path
        d="M293.2 348.7l33.4-195.8h53.4l-33.4 195.8zM540.7 159c-10.6-4-27.2-8.3-47.9-8.3-52.8 0-90 26.5-90.2 64.5-.3 28.1 26.5 43.7 46.7 53.1 20.8 9.6 27.8 15.7 27.7 24.3-.1 13.1-16.6 19.1-31.9 19.1-21.4 0-32.7-3-50.3-10.2l-6.9-3.1-7.5 43.8c12.5 5.5 35.6 10.2 59.6 10.4 56.2 0 92.7-26.2 93-66.9.2-22.3-14.1-39.3-45-53.3-18.7-9.1-30.2-15.1-30.1-24.3 0-8.1 9.7-16.8 30.7-16.8 17.5-.3 30.2 3.5 40.1 7.5l4.8 2.3 7.2-42.1z"
        fill="white"
      />
      <path
        d="M631.2 152.8h-41.3c-12.8 0-22.4 3.5-28 16.2l-79.4 179.7h56.1l11.2-29.3h68.6l6.5 29.3h49.5l-43.1-195.9zm-57.6 126.2c4.4-11.3 21.5-54.7 21.5-54.7-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47.2 12.5 57.1h-44.7v-.6z"
        fill="white"
      />
      <path
        d="M232.8 152.8l-52.3 133.5-5.6-27.1c-9.7-31.2-39.9-65.1-73.7-82l47.8 171.6 56.5-.1 84.1-195.9h-56.8z"
        fill="white"
      />
    </svg>
  )
}

function MastercardLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 780 500" className={className} role="img">
      <title>Mastercard</title>
      <circle cx="310" cy="250" r="140" fill="#EB001B" opacity="0.8" />
      <circle cx="470" cy="250" r="140" fill="#F79E1B" opacity="0.8" />
    </svg>
  )
}

function DinaCardLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 780 500" className={className} role="img">
      <title>DinaCard</title>
      <rect
        x="100"
        y="120"
        width="580"
        height="260"
        rx="30"
        fill="none"
        stroke="white"
        strokeWidth="8"
      />
      <text
        x="390"
        y="270"
        textAnchor="middle"
        fill="white"
        fontSize="100"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        DinaCard
      </text>
    </svg>
  )
}

function AmexLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 780 500" className={className} role="img">
      <title>American Express</title>
      <rect
        x="50"
        y="100"
        width="680"
        height="300"
        rx="20"
        fill="none"
        stroke="white"
        strokeWidth="6"
      />
      <text
        x="390"
        y="240"
        textAnchor="middle"
        fill="white"
        fontSize="72"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        AMERICAN
      </text>
      <text
        x="390"
        y="320"
        textAnchor="middle"
        fill="white"
        fontSize="72"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        EXPRESS
      </text>
    </svg>
  )
}

export function CardBrandLogo({ brand, className = 'h-10 w-auto' }: CardBrandLogoProps) {
  switch (brand) {
    case 'VISA':
      return <VisaLogo className={className} />
    case 'MASTERCARD':
      return <MastercardLogo className={className} />
    case 'DINACARD':
      return <DinaCardLogo className={className} />
    case 'AMEX':
      return <AmexLogo className={className} />
    default:
      return <span className="text-white text-sm font-bold">{brand}</span>
  }
}

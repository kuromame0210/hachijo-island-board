import { Card } from '@/components/ui/card'

interface AdBannerProps {
  size: 'large' | 'medium' | 'small'
  type?: 'banner' | 'sidebar' | 'footer'
  className?: string
}

const adData = {
  large: {
    width: 'w-full',
    height: 'h-32',
    text: '広告枠 (Large Banner)',
    subtitle: '728×90 サイズ対応',
    color: 'bg-gray-100'
  },
  medium: {
    width: 'w-full',
    height: 'h-24',
    text: '広告枠 (Medium Banner)',
    subtitle: '468×60 サイズ対応',
    color: 'bg-gray-100'
  },
  small: {
    width: 'w-full',
    height: 'h-16',
    text: '広告枠 (Small Banner)',
    subtitle: '320×50 サイズ対応',
    color: 'bg-gray-100'
  }
}

export default function AdBanner({ size, type = 'banner', className = '' }: AdBannerProps) {
  const ad = adData[size]

  return (
    <Card className={`${ad.width} ${ad.height} ${ad.color} border-dashed border-gray-400 flex items-center justify-center ${className} hover:shadow-md transition-shadow duration-200`}>
      <div className="text-center px-4">
        <p className="font-semibold text-gray-600 text-sm md:text-base">
          📢 {ad.text}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {ad.subtitle}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          [{type}]
        </p>
      </div>
    </Card>
  )
}
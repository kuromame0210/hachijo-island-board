import { Card } from '@/components/ui/card'

interface PortalLink {
  id: string
  title: string
  description: string
  url: string
  icon: string
  color: string
}

const portalLinks: PortalLink[] = [
  {
    id: 'hachijo-infra',
    title: '八丈島情報まとめ',
    description: '島内のインフラ・交通・生活情報',
    url: 'https://infra8jo.shuuutaf.workers.dev/',
    icon: '🏗️',
    color: 'bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200'
  },
  {
    id: 'hachijo-saigai',
    title: '八丈島災害ボランティアセンター',
    description: 'あすなろ支援センター・災害ボランティア情報',
    url: 'https://www.8jo-saigai.com/',
    icon: '🚨',
    color: 'bg-gradient-to-r from-red-100 to-orange-100 hover:from-red-200 hover:to-orange-200'
  }
]

interface InfoPortalLinksProps {
  className?: string
}

export default function InfoPortalLinks({ className = '' }: InfoPortalLinksProps) {
  const handleClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={`${className}`}>
      {/* 全デバイスで横並びのコンパクト表示 */}
      <div className="grid grid-cols-2 gap-2 max-w-lg">
        {portalLinks.map((link) => (
          <Card
            key={link.id}
            className={`${link.color} border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] hover:border-gray-300`}
            onClick={() => handleClick(link.url)}
          >
            <div className="p-2 text-center">
              <h4 className="font-semibold text-gray-800 text-sm mb-1 leading-tight">
                {link.title}
              </h4>
              <p className="text-xs text-gray-600 leading-tight mb-1">
                {link.description}
              </p>
              <div className="text-xs text-blue-600">
                クリックで開く →
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
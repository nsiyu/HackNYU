import { useState } from 'react'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid'

interface CryptoPrice {
  symbol: string
  name: string
  price: number
  change24h: number
  volume: string
}

export function MarketTicker() {
  const [prices, _] = useState<CryptoPrice[]>([
    { symbol: 'BTC', name: 'Bitcoin', price: 65432.10, change24h: 2.5, volume: '24.5B' },
    { symbol: 'ETH', name: 'Ethereum', price: 3211.45, change24h: -1.2, volume: '12.8B' },
    { symbol: 'BNB', name: 'BNB', price: 432.78, change24h: 0.8, volume: '5.6B' },
    { symbol: 'SOL', name: 'Solana', price: 123.45, change24h: 5.6, volume: '4.2B' },
    { symbol: 'XRP', name: 'Ripple', price: 0.5678, change24h: -0.7, volume: '3.1B' },
    { symbol: 'XRP', name: 'Ripple', price: 0.5678, change24h: -0.7, volume: '3.1B' },
  ])

  return (
    <div className="w-full overflow-hidden bg-secondary/30 backdrop-blur-sm rounded-2xl mt-16">
      <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-light">
        <h3 className="font-display font-bold">Live Markets</h3>
        <button className="text-sm text-primary hover:text-primary-light transition-colors">
          View All Markets
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {prices.map((crypto) => (
          <div 
            key={crypto.symbol}
            className="flex items-center justify-between p-4 rounded-xl bg-secondary-light/10 hover:bg-secondary-light/20 transition-colors"
          >
            <div>
              <div className="font-medium mb-1">{crypto.name}</div>
              <div className="text-sm text-gray-400">{crypto.symbol}/USD</div>
            </div>
            <div className="text-right">
              <div className="font-medium mb-1">${crypto.price.toLocaleString()}</div>
              <div className={`text-sm flex items-center gap-1 ${crypto.change24h >= 0 ? 'text-accent' : 'text-accent-red'}`}>
                {crypto.change24h >= 0 ? (
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4" />
                )}
                {Math.abs(crypto.change24h)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
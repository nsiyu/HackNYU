import { useState } from 'react'
import { 
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import amazonLogo from '../assets/amazon.png'
import doordashLogo from '../assets/doordash.png'

interface Transaction {
  id: string
  type: 'Swap' | 'Bill Payment' | 'Received' | 'Shopping' | 'Food' | 'Transfer'
  amount?: string
  currency?: string
  date: string
  status: 'completed' | 'pending' | 'failed'
  recipient?: string
  sender?: string
  from?: { amount: string; currency: string }
  to?: { amount: string; currency: string }
  category?: string
  description?: string
  logo?: string
}

const transactionIcons = {
  Swap: ArrowsRightLeftIcon,
  'Bill Payment': CreditCardIcon,
  Received: ArrowDownIcon,
  Shopping: ShoppingBagIcon,
  Food: ShoppingBagIcon,
  Transfer: ArrowUpIcon,
}

const transactionColors = {
  Shopping: 'from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20',
  Food: 'from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20',
  Transfer: 'from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20',
  Swap: 'from-violet-500/10 to-purple-500/10 hover:from-violet-500/20 hover:to-purple-500/20',
  'Bill Payment': 'from-rose-500/10 to-pink-500/10 hover:from-rose-500/20 hover:to-pink-500/20',
  Received: 'from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20'
}

const statusColors = {
  completed: 'bg-emerald-500/10 text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-400',
  failed: 'bg-red-500/10 text-red-400'
}

const sampleTransactions: Transaction[] = [
  {
    id: '1',
    type: 'Shopping',
    amount: '299.99',
    currency: 'USD',
    date: '2024-03-15',
    status: 'completed',
    recipient: 'Amazon',
    category: 'Electronics',
    description: 'New headphones',
    logo: amazonLogo
  },
  {
    id: '2',
    type: 'Food',
    amount: '25.50',
    currency: 'USD',
    date: '2024-03-15',
    status: 'completed',
    recipient: 'DoorDash',
    category: 'Food & Dining',
    description: 'Lunch delivery',
    logo: doordashLogo
  },
  {
    id: '3',
    type: 'Transfer',
    amount: '1,000',
    currency: 'USD',
    date: '2024-03-14',
    status: 'completed',
    recipient: 'John Smith',
    description: 'Rent payment'
  },
  {
    id: '4',
    type: 'Swap',
    from: { amount: '10,000', currency: 'KES' },
    to: { amount: '0.002', currency: 'ETH' },
    date: '2024-03-14',
    status: 'completed',
    description: 'Crypto purchase'
  }
]

export function TransactionHistory() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const categories = Array.from(
    new Set(sampleTransactions.map(tx => tx.category).filter(Boolean))
  )

  const filteredTransactions = sampleTransactions.filter(tx => {
    const matchesSearch = 
      tx.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (selectedCategory) {
      return matchesSearch && tx.category === selectedCategory
    }
    return matchesSearch
  })

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Transaction History</h1>
          <p className="text-gray-400">View and manage your transaction history</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="p-2 hover:bg-secondary-light/50 rounded-lg transition-colors"
        >
          <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions"
            className="w-full bg-secondary/50 border border-secondary-light rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary outline-none"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
        
        <div className="flex gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(
                selectedCategory === category && category ? null : category || null
              )}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-secondary/50 text-gray-400 hover:text-white hover:bg-secondary-light/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-4 min-h-0 overflow-y-auto">
        {filteredTransactions.map((transaction) => {
          const Icon = transactionIcons[transaction.type]
          
          return (
            <div
              key={transaction.id}
              className={`rounded-xl bg-gradient-to-br border border-secondary-light overflow-hidden hover:border-secondary transition-all ${
                transactionColors[transaction.type]
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                      {transaction.logo ? (
                        <img 
                          src={transaction.logo} 
                          alt={transaction.recipient} 
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-1">
                        {transaction.type}
                        {transaction.recipient && ` • ${transaction.recipient}`}
                      </h3>
                      <div className="text-sm text-gray-400">{transaction.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {transaction.from ? (
                      <div className="font-medium">
                        {transaction.from.amount} {transaction.from.currency} →{' '}
                        {transaction.to?.amount} {transaction.to?.currency}
                      </div>
                    ) : (
                      <div className="font-medium">
                        {transaction.currency} {transaction.amount}
                      </div>
                    )}
                    <div className={`mt-1 px-3 py-1 rounded-full text-sm inline-flex items-center gap-1 ${
                      statusColors[transaction.status]
                    }`}>
                      <ShieldCheckIcon className="w-4 h-4" />
                      {transaction.status}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <div>{transaction.date}</div>
                  {transaction.category && (
                    <>
                      <div>•</div>
                      <div>{transaction.category}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 
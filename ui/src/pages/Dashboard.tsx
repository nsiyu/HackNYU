import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  UserCircleIcon,
  BellIcon,
  PhoneIcon,
  WalletIcon,
  Cog6ToothIcon,
  HomeIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  ChatBubbleLeftRightIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline'
import { TranscriptsPage } from '../components/TranscriptsPage'
import { TransactionHistory } from '../components/TransactionHistory'
import { Home } from '../components/Home'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Home')
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const menuItems = [
    {
      type: 'main',
      items: [
        { name: 'Home', icon: HomeIcon, current: true },
        { name: 'Transcripts',icon: WalletIcon, current: false },
        { name: 'Transaction History', icon: DocumentTextIcon, current: false },
      ]
    }
  ]

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-[#0B0E11] text-white">
      <div className="w-72 border-r border-secondary-light/50 bg-gradient-to-b from-[#0B0E11] to-[#0D1117] backdrop-blur-sm overflow-hidden">
        <div className="p-8">
          <div className="mb-3">
            <Link to="/" className="font-display text-2xl font-bold bg-gradient-to-r from-primary via-primary/70 to-primary-light text-transparent bg-clip-text hover:from-primary hover:via-primary-light hover:to-primary-light/80 transition-all">
              Radio
            </Link>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary-light/10 border border-secondary-light/30 w-fit">
            <PhoneIcon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary/90 to-primary-light text-transparent bg-clip-text">
              1-800-Radio
            </span>
          </div>
        </div>
        
        <nav className="px-4 flex flex-col h-[calc(100%-8rem)] pt-4">
          <div className="space-y-2">
            {menuItems[0].items.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] font-medium transition-all relative group ${
                  activeTab === item.name
                    ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/20' 
                    : 'text-gray-200 hover:bg-secondary-light/20 hover:text-white'
                }`}
              >
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity ${
                  activeTab === item.name ? 'opacity-100' : ''
                }`} />
                <item.icon className={`w-6 h-6 relative z-10 transition-transform group-hover:scale-110 ${
                  activeTab === item.name ? 'transform scale-110' : ''
                }`} />
                <span className="relative z-10">{item.name}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-8 left-0 right-0 px-4">
          <div className="p-4 mx-4 rounded-xl bg-secondary-light/10 border border-secondary-light/20 mb-4">
            <div className="text-sm font-medium mb-1">Need Help?</div>
            <div className="text-xs text-gray-400">Ask our AI assistant</div>
          </div>
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] font-medium text-gray-200 hover:bg-secondary-light/20 hover:text-white transition-all group">
            <EllipsisHorizontalIcon className="w-6 h-6 transition-transform group-hover:rotate-180" />
            More
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-secondary-light bg-[#0B0E11] backdrop-blur-sm relative z-50">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="w-96">
              <h1 className="text-xl font-medium">{activeTab}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-secondary-light/50 rounded-lg transition-colors">
                <BellIcon className="w-6 h-6" />
              </button>
              <button className="p-2 hover:bg-secondary-light/50 rounded-lg transition-colors">
                <Cog6ToothIcon className="w-6 h-6" />
              </button>
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="h-8 w-8 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors"
                >
                  <UserCircleIcon className="w-5 h-5" />
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-secondary border border-secondary-light shadow-lg py-1">
                    <div className="px-4 py-3 border-b border-secondary-light">
                      <div className="font-medium">John Doe</div>
                      <div className="text-sm text-gray-400">john@example.com</div>
                    </div>
                    
                    <button 
                      onClick={() => navigate('/settings')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-secondary-light/50 transition-colors"
                    >
                      Settings
                    </button>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-secondary-light/50 transition-colors"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 relative overflow-hidden flex">
          <div className="flex-1 overflow-auto scrollbar-hide">
            <div className="p-6">
              <div className="w-full">
                {activeTab === 'Home' && <Home />}
                {activeTab === 'Transcripts' && <TranscriptsPage />}
                {activeTab === 'Transaction History' && <TransactionHistory />}
              </div>
            </div>
          </div>

          <div className="w-96 border-l border-secondary-light/50 bg-secondary/10 flex flex-col">
            <div className="p-4 border-b border-secondary-light/50">
              <h2 className="text-lg font-medium">Radio Agent</h2>
            </div>
            <div className="flex-1 overflow-auto scrollbar-hide p-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-secondary/30 border border-secondary-light">
                    <p className="text-sm">Hello! How can I help you today?</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-secondary-light/50">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="w-full px-4 py-2 rounded-lg bg-secondary/30 border border-secondary-light focus:border-primary outline-none"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-primary-light transition-colors">
                  <MicrophoneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { 
  MagnifyingGlassIcon, 
  ShieldCheckIcon,
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'

interface Transcript {
  id: string
  date: string
  duration: string
  topic: string
  status: 'completed' | 'in-progress'
  transcript: string[]
  agentName?: string
  agentAvatar?: string
}

const sampleTranscripts: Transcript[] = [
  {
    id: '1',
    date: '2024-03-15 14:30',
    duration: '5m 23s',
    topic: 'Account Verification',
    status: 'completed',
    agentName: 'Sarah Johnson',
    transcript: [
      'AI: Hello! How can I help you today?',
      'You: I need help verifying my account',
      'AI: I can help you with that. First, could you confirm your email address?',
      'You: Sure, it\'s john@example.com',
      'AI: Thank you. I can see your account. Let\'s proceed with verification...'
    ]
  },
  {
    id: '2',
    date: '2024-03-14 10:15',
    duration: '3m 45s',
    topic: 'Transaction Issue',
    status: 'completed',
    agentName: 'Michael Chen',
    transcript: [
      'AI: Welcome to Zeri support. How may I assist you?',
      'You: I have a pending transaction that hasn\'t cleared',
      'AI: I\'ll help you check that. Can you provide the transaction ID?'
    ]
  },
  {
    id: '3',
    date: '2024-03-13 16:45',
    duration: '8m 12s',
    topic: 'Wallet Setup',
    status: 'in-progress',
    agentName: 'Emma Wilson',
    transcript: [
      'AI: Hi there! What can I help you with today?',
      'You: I\'m trying to set up my wallet but getting an error',
      'AI: I understand. Let\'s troubleshoot this together. What error message are you seeing?'
    ]
  }
]

export function TranscriptsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null)

  const filteredTranscripts = sampleTranscripts.filter(transcript => 
    transcript.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transcript.agentName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">Support Transcripts</h2>
        <button 
          className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
        >
          <ChatBubbleLeftRightIcon className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search transcripts..."
          className="w-full bg-secondary/50 border border-secondary-light rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary outline-none"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {filteredTranscripts.map((transcript) => (
          <div
            key={transcript.id}
            className="rounded-xl border border-secondary-light bg-secondary/10 hover:bg-secondary-light/10 transition-all overflow-hidden cursor-pointer"
            onClick={() => setSelectedTranscript(
              selectedTranscript?.id === transcript.id ? null : transcript
            )}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {transcript.agentAvatar ? (
                      <img 
                        src={transcript.agentAvatar} 
                        alt={transcript.agentName} 
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <UserCircleIcon className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{transcript.topic}</h3>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                  transcript.status === 'completed' 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'bg-amber-500/10 text-amber-400'
                }`}>
                  <ShieldCheckIcon className="w-4 h-4" />
                  {transcript.status}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  {transcript.date}
                </div>
                <div>•</div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {transcript.duration}
                </div>
              </div>

              {selectedTranscript?.id === transcript.id && (
                <div className="mt-6 space-y-3 bg-secondary/20 rounded-lg p-4">
                  {transcript.transcript.map((message, index) => {
                    const [speaker, text] = message.split(': ')
                    const isAI = speaker === 'AI'
                    return (
                      <div 
                        key={index} 
                        className={`flex gap-3 ${
                          isAI ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          isAI 
                            ? 'bg-secondary/30' 
                            : 'bg-primary/20'
                        }`}>
                          <div className="text-xs font-medium mb-1 text-gray-400">
                            {isAI ? transcript.agentName : 'You'}
                          </div>
                          <div className="text-sm">{text}</div>
                        </div>
                      </div>
                    )}
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
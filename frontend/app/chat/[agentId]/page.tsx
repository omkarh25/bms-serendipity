import { SignedIn } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { Agent } from '../../types/chat'
import ChatInterface from '../../components/ChatInterface'

/**
 * Available agents in the system
 */
const agents: Record<string, Agent> = {
  accountant: {
    id: 'accountant',
    name: 'Business Accountant',
    description: 'Expert in financial management, bookkeeping, and tax regulations',
    icon: '💼',
    backgroundColor: 'bg-blue-100'
  },
  marketing: {
    id: 'marketing',
    name: 'Content Creator',
    description: 'Specialist in marketing content, social media, and campaigns',
    icon: '📢',
    backgroundColor: 'bg-green-100'
  },
  tech: {
    id: 'tech',
    name: 'Tech Support',
    description: 'Technical expert for IT infrastructure and system optimization',
    icon: '🔧',
    backgroundColor: 'bg-purple-100'
  }
}

/**
 * Chat interface component for individual agents
 */
export default function AgentChatPage({ params }: { params: { agentId: string } }) {
  const agent = agents[params.agentId]

  if (!agent) {
    redirect('/chat')
  }

  return (
    <SignedIn>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Agent Header */}
        <div className={`${agent.backgroundColor} p-6 rounded-t-xl flex items-center gap-4`}>
          <div className="text-4xl">{agent.icon}</div>
          <div>
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <p className="text-gray-600">{agent.description}</p>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-b-xl shadow-lg">
          <ChatInterface agentId={agent.id} />
        </div>
      </div>
    </SignedIn>
  )
}

import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { Agent } from '../types/chat'

/**
 * Available agents in the system
 */
const agents: Agent[] = [
  {
    id: 'accountant',
    name: 'Business Accountant',
    description: 'Expert in financial management, bookkeeping, and tax regulations',
    icon: '💼',
    backgroundColor: 'bg-blue-100'
  },
  {
    id: 'marketing',
    name: 'Content Creator',
    description: 'Specialist in marketing content, social media, and campaigns',
    icon: '📢',
    backgroundColor: 'bg-green-100'
  },
  {
    id: 'tech',
    name: 'Tech Support',
    description: 'Technical expert for IT infrastructure and system optimization',
    icon: '🔧',
    backgroundColor: 'bg-purple-100'
  }
]

/**
 * Agent selection card component
 */
const AgentCard = ({ agent }: { agent: Agent }) => (
  <a 
    href={`/chat/${agent.id}`}
    className={`${agent.backgroundColor} p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer`}
  >
    <div className="text-4xl mb-4">{agent.icon}</div>
    <h3 className="text-xl font-semibold mb-2">{agent.name}</h3>
    <p className="text-gray-600">{agent.description}</p>
  </a>
)

/**
 * Chat page component with agent selection
 */
export default async function ChatPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Select Your Assistant</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  )
}

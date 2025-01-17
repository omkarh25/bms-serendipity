import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import Link from 'next/link'

/**
 * Service card component for displaying individual business services
 */
const ServiceCard = ({ 
  title, 
  description, 
  icon 
}: { 
  title: string
  description: string
  icon: string 
}) => (
  <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1 transition-transform duration-300">
    <div className="text-5xl mb-6">{icon}</div>
    <h3 className="text-xl font-semibold mb-3 text-gray-800">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
)

/**
 * Feature card component for platform benefits
 */
const FeatureCard = ({
  title,
  description
}: {
  title: string
  description: string
}) => (
  <div className="text-center p-6">
    <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
)

/**
 * Landing page component showcasing business management services
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Your Complete Business Solution
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Every business needs accounting, marketing, and tech support to grow. 
            We provide all these services through our intelligent chat assistants.
          </p>
          <div className="flex justify-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-transform duration-300">
                  Get Started
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link 
                href="/chat" 
                className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-transform duration-300 inline-block"
              >
                Open Chat
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            <ServiceCard
              title="Chat with Accountant"
              description="Get expert financial advice, manage your books, and stay compliant with tax regulations."
              icon="💼"
            />
            <ServiceCard
              title="Content Creation Assistant"
              description="Create engaging marketing content, social media posts, and email campaigns."
              icon="📢"
            />
            <ServiceCard
              title="Tech Support Chatbot"
              description="Resolve technical issues, get system recommendations, and optimize your IT infrastructure."
              icon="🔧"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-16 text-gray-800">Why Choose Our Platform?</h2>
          <div className="grid md:grid-cols-4 gap-12">
            <FeatureCard
              title="24/7 Availability"
              description="Get assistance anytime, anywhere"
            />
            <FeatureCard
              title="Expert Knowledge"
              description="Powered by advanced AI technology"
            />
            <FeatureCard
              title="Cost Effective"
              description="Save on hiring multiple experts"
            />
            <FeatureCard
              title="Instant Solutions"
              description="No waiting for appointments"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Business Management System',
  description: 'Your all-in-one business solution for accounting, marketing, and tech support',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
          footerActionLink: 'text-blue-600 hover:text-blue-700'
        }
      }}
      redirectUrl="/chat"
      afterSignOutUrl="/"
    >
      <html lang="en" className="h-full">
        <body className={`${inter.className} min-h-full bg-gray-50`}>
          <header className="fixed top-0 left-0 right-0 p-4 bg-white shadow-md z-50">
            <nav className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-600">BMS</h1>
              <div>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: 'w-10 h-10'
                      }
                    }}
                  />
                </SignedIn>
              </div>
            </nav>
          </header>
          <main className="pt-20 min-h-screen">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}

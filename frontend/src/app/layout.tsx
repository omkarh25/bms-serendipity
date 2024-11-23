import './globals.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Sidebar } from '@/components/Sidebar'
import { Toaster } from 'react-hot-toast'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 bg-gray-50">
            <Toaster position="top-right" />
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

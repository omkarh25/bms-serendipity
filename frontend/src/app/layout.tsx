import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <span className="text-2xl font-bold text-blue-600">BMS</span>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <a href="/" className="nav-link-active">
                      Home
                    </a>
                    <a href="/model" className="nav-link">
                      Model
                    </a>
                    <a href="/view" className="nav-link">
                      View
                    </a>
                    <a href="/controller" className="nav-link">
                      Controller
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <main className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
          <footer className="bg-white mt-auto">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
              <div className="mt-8 md:mt-0">
                <p className="text-center text-sm text-gray-500">
                  © BMS - Business Management System. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

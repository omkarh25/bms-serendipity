Install @clerk/nextjs
Run the following command to install the SDK:

npm install @clerk/nextjs

Set your environment variables
Add these keys to your .env.local or create the file if it doesn't exist. Retrieve these keys anytime from the API keys page.

.env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c3dlZXBpbmctbXVkZmlzaC00MS5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_wXLVg2mlQegk1VsDM0BPNRc5aqGhLhQPrXKHgU6oVP

Update middleware.ts

Update your middleware file or create one at the root of your project or src/ directory if you're using a src/ directory structure.

The clerkMiddleware helper enables authentication and is where you'll configure your protected routes.

middleware.ts

import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

Add ClerkProvider to your app

The ClerkProvidercomponent provides session and user context to Clerk's hooks and components. It's recommended to wrap your entire app at the entry point with ClerkProvider to make authentication globally accessible. See the reference docs for other configuration options.

You can control which content signed-in and signed-out users can see with Clerk's prebuilt components.

app/layout.tsx

import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import './globals.css'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}

Create your first user
Run your project. Then, visit your app's homepage at http://localhost:3000 and sign up to create your first user.

npm run dev
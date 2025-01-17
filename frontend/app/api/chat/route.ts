import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/**
 * API route handler for chat messages
 */
export async function POST(request: Request) {
  try {
    const authData = await auth()
    
    if (!authData?.userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { message, agentId } = body

    if (!message || !agentId) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Call FastAPI backend
    const response = await fetch('http://127.0.0.1:8000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        agent_id: agentId,
        user_id: authData.userId,
      }),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error('Failed to get response from backend')
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('[CHAT_ERROR]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

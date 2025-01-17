'use client'

interface UsageStatsProps {
  requestTokens: number
  responseTokens: number
  totalTokens: number
}

/**
 * Component to display API usage statistics
 */
export default function UsageStats({ requestTokens, responseTokens, totalTokens }: UsageStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
      <div>
        <div className="font-medium">Request Tokens</div>
        <div className="text-lg text-blue-600">{requestTokens}</div>
      </div>
      <div>
        <div className="font-medium">Response Tokens</div>
        <div className="text-lg text-green-600">{responseTokens}</div>
      </div>
      <div>
        <div className="font-medium">Total Tokens</div>
        <div className="text-lg text-purple-600">{totalTokens}</div>
      </div>
    </div>
  )
}

/**
 * Interface for tweet generation response
 */
export interface TweetResponse {
  tweet: string;  // JSON string containing array of tweets
  chain_of_thought: string;  // JSON string containing array of thought steps
  references: string[];  // Array of reference URLs
  metadata: {
    project: string;
    emotion: string;
    topic: string;
    timestamp: string;
  };
}

import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "redis";

// Create and configure the Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL,
});
redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  if (!redisClient.isReady) {
    await redisClient.connect();
  }
})();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { sessionId, results } = req.body;

  if (!sessionId) {
    return res
      .status(400)
      .json({ message: "Missing browser session identifier" });
  }

  const cacheKey = `exam:${sessionId}`;
  try {
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(results));
    return res.status(200).json(cacheKey);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

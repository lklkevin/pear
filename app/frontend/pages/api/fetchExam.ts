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

  const { cacheKey } = req.body;

  if (!cacheKey) {
    return res.status(400).json({ message: "Missing Key" });
  }

  try {
    const cachedExam = await redisClient.get(cacheKey);
    if (cachedExam) {
      return res.status(200).json(JSON.parse(cachedExam));
    }
    return res.status(400).json({ message: "No exam found" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

import cron from "node-cron";
import { generateTweet } from "./lib/gemini.js";
import { postTweet, likeTweet, replyToTweet, rw } from "./lib/twitter.js";
import { fetchLatestTopics } from "./lib/sources.js";

async function runAgent() {
  try {
    // 1. Discover
    const topics = await fetchLatestTopics();
    console.log("Latest topics:", topics);
    const context = topics.join("\n");
    // 2. Create
    const tweetText = await generateTweet(context);
    // 3. Post
    const { data } = await postTweet(tweetText);
    console.log("Posted:", tweetText);

    // 4. Basic engagement: like every mention
    const mentions = await rw.v2.search("to:AgenticDev", { max_results: 10 });
    for await (const m of mentions) {
      await likeTweet(m.id);
      if (Math.random() < 0.3) {
        // 30 % chance to reply
        await replyToTweet(m.id, "🤖 Thanks for the mention!");
      }
    }
  } catch (e) {
    console.error(e);
  }
}

// every 85 min
runAgent();

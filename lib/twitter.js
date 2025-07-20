import { TwitterApi } from "twitter-api-v2";
import {
  TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_TOKEN_SECRET,
  TWITTER_API_KEY,
  TWITTER_API_SECRET,
} from "../constants/constant.js";

const client = new TwitterApi({
  appKey: TWITTER_API_KEY,
  appSecret: TWITTER_API_SECRET,
  accessToken: TWITTER_ACCESS_TOKEN,
  accessSecret: TWITTER_ACCESS_TOKEN_SECRET,
});

export const rw = client.readWrite;

export async function postTweet(text) {
  return rw.v2.tweet(text);
}

export async function likeTweet(id) {
  return rw.v2.like(process.env.TWITTER_USER_ID, id);
}

export async function replyToTweet(id, text) {
  return rw.v2.reply(text, id);
}

import axios from 'axios';
import { load } from 'cheerio';
import Parser from 'rss-parser';
const rss = new Parser();

import { SERPER_KEY } from '../constants/constant.js';

/** Fetch tech headlines from 10+ free sources in parallel */
export async function fetchLatestTopics() {
  const jobs = [
    devTo(),
    hackernews(),
    githubTrending(),
    lobsters(),
    arxiv(),
    serperSearch(),
  ];
  const results = await Promise.allSettled(jobs);
  const flat = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value);
  // remove duplicates
  return [...new Set(flat)];
}

/* ---------- 1. Dev.to (already had) ---------- */
async function devTo() {
  const { data } = await axios.get(
    'https://dev.to/api/articles?tag=webdev&top=1'
  );
  return data.map(a => `${a.title} ${a.url}`);
}

/* ---------- 2. Hacker News top 10 ---------- */
async function hackernews() {
  const { data } = await axios.get(
    'https://hacker-news.firebaseio.com/v0/topstories.json'
  );
  const top = data.slice(0, 10);
  const itemPromises = top.map(async id => {
    const { data: item } = await axios.get(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json`
    );
    return `${item.title} ${item.url || `https://news.ycombinator.com/item?id=${id}`}`;
  });
  return Promise.all(itemPromises);
}

/* ---------- 3. GitHub Trending (daily JS/TS repos) ---------- */
async function githubTrending() {
  const { data: html } = await axios.get(
    'https://github.com/trending/javascript?since=daily',
    { headers: { 'User-Agent': 'agenticdev-bot' } }
  );
  const $ = load(html);
  const repos = $('h2.h3 a')
    .slice(0, 8)
    .map((_, el) => `Trending repo: ${$(el).text().trim()} https://github.com${$(el).attr('href')}`)
    .get();
  return repos;
}

/* ---------- 4. Lobsters ---------- */
async function lobsters() {
  const feed = await rss.parseURL('https://lobste.rs/rss');
  return feed.items.slice(0, 8).map(i => `${i.title} ${i.link}`);
}

/* ---------- 5. arXiv AI papers (last 24 h) ---------- */
async function arxiv() {
  const { data } = await axios.get(
    'http://export.arxiv.org/rss/cs.AI'
  );
  const feed = await rss.parseString(data);
  return feed.items
    .slice(0, 5)
    .map(i => `New AI paper: ${i.title} ${i.link}`);
}

/* ---------- 6. Serper.dev Google results ---------- */
async function serperSearch() {
  if (!SERPER_KEY) return [];
  const { data } = await axios.post(
    'https://google.serper.dev/news',
    { q: 'webdev OR AI OR system design OR robotics recent', num: 5 },
    { headers: { 'X-API-KEY': SERPER_KEY } }
  );
  return data.news.map(n => `${n.title} ${n.link}`);
}
import express from 'express';
import fetch from 'node-fetch';
import xml2js from 'xml2js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const feeds = [
  'https://www3.nhk.or.jp/rss/news/cat0.xml',
  'https://news.yahoo.co.jp/rss/topics/top-picks.xml'
];

app.get('/news', async (req, res) => {
  try {
    let headlines = [];

    for (const url of feeds) {
      const response = await fetch(url);
      const xml = await response.text();
      const parsed = await xml2js.parseStringPromise(xml);
      const items = parsed.rss.channel[0].item || [];

      for (const item of items) {
        headlines.push({
          title: item.title[0],
          pubDate: new Date(item.pubDate[0])
        });
      }
    }

    // 日付順で並び替え（新しい順）
    headlines.sort((a, b) => b.pubDate - a.pubDate);

    // 最新20件だけ返す
    res.json(headlines.slice(0, 20));

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'ニュース取得失敗' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

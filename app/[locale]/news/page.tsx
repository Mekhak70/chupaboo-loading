"use client";

import { useEffect, useState } from "react";

type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
};

export default function LiveAnimalRSS() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRSS = async () => {
    try {
      // Օգտագործել CORS proxy
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const rssUrl = 'https://news.am/feed/';
      
      const res = await fetch(`${proxyUrl}${encodeURIComponent(rssUrl)}`);
      const text = await res.text();

      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");
      
      // Ստուգել parsing error-ը
      if (xml.querySelector('parsererror')) {
        throw new Error('XML parsing failed');
      }

      const items = Array.from(xml.querySelectorAll("item"));
      
      const filtered: NewsItem[] = items
        .map((item) => ({
          title: item.querySelector("title")?.textContent || "",
          link: item.querySelector("link")?.textContent || "#",
          pubDate: item.querySelector("pubDate")?.textContent || "",
        }))
        .filter((item) =>
          /կենդան|շուն|կատու|animal|pet|wild|առյուծ|փիղ/i.test(item.title)
        );

      setNews(filtered.slice(0, 6));
    } catch (err) {
      console.error("RSS fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRSS();
    const interval = setInterval(fetchRSS, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-md max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-[#69429a]">
        🐾 Կենդանիների Լուրեր
      </h2>

      {loading && <p>Բեռնվում է...</p>}

      {!loading && news.length === 0 && (
        <p>Համապատասխան լուրեր չեն գտնվել 😕</p>
      )}

      <ul className="space-y-2">
        {news.map((item, idx) => (
          <li key={idx} className="p-2 border-b last:border-none">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#333] hover:text-[#69429a] font-medium"
            >
              {item.title}
            </a>
            <div className="text-xs text-gray-500">
              {new Date(item.pubDate).toLocaleDateString("hy-AM")}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
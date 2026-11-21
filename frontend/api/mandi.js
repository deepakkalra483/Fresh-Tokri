/**
 * Vercel Serverless Function: Proxy for Vegetable Market Price API (Bhiwani)
 * Bypasses browser CORS restrictions by fetching server-side with required headers.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const date = req.query?.date || new Date().toISOString().slice(0, 10);
  const targetUrl = `https://vegetablemarketprice.com/api/dataapi/market/bhiwani/daywisedata?date=${date}`;

  try {
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://vegetablemarketprice.com',
        'Origin': 'https://vegetablemarketprice.com',
        'Accept': 'application/json, text/plain, */*',
      },
    });

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({ error: `Upstream error: ${upstreamRes.statusText}` });
    }

    const data = await upstreamRes.json();
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch vegetable prices' });
  }
}


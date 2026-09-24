export default async function handler(req, res) {
  const { q } = req.query
  if (!q) {
    return res.status(400).json({ error: 'Query parameter q is required' })
  }

  try {
    const ytUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q + ' audio')
    const response = await fetch(ytUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    })
    const data = await response.text()
    const match = data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/)

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')

    if (match) {
      return res.status(200).json({ videoId: match[1], query: q })
    }
    return res.status(200).json({ videoId: null, query: q })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

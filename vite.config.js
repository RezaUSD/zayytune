import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'https'

function youtubeResolverPlugin() {
  return {
    name: 'youtube-full-audio-resolver',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/yt-search')) {
          const urlObj = new URL(req.url, 'http://localhost:5173')
          const query = urlObj.searchParams.get('q')
          if (!query) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify({ error: 'Query is required' }))
          }

          try {
            const ytUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query + ' audio')
            https.get(
              ytUrl,
              { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } },
              (ytRes) => {
                let data = ''
                ytRes.on('data', (chunk) => (data += chunk))
                ytRes.on('end', () => {
                  const match = data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/)
                  res.setHeader('Content-Type', 'application/json')
                  res.setHeader('Access-Control-Allow-Origin', '*')
                  if (match) {
                    res.end(JSON.stringify({ videoId: match[1], query }))
                  } else {
                    res.end(JSON.stringify({ videoId: null, query }))
                  }
                })
              }
            ).on('error', (err) => {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: err.message }))
            })
          } catch (e) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: e.message }))
          }
          return
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), youtubeResolverPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/jamendo-audio': {
        target: 'https://prod-1.storage.jamendo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jamendo-audio/, ''),
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      },
      '/api/deezer': {
        target: 'https://api.deezer.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/deezer/, ''),
      },
    },
  },
})

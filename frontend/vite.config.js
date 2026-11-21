import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true, // Listens on all local network IP addresses for mobile access
    open: true,
    // Ensures /admin-deepak and other SPA routes work on direct browser refresh
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy for vegetablemarketprice.com API (avoids browser CORS block)
      '/api/mandi': {
        target: 'https://vegetablemarketprice.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          const u = new URL('http://localhost' + path);
          const date = u.searchParams.get('date') || '';
          return `/api/dataapi/market/bhiwani/daywisedata?date=${date}`;
        },
        headers: {
          'Referer':    'https://vegetablemarketprice.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Origin':     'https://vegetablemarketprice.com',
        },
      },
      // Proxy for vegetablemarketprice.com Fruits API
      '/api/fruits': {
        target: 'https://vegetablemarketprice.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          const u = new URL('http://localhost' + path);
          const date = u.searchParams.get('date') || '';
          return `/api/dataapi/fruits/westbengal/daywisedata?date=${date}`;
        },
        headers: {
          'Referer':    'https://vegetablemarketprice.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Origin':     'https://vegetablemarketprice.com',
        },
      },
      '/mandi-api': {
        target: 'https://vegetablemarketprice.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/mandi-api/, ''),
        headers: {
          'Referer':    'https://vegetablemarketprice.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Origin':     'https://vegetablemarketprice.com',
        },
      },
      '/fruits-api': {
        target: 'https://vegetablemarketprice.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/fruits-api/, ''),
        headers: {
          'Referer':    'https://vegetablemarketprice.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Origin':     'https://vegetablemarketprice.com',
        },
      },
    },
  },
});


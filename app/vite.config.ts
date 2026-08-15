import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
    proxy: {
      '/api/gold-rates': {
        target: 'https://api.parse.bot/scraper/cdcf99d0-b178-4dda-880c-6a531cfda453/get_india_gold_rates',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gold-rates/, ''),
        headers: {
          'X-API-Key': 'pmx_ec6aa2844f803d811d1ef0fabc125f04'
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

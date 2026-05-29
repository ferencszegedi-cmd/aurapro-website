// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
// Astro 5+ óta nincs külön 'hybrid' mód: az output 'static' marad, és az
// egyes route-ok prerender = false-szal jelölik ki magukat dinamikusnak
// (pl. src/pages/api/lead.ts → Vercel Function lesz).
export default defineConfig({
  site: 'https://www.aurapro.hu',
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: false },
  }),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});

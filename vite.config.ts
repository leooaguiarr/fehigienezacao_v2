import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

// O painel administrativo é estático (public/admin/). Em produção o Firebase
// Hosting entrega /admin/ direto; no dev server este plugin faz o mesmo.
const servirPainelAdmin = {
  name: 'serve-admin-static',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url ? req.url.split('?')[0] : '';
      if (url === '/admin' || url === '/admin/') {
        const adminHtmlPath = path.resolve(__dirname, 'public/admin/index.html');
        if (fs.existsSync(adminHtmlPath)) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.end(fs.readFileSync(adminHtmlPath));
        }
      }
      next();
    });
  }
};

export default defineConfig({
  plugins: [react(), tailwindcss(), servirPainelAdmin],
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});

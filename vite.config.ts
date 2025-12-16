
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    base: './', // Ensures assets are loaded correctly on static hosts
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'https://cbgknowledgehubmvp.gernas.bankfab.com',
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy, options) => {
            proxy.on('error', (err) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (_proxyReq, req) => {
              console.log('Proxying:', req.method, req.url, '→', (options.target || '') + (req.url || ''));
            });
            proxy.on('proxyRes', (proxyRes, req) => {
              console.log('Proxy response:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },
    define: {
      // This ensures process.env.API_KEY is replaced with the actual value (or undefined) during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});

import { json } from './http';
import { createRouter } from './router';

const api = createRouter({
  '/api/health': {
    GET: () => json({ status: 'ok' }),
  },
});

export default {
  fetch(request, env, ctx) {
    return api(request, env, ctx);
  },
} satisfies ExportedHandler<Cloudflare.Env>;

import { createRouter } from './router';
import { handleHealth } from './routes/health';
import { handlePair, handleUnpair } from './routes/pair';
import { handleSpeechToken } from './routes/speechToken';

const api = createRouter({
  '/api/health': { GET: handleHealth },
  '/api/pair': { POST: handlePair, DELETE: handleUnpair },
  '/api/speech/token': { POST: handleSpeechToken },
});

export default {
  fetch(request, env, ctx) {
    return api(request, env, ctx);
  },
} satisfies ExportedHandler<Cloudflare.Env>;

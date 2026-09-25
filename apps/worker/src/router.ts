import { error } from './http';

export type Handler = (
  request: Request,
  env: Cloudflare.Env,
  ctx: ExecutionContext,
) => Response | Promise<Response>;

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type Routes = Record<string, Partial<Record<Method, Handler>>>;

/** Dispatches `/api/*` requests by exact path and method. */
export function createRouter(routes: Routes): Handler {
  return (request, env, ctx) => {
    const { pathname } = new URL(request.url);
    const route = routes[pathname];
    if (!route) return error('not_found', 404);
    const handler = route[request.method as Method];
    if (!handler) {
      return error('method_not_allowed', 405, { allow: Object.keys(route).join(', ') });
    }
    return handler(request, env, ctx);
  };
}

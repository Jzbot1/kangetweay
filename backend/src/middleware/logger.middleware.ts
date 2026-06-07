import { Context, Next } from 'hono';

export async function loggerMiddleware(c: Context, next: Next) {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  
  console.log(`[API] --> ${method} ${path}`);
  
  await next();
  
  const duration = Date.now() - start;
  const status = c.res.status;
  
  console.log(`[API] <-- ${method} ${path} - ${status} (${duration}ms)`);
}

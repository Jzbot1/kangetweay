import { Hono } from 'hono';
import * as orderServices from '../services/order.service.js';
import { authMiddleware, AuthContext } from '../middleware/auth.middleware.js';

const ordersRoutes = new Hono<AuthContext>();

ordersRoutes.use('*', authMiddleware);

ordersRoutes.get('/', async (c) => {
  const user = c.get('user');
  
  // Extract filters from query
  const status = c.req.query('status') || undefined;
  const search = c.req.query('search') || undefined;
  const from = c.req.query('from') || undefined;
  const to = c.req.query('to') || undefined;
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = parseInt(c.req.query('limit') || '10', 10);

  const { orders, total } = await orderServices.listOrders(user.userId, {
    status,
    search,
    from,
    to,
    page,
    limit
  });

  return c.json({
    orders,
    total,
    page,
    limit
  }, 200);
});

ordersRoutes.get('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const details = await orderServices.getOrderDetails(id, user.userId);
  return c.json(details, 200);
});

export default ordersRoutes;

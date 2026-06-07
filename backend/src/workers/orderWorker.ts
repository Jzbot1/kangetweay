import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis.js';
import { query } from '../config/db.js';
import * as orderServices from '../services/order.service.js';
import { getCredentialForUse } from '../services/credential.service.js';
import { moogoldService } from '../services/moogold.service.js';
import { triggerOrderWebhook } from '../services/webhook.service.js';

export async function processOrderInBackground(
  orderId: string,
  userId: string,
  credentialId: string | null
): Promise<void> {
  console.log(`[OrderProcessor] Starting background execution for order ${orderId}`);

  // 1. Fetch order details from database
  const orderDetails = await orderServices.getOrderDetails(orderId);
  const order = orderDetails.order;

  // Update status to processing
  await orderServices.updateOrderStatus(orderId, 'processing', {
    eventMessage: 'Order processing started'
  });

  try {
    // 2. Identify the credential to use
    let targetCredentialId = credentialId || order.credential_id;
    
    if (!targetCredentialId) {
      // Resolve environment from api_key
      let environment: 'uat' | 'production' = 'production';
      if (order.api_key_id) {
        const apiResult = await query('SELECT environment FROM api_keys WHERE id = $1', [order.api_key_id]);
        if (apiResult.rows.length > 0) {
          environment = apiResult.rows[0].environment;
        }
      }

      // Fetch default credential for this env
      const credResult = await query(
        'SELECT id FROM moogold_credentials WHERE user_id = $1 AND environment = $2 AND is_default = true LIMIT 1',
        [userId, environment]
      );
      
      if (credResult.rows.length > 0) {
        targetCredentialId = credResult.rows[0].id;
      }
    }

    if (!targetCredentialId) {
      throw new Error('No default MooGold credential configured for this environment');
    }

    // 3. Load decrypted credential secret
    const cred = await getCredentialForUse(targetCredentialId, userId);
    if (!cred) {
      throw new Error('Configured MooGold credential could not be found or decrypted');
    }

    // 4. Update order with actual credential used
    await query('UPDATE orders SET credential_id = $1 WHERE id = $2', [targetCredentialId, orderId]);

    // 5. Submit order to MooGold API
    const payload = order.request_payload;
    const body = {
      category: payload.category || 1,
      'product-id': payload['product-id'] || payload.product_id,
      quantity: payload.quantity || 1,
      partnerOrderId: order.partner_order_id || undefined,
      fields: payload.fields || {}
    };

    const res = await moogoldService.createOrder(cred, body);

    // 6. Complete the order
    const updatedOrder = await orderServices.updateOrderStatus(orderId, 'completed', {
      moogoldOrderId: res.account_details?.order_id || res.order_id?.toString() || null,
      responsePayload: res,
      eventMessage: 'Order fulfilled successfully by MooGold'
    });

    // 7. Fire customer Webhook
    if (updatedOrder) {
      await triggerOrderWebhook(userId, updatedOrder);
    }

  } catch (error: any) {
    console.error(`[OrderProcessor] Order ${orderId} failed:`, error.message);
    
    const errorCode = error.errorCode || 'API_ERROR';
    const errorMessage = error.message || 'MooGold API error';
    
    // Map MooGold status changes
    let status: 'failed' | 'incorrect-details' = 'failed';
    if (errorCode === 'incorrect-details' || errorCode === '419' || errorCode === '116') {
      status = 'incorrect-details';
    }

    const updatedOrder = await orderServices.updateOrderStatus(orderId, status, {
      errorCode,
      errorMessage,
      responsePayload: { error: errorMessage, code: errorCode },
      eventMessage: `Order processing failed: ${errorMessage}`
    });

    if (updatedOrder) {
      await triggerOrderWebhook(userId, updatedOrder);
    }
    
    throw error;
  }
}

export function startOrderWorker() {
  const worker = new Worker(
    'orderQueue',
    async (job: Job) => {
      const { orderId, userId, credentialId } = job.data;
      await processOrderInBackground(orderId, userId, credentialId);
    },
    {
      connection: redis,
      concurrency: 5
    }
  );

  worker.on('completed', (job) => {
    console.log(`[OrderWorker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[OrderWorker] Job ${job?.id} failed:`, err.message);
  });
}

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import { prisma } from '../lib/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia' as any,
});

const PRICE_MAP: Record<string, { name: string; priceIdEnv: string }> = {
  starter: { name: 'Starter', priceIdEnv: 'STRIPE_PRICE_STARTER_ID' },
  pro: { name: 'Pro', priceIdEnv: 'STRIPE_PRICE_PRO_ID' },
  enterprise: { name: 'Enterprise', priceIdEnv: 'STRIPE_PRICE_ENTERPRISE_ID' },
};

function getPriceId(planId: string): string | undefined {
  const envVar = PRICE_MAP[planId]?.priceIdEnv;
  return envVar ? process.env[envVar] : undefined;
}

// ─── Webhook handler (exported for raw-body mounting) ───
export async function stripeWebhookHandler(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;

  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      event = JSON.parse(req.body);
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`Stripe webhook received: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, type, planId, quantity, packageId, propertyId, paymentId } = session.metadata || {};

        if (!userId || !type) {
          console.warn('Webhook missing metadata');
          break;
        }

        if (paymentId) {
          await prisma.payment.update({
            where: { id: paymentId },
            data: {
              status: 'completed',
              stripePaymentIntentId: session.payment_intent || null,
              amount: session.amount_total || 0,
            },
          });
        }

        if (type === 'plan' && planId) {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);

          await prisma.user.update({
            where: { id: userId },
            data: {
              planType: planId,
              planExpiresAt: expiresAt,
              stripeSubscriptionId: session.subscription || null,
            },
          });
        } else if (type === 'credits' && quantity) {
          await prisma.user.update({
            where: { id: userId },
            data: { featuredCredits: { increment: Number(quantity) } },
          });
        } else if (type === 'featured_package' && packageId) {
          if (propertyId) {
            const pkg = await prisma.featuredPackage.findUnique({ where: { id: packageId } });
            if (pkg) {
              const until = new Date();
              until.setDate(until.getDate() + pkg.durationDays);
              await prisma.property.update({
                where: { id: propertyId },
                data: {
                  featured: true,
                  featuredUntil: until,
                  featuredLevel: pkg.name,
                },
              });
            }
          }
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        if (invoice.subscription && invoice.customer) {
          const customer = await stripe.customers.retrieve(invoice.customer);
          if (!customer.deleted && customer.metadata?.userId) {
            const userId = customer.metadata.userId;
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);

            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            const planPriceId = subscription.items.data[0]?.price.id;
            let detectedPlanId = 'starter';
            for (const [key] of Object.entries(PRICE_MAP)) {
              if (getPriceId(key) === planPriceId) {
                detectedPlanId = key;
                break;
              }
            }

            await prisma.user.update({
              where: { id: userId },
              data: {
                planType: detectedPlanId,
                planExpiresAt: expiresAt,
                stripeSubscriptionId: subscription.id,
              },
            });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        if (!customer.deleted && customer.metadata?.userId) {
          await prisma.user.update({
            where: { id: customer.metadata.userId },
            data: {
              planType: 'free',
              planExpiresAt: null,
              stripeSubscriptionId: null,
            },
          });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// ─── REST router ───
const router: Router = Router();

const checkoutSchema = z.object({
  type: z.enum(['plan', 'credits', 'featured_package']),
  planId: z.string().optional(),
  quantity: z.number().min(1).optional(),
  packageId: z.string().optional(),
  propertyId: z.string().optional(),
  successUrl: z.string(),
  cancelUrl: z.string(),
});

router.post(
  '/create-checkout-session',
  authenticateToken,
  async (req: AuthRequest, res) => {
    const result = checkoutSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
    }

    const { type, planId, quantity, packageId, propertyId, successUrl, cancelUrl } = result.data;
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const lineItems: any[] = [];
    let mode: 'payment' | 'subscription' = 'payment';
    let paymentMetadata: Record<string, string> = {
      userId: user.id,
      type,
    };

    if (type === 'plan') {
      if (!planId || !PRICE_MAP[planId]) {
        return res.status(400).json({ error: 'Plano inválido' });
      }
      const priceId = getPriceId(planId);
      if (!priceId) {
        return res.status(500).json({ error: 'Preço do plano não configurado no Stripe' });
      }
      lineItems.push({ price: priceId, quantity: 1 });
      mode = 'subscription';
      paymentMetadata = { ...paymentMetadata, planId };
    } else if (type === 'credits') {
      const qty = quantity || 1;
      const unitAmount = 200; // €2.00 in cents
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Crédito de Destaque Sprint',
            description: `Crédito para destacar imóvel por 7 dias (×${qty})`,
          },
          unit_amount: unitAmount,
        },
        quantity: qty,
      });
      paymentMetadata = { ...paymentMetadata, quantity: String(qty) };
    } else if (type === 'featured_package') {
      if (!packageId) {
        return res.status(400).json({ error: 'packageId é obrigatório' });
      }
      const pkg = await prisma.featuredPackage.findUnique({ where: { id: packageId } });
      if (!pkg || !pkg.isActive) {
        return res.status(404).json({ error: 'Pacote não encontrado' });
      }
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: pkg.name,
            description: pkg.description,
          },
          unit_amount: Number(pkg.price),
        },
        quantity: 1,
      });
      paymentMetadata = { ...paymentMetadata, packageId, propertyId: propertyId || '' };
    }

    const payment = await prisma.payment.create({
      data: {
        userId,
        type,
        status: 'pending',
        amount: 0,
        currency: 'EUR',
        description:
          type === 'plan'
            ? `Plano ${planId}`
            : type === 'credits'
            ? `Créditos ×${quantity}`
            : 'Pacote destaque',
        metadata: JSON.stringify(paymentMetadata),
      },
    });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        ...paymentMetadata,
        paymentId: payment.id,
      },
      subscription_data:
        mode === 'subscription'
          ? {
              metadata: { ...paymentMetadata, paymentId: payment.id },
            }
          : undefined,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    res.json({ sessionId: session.id, url: session.url });
  }
);

router.post('/portal', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user?.stripeCustomerId) {
    return res.status(400).json({ error: 'Nenhuma subscrição ativa encontrada' });
  }

  const { returnUrl } = req.body;

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url:
      returnUrl || `${process.env.WEB_URL || 'http://localhost:3002'}/painel/agente/planos`,
  });

  res.json({ url: session.url });
});

router.get('/config', (_req, res) => {
  res.json({
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  });
});

export default router;

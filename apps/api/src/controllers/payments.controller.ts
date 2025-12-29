import { Request, Response } from 'express';
import { paymentsService } from '../services/payments.service';
import { AuthRequest, CreatePaymentIntentDto } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';

/**
 * Create payment intent
 * POST /api/v1/payments/create-intent
 */
export const createPaymentIntent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data: CreatePaymentIntentDto = req.body;
  const userId = req.user?.id;

  const result = await paymentsService.createPaymentIntent(data, userId);

  ApiResponse.success(res, result, 'Payment intent created');
});

/**
 * Get payment by order ID
 * GET /api/v1/payments/order/:orderId
 */
export const getPaymentByOrderId = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const payment = await paymentsService.getPaymentByOrderId(orderId);

  ApiResponse.success(res, payment);
});

/**
 * Process refund (admin)
 * POST /api/v1/payments/:paymentId/refund
 */
export const refundPayment = asyncHandler(async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const { amount } = req.body;

  const result = await paymentsService.refundPayment(paymentId, amount);

  ApiResponse.success(res, result, 'Refund processed successfully');
});

/**
 * Handle Stripe webhook
 * POST /api/v1/payments/webhook
 */
export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  const result = await paymentsService.handleWebhook(req.body, signature);

  ApiResponse.success(res, result);
});

-- Migration: Add razorpay_order_id to orders table
-- This allows reconciling orders when customers complete payment on Razorpay 
-- but exit before the frontend verification callback triggers.

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

-- Create index for fast lookups by Razorpay Order ID and Payment ID
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON public.orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

-- Optional: Comments for documentation
COMMENT ON COLUMN public.orders.razorpay_order_id IS 'Razorpay gateway order ID (e.g. order_OPX12345678) used for webhook reconciliation';

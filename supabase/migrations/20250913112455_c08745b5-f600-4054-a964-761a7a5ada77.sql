-- Fix security warnings by setting search_path on functions
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS generate_order_number();
DROP FUNCTION IF EXISTS update_stock_on_order();

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((SELECT COUNT(*) + 1 FROM public.orders WHERE DATE(created_at) = CURRENT_DATE)::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Update product stock
    UPDATE public.products 
    SET current_stock = current_stock - NEW.quantity
    WHERE id = NEW.product_id;
    
    -- Create stock movement record
    INSERT INTO public.stock_movements (product_id, movement_type, quantity, reason, reference_id, created_by)
    VALUES (NEW.product_id, 'out', NEW.quantity, 'order', NEW.order_id, 
            (SELECT salesman_id FROM public.orders WHERE id = NEW.order_id LIMIT 1));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
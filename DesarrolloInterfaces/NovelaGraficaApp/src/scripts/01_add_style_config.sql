-- Add style_config column to shop_items table
ALTER TABLE public.shop_items 
ADD COLUMN IF NOT EXISTS style_config JSONB DEFAULT '{}'::jsonb;

-- Comment on column
COMMENT ON COLUMN public.shop_items.style_config IS 'JSON object containing theme colors, fonts, and CSS variables';

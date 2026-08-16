-- Add weight column to public.products with constraint that it must be > 0 if not null
alter table public.products add column if not exists weight numeric(10, 3);
alter table public.products drop constraint if exists products_weight_check;
alter table public.products add constraint products_weight_check check (weight is null or weight > 0.0);

-- Add settings column to public.collections
alter table public.collections add column if not exists settings jsonb not null default '{}'::jsonb;

-- Seed default settings for the existing catalog collections
update public.collections
set settings = '{
  "default_title_en_pattern": "{name}",
  "default_title_te_pattern": "{name}",
  "default_description_en": "Exquisite bridal jewellery piece from our Bridal collection, weighing {weight}g.",
  "default_description_te": "మా పెళ్లి నగల సేకరణ నుండి అద్భుతమైన ఆభరణం, బరువు {weight}గ్రా.",
  "default_seo_title": "Buy {name} | TPG Jewellers",
  "default_seo_description": "Check out this premium bridal design weighing {weight}g from TPG Jewellers.",
  "default_category": "Bridal",
  "default_display_behavior": "standard"
}'::jsonb
where slug = 'bridal';

update public.collections
set settings = '{
  "default_title_en_pattern": "{name}",
  "default_title_te_pattern": "{name}",
  "default_description_en": "Classic gold jewellery piece weighing {weight}g, crafted in pure 22K gold.",
  "default_description_te": "22K స్వచ్ఛమైన బంగారంతో తయారు చేయబడిన ఆభరణం, బరువు {weight}గ్రా.",
  "default_seo_title": "Buy {name} | TPG Jewellers",
  "default_seo_description": "Check out this gold design weighing {weight}g from TPG Jewellers.",
  "default_category": "Gold",
  "default_display_behavior": "standard"
}'::jsonb
where slug = 'gold';

update public.collections
set settings = '{
  "default_title_en_pattern": "{name}",
  "default_title_te_pattern": "{name}",
  "default_description_en": "Luxurious diamond jewellery piece weighing {weight}g, featuring brilliant cut diamonds.",
  "default_description_te": "అద్భుతమైన వజ్రాల ఆభరణం, బరువు {weight}గ్రా.",
  "default_seo_title": "Buy {name} | TPG Jewellers",
  "default_seo_description": "Check out this premium diamond design weighing {weight}g from TPG Jewellers.",
  "default_category": "Diamond",
  "default_display_behavior": "standard"
}'::jsonb
where slug = 'diamond';

update public.collections
set settings = '{
  "default_title_en_pattern": "{name}",
  "default_title_te_pattern": "{name}",
  "default_description_en": "Traditional temple jewellery piece weighing {weight}g, with intricate detailing.",
  "default_description_te": "సాంప్రదాయ టెంపుల్ ఆభరణం, బరువు {weight}గ్రా.",
  "default_seo_title": "Buy {name} | TPG Jewellers",
  "default_seo_description": "Check out this traditional temple design weighing {weight}g from TPG Jewellers.",
  "default_category": "Temple",
  "default_display_behavior": "standard"
}'::jsonb
where slug = 'temple';

update public.collections
set settings = '{
  "default_title_en_pattern": "{name}",
  "default_title_te_pattern": "{name}",
  "default_description_en": "Elegant daily wear jewellery piece weighing {weight}g, perfect for everyday styling.",
  "default_description_te": "రోజువారీ ఉపయోగించే ఆభరణం, బరువు {weight}గ్రా.",
  "default_seo_title": "Buy {name} | TPG Jewellers",
  "default_seo_description": "Check out this daily wear design weighing {weight}g from TPG Jewellers.",
  "default_category": "Daily Wear",
  "default_display_behavior": "standard"
}'::jsonb
where slug = 'daily-wear';

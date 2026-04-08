-- Add meal type hint to wishlist entries (set when saving to wishlist, not when rating)
alter table wishlists add column if not exists wish_meal_type text;

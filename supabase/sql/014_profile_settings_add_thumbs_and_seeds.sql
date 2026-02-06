-- Add thumbs style and new seeds to avatar enums.
alter type public.avatar_style add value if not exists 'thumbs';
alter type public.avatar_seed add value if not exists 'Sunny';
alter type public.avatar_seed add value if not exists 'Parker';
alter type public.avatar_seed add value if not exists 'Quinn';

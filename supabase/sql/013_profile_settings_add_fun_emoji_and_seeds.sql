-- Add fun-emoji style and new seeds to avatar enums.
alter type public.avatar_style add value if not exists 'fun-emoji';
alter type public.avatar_seed add value if not exists 'Emery';
alter type public.avatar_seed add value if not exists 'Eliza';

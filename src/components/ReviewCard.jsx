import Rating from "@/components/ui/rating";

export default function ReviewCard({
    review,
    variant = "default",
    showEdit,
    showDelete,
    showReport,
    onEdit,
    onDelete,
    onReport,
}) {
    if (!review) return null;   /* prevent rendering if no review data is provided */
    const author = review.author ?? null;
    const displayName = author?.display_name || "Anonymous";
    const avatarSeed = author?.avatar_seed || null;
    const avatarStyle = author?.avatar_style || "avataaars-neutral";
    const avatarUrl = avatarSeed
      ? `https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${encodeURIComponent(
          avatarSeed
        )}`
      : null;
    const initial = displayName.trim().charAt(0).toUpperCase() || "U";

    const isHome = variant === "home";

    const cardClassName = isHome
      ? "min-w-[320px] max-w-[320px] rounded-r-xl border-4 border-brand-brown bg-brand-cream/90 p-5 dark:border-brand-cream dark:bg-blue-200"
      : "min-w-[280px] max-w-[280px] rounded-r-lg border-4 border-brand-brown bg-brand-orange/20 p-4 dark:border-brand-cream dark:bg-blue-300";

    const bandClassName = isHome
      ? "w-8 rounded-l-xl"
      : "w-10 rounded-l-lg";

    return (
    <div data-variant={variant} className="flex shrink-0 overflow-y-visible ">

     {/* The bordered card stays exactly the same */}
      <div className="
      min-w-70 max-w-70
          rounded-lg
          border-2
          border-brand-brown/30
          dark:border-brand-blue/30
          backdrop-blur-lg
          bg-linear-to-r
          from-brand-orange/60
          via-brand-cream/60
          to-brand-orange
          p-4
          shadow-sm
          dark:from-blue-300
          dark:via-blue-200
          dark:to-blue-400
          transition-all duration-200
          hover:shadow-lg
          cursor-pointer
        "
      >   
        <div className="mb-3 flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-brand-cream text-brand-brown">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold">
                {initial}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-brown dark:text-brand-brown">
              {displayName}
            </p>
          </div>
        </div>
        <div className="mb-3">
          <Rating
            value={review.rating_computed ?? review.rating ?? review.overall_rating ?? ""}
            disabled
            size="lg"
            showValue
            roundToHalf
            valueDisplay="exact"
            colorMode="solidByRating"
          />
        </div>
            
            <h3 className="text-base font-semibold text-brand-brown dark:text-brand-brown line-clamp-2">
                    {review.title || "Anonymous Review"}
            </h3>

            <p className="mt-3 text-sm text-brand-brown dark:text-brand-brown/80 leading-relaxed line-clamp-5">
                {review.body}
            </p>

            {(showEdit || showDelete || showReport) ? (
                <div className="mt-4 flex gap-3 text-sm font-semibold text-brand-brown hover:text-brand-blue dark:text-brand-blue dark:hover:text-brand-brown">
                    {showEdit ? (
                        <button
                            type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.();
                              }}
                        >
                            Edit
                        </button>
                    ) : null}
                    {showDelete ? (
                        <button
                            type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.();
                              }}
                            className="text-brand-brown hover:text-brand-blue dark:text-brand-blue dark:hover:text-brand-brown"
                        >
                            Delete
                        </button>
                    ) : null}
                    {showReport ? (
                        <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onReport?.();
                            }}
                            className="text-brand-brown hover:text-brand-blue dark:text-brand-blue dark:hover:text-brand-brown"
                        >
                            Report
                        </button>
                    ) : null}
                </div>
            ) : null}
        </div>
        </div>
    );
}

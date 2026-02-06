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
    return (
    <div data-variant={variant} className="flex shrink-0">
      {/* Outside band */}
      <div
        aria-hidden="true"
        className="w-10 rounded-l-lg"
        style={{ backgroundColor: "var(--review-band, #f97316)" }}
      />

      {/* The bordered card stays exactly the same */}
      <div className="min-w-[280px] max-w-[280px] rounded-r-lg border-4 border-brand-brown bg-brand-orange/50
     p-4 dark:border-brand-blue dark:bg-blue-300">
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
            <p className="text-sm font-semibold text-brand-brown">
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

            <p className="mt-3 text-sm text-brand-brown dark:text-brand-brown line-clamp-5">
                {review.body}
            </p>

            {(showEdit || showDelete || showReport) ? (
                <div className="mt-4 flex gap-3 text-sm font-semibold">
                    {showEdit ? (
                        <button
                            type="button"
                            onClick={onEdit}
                            className="text-blue-600 hover:text-blue-700"
                        >
                            Edit
                        </button>
                    ) : null}
                    {showDelete ? (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="text-brand-brown hover:text-brand-cream"
                        >
                            Delete
                        </button>
                    ) : null}
                    {showReport ? (
                        <button
                            type="button"
                            onClick={onReport}
                            className="text-brand-brown hover:text-brand-cream"
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

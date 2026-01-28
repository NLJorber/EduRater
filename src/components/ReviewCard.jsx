import Rating from "@/components/ui/rating";

export default function ReviewCard({ review, showControls, onEdit, onDelete, onReport }) {
    if (!review) return null;   /* prevent rendering if no review data is provided */

    return (
        <div className="min-w-[280px] max-w-[280px] shrink-0 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-3">
                <Rating
                    value={
                        review.rating_computed != null
                            ? String(review.rating_computed)
                            : ""
                    }
                    disabled
                    size="lg"
                />
            </div>
            
            <h3 className="text-base font-semibold text-black dark:text-white line-clamp-2">
                    {review.title || "Anonymous Review"}
            </h3>

            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-5">
                {review.body}
            </p>

            {showControls ? (
                <div className="mt-4 flex gap-3 text-sm font-semibold">
                    <button
                        type="button"
                        onClick={onEdit}
                        className="text-blue-600 hover:text-blue-700"
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        className="text-red-600 hover:text-red-700"
                    >
                        Delete
                    </button>
                    <button
                        type="button"
                        onClick={onReport}
                        className="text-red-600 hover:text-red-700"
                    >
                        Report
                    </button>
                </div>
            ) : null}
        </div>
    );
}

export default function ReviewCard({ review, showControls, onEdit, onDelete, onReport }) {
    if (!review) return null;   /* prevent rendering if no review data is provided */

    return (
        <div className="min-w-[280px] max-w-[280px] shrink-0 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-black dark:text-white line-clamp-2">
                    {review.title || "Anonymous Review"}
                </h3>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-sm font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                    {review.rating} / 5
                </span>
            </div>

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

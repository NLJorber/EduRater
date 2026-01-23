export default function ReviewCard({ review, showControls, onEdit, onDelete, onReport }) {
    if (!review) return null;   /* prevent rendering if no review data is provided */

console.log("rating:", review.rating, typeof review.rating);

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <svg
                key={index}
                className={`h-4 w-4 ${
                    index < rating ? "text-yellow-400" : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.449a1 1 0 00-.364 1.118l1.287 3.955c.3.921-.755 1.688-1.54 1.118l-3.37-2.449a1 1 0 00-1.176 0l-3.37 2.449c-.784.57-1.838-.197-1.539-1.118l1.286-3.955a1 1 0 00-.364-1.118L2.025 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.955z" />
            </svg>
        ));
    };

    return (
        <div className="min-w-[280px] max-w-[280px] shrink-0 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-black dark:text-white line-clamp-2">
                    {review.title || "Anonymous Review"}
                </h3>

                <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                </div>
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

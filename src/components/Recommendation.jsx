/* school and num are passed as props containing the schools data and its index */
export default function RecommendationCard({ school }) {
    if (!school) return null;   /* prevent rendering if no school data is provided */

    return (
        <div className="display-headings h-full p-6">
            {/* Display school name as heading */}
            <h2 className="text-lg font-semibold text-brand-cream dark:text-brand-blue">{school.EstablishmentName}</h2>
        </div>
    );
}
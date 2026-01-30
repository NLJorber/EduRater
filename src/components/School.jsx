/* school and num are passed as props containing the schools data and its index */
export default function SchoolCard({ school, score }) {
    if (!school) return null;   /* prevent rendering if no school data is provided */

    return (
        <div className="display-headings h-full rounded-lg border-3 p-6 bg-brand-blue dark:bg-brand-cream border-brand-brown dark:border-brand-blue">
            {/* Display school name as heading */}
            <h2 className="text-lg font-semibold text-brand-cream dark:text-brand-blue">{school.EstablishmentName}</h2>

            {/* Display school town */}
            <p className="text-brand-cream dark:text-brand-brown">{school.Town}</p>

            {/* Display school postcode */}
            <p className="text-brand-cream dark:text-brand-brown">Location: {school.Postcode}</p>

            <p className="mt-4 text-brand-cream dark:text-brand-brown">{score === null ? "No score yet" : `${score.toFixed(1)} / 5`}</p>
        </div>
    );
}
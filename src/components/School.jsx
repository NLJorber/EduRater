/* school and num are passed as props containing the schools data and its index */
export default function SchoolCard({ school, num }) {
    if (!school) return null;   /* prevent rendering if no school data is provided */

    return (
        <div className="display-headings h-full rounded-lg border-3 p-6 bg-brand-blue dark:bg-brand-brown border-brand-brown dark:border-brand-cream">
            {/* Display school name as heading */}
            <h2 className="text-lg font-semibold text-brand-cream dark:text-brand-orange">{school.EstablishmentName}</h2>

            {/* Display school town */}
            <p className="text-brand-cream dark:text-brand-cream">{school.Town}</p>

            {/* Display school postcode */}
            <p className="text-brand-cream dark:text-brand-cream">Location: {school.Postcode}</p>

            {/* Display school index in list of found schools */}
            <p className="text-brand-brown dark:text-brand-cream">Number: {num + 1}</p>
        </div>
    );
}
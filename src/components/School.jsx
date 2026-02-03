/* school and num are passed as props containing the schools data and its index */
export default function SchoolCard({ school, score }) {
    if (!school) return null;   /* prevent rendering if no school data is provided */

    const logoUrl = school.logo_url;
    const initial = (school.EstablishmentName || "?").trim().charAt(0).toUpperCase();

    return (
        <div className="display-headings h-full rounded-lg border-3 p-6 bg-brand-blue dark:bg-brand-cream border-brand-brown dark:border-brand-blue">
            <div className="flex items-start gap-3">
                {logoUrl ? (
                    <img
                        src={logoUrl}
                        alt={`${school.EstablishmentName} logo`}
                        className="h-12 w-12 rounded-full bg-white dark:bg-brand-blue p-1 object-contain"
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-cream/90 dark:bg-brand-blue text-lg font-semibold text-brand-blue dark:text-brand-cream">
                        {initial}
                    </div>
                )}
                <div>
                    {/* Display school name as heading */}
                    <h2 className="text-lg font-semibold text-brand-cream dark:text-brand-blue">{school.EstablishmentName}</h2>

                    {/* Display school town */}
                    <p className="text-brand-cream dark:text-brand-brown">{school.Town}</p>
                </div>
            </div>

            {/* Display school postcode */}
            <p className="text-brand-cream dark:text-brand-brown">Location: {school.Postcode}</p>

            <p className="mt-4 text-brand-cream dark:text-brand-brown">{score === null ? "No score yet" : `${score.toFixed(1)} / 5`}</p>
        </div>
    );
}

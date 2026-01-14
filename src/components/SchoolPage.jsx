export default function SchoolPage({ school }) {
    /* prevent rendering if the school does not exist */
    if (!school) return null;

    /* builds address lines and skips any null values */
    /* creates array of possible address data points */
    const addressLines = [school.Street, school["LA (name)"], school.Town, school.Postcode]
        .map((v) => (typeof v === "string" ? v.trim() : v))
        .filter(Boolean);   /* removes empty values */

    return (
        <div className="bg-white dark:bg-gray-900">
            {/* school name large heading */}
            <h4 className="p-4 text-2xl font-semibold text-black dark:text-white">
                {school.EstablishmentName}
            </h4>

            {/* line underneath heading */}
            <hr className="border-gray-300 dark:border-gray-700" />

            {/* conditional address block if there are lines */}
            {addressLines.length > 0 && (
                <div className="p-4 text-black dark:text-white">
                    <p className="font-semibold">Address:</p>
                    {/* loops through each string in addressLines and adds <p> per line */}
                    {addressLines.map((line, i) => (
                        <p key={i}>{line}</p>
                    ))}
                </div>
            )}

            {/* contact section with local council so far */}
            <div className="p-4">
                <h2 className="font-semibold border-b-1 text-lg border-gray-300 dark:border-gray-700 max-w-[25%]">Contact the school</h2>
                <p><b>Local council:</b> {school["LA (name)"]}</p>
            </div>
        </div>
    );
}

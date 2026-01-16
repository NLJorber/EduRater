export default function SchoolPage({ school }) {
    /* prevent rendering if the school does not exist */
    if (!school) return null;

    /* builds address lines and skips any null values */
    /* creates array of possible address data points */
    const addressLines = [school.Street, school.Locality, school.Address3, school.Town, school["County (name)"], school.Postcode]
        .map((v) => (typeof v === "string" ? v.trim() : v))
        .filter(Boolean);   /* removes empty values */

    return (
        <div className="bg-brand-custard dark:bg-brand-darkgreen pt-30 px-10">
            {/* school name large heading */}
            <h4 className="text-2xl font-semibold text-brand-azure dark:text-white mb-4">
                {school.EstablishmentName}
            </h4>

            {/* line underneath heading */}
            <hr className="border-brand-azure dark:border-brand-lightgrey mb-6" />

            {/* conditional address block if there are lines */}
            {addressLines.length > 0 && (
                <div className="mb-8 text-brand-azure dark:text-brand-custard">
                    <p className="font-semibold mb-2">Address:</p>
                    {/* loops through each string in addressLines and adds <p> per line */}
                    {addressLines.map((line, i) => (
                        <p key={i}>{line}</p>
                    ))}
                </div>
            )}

            {/* contact section with local council so far */}
            <div className="p-4">
                <h2 className="font-semibold border-b-1 text-lg text-brand-red dark:text-brand-custard border-gray-300 dark:border-brand-lightgrey inline-block mb-3">Contact the school</h2>
                <p className=" text-brand-azure dark:text-brand-custard"><b>Local council:</b> {school["LA (name)"]}</p>
            </div>
        </div>
    );
}

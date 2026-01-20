export default function SchoolPage({ school }) {
    /* prevent rendering if the school does not exist */
    if (!school) return null;

    /* builds address lines and skips any null values */
    /* creates array of possible address data points */
    const addressLines = [school.Street, school.Locality, school.Address3, school.Town, school["County (name)"], school.Postcode]
        .map((v) => (typeof v === "string" ? v.trim() : v))
        .filter(Boolean);   /* removes empty values */

    return (
        <div className="display-headings bg-brand-custard dark:bg-brand-darkgreen pt-30 px-10">
            {/* school name large heading */}
            <h3 className="text-2xl font-semibold text-brand-azure dark:text-white mb-4">
                {school.EstablishmentName}
            </h3>

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

            {/* school website section if available */}
            {school.SchoolWebsite && (
                <div className="text-brand-azure dark:text-brand-custard">
                    <p className="font-semibold mb-2">School website: <a className="text-blue-400" href={school.SchoolWebsite} target="_blank" rel="noopener noreferrer">{school.SchoolWebsite}</a></p>
                </div>)}

            {/* contact section with local council so far */}
            <div className="pt-4 pb-4">
                <h3 className="font-semibold border-b text-lg text-brand-red dark:text-brand-custard border-gray-300 dark:border-brand-lightgrey inline-block mb-3">Contact the school</h3>
                <p className=" text-brand-azure dark:text-brand-custard"><b>Local council:</b> {school["LA (name)"]}</p>
            </div>
        </div>
    );
}

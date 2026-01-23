export default function SchoolPage({ school }) {
    /* prevent rendering if the school does not exist */
    if (!school) return null;

    // trim whitespace from the school website URL
    const rawWebsite = (school.SchoolWebsite || "").trim();

    // make website link an absolute URL for <a href="">
    const websiteHref =
        rawWebsite && !/^https?:\/\//i.test(rawWebsite)
        ? `https://${rawWebsite.replace(/^\/+/, "")}`
        : rawWebsite;

    /* builds address lines and skips any null values */
    /* creates array of possible address data points */
    const addressLines = [school.Street, school.Locality, school.Address3, school.Town, school["County (name)"], school.Postcode]
        .map((v) => (typeof v === "string" ? v.trim() : v))
        .filter(Boolean);   /* removes empty values */

    return (
        <div className="display-headings bg-brand-cream dark:bg-brand-brown">
            {/* school name large heading */}
            <h3 className="text-2xl font-semibold text-brand-orange dark:text-brand-orange mb-4">
                {school.EstablishmentName}
            </h3>

            {/* line underneath heading */}
            <hr className="border-brand-brown dark:border-brand-cream mb-6" />

            {/* conditional address block if there are lines */}
            {addressLines.length > 0 && (
                <div className="mb-8 text-brand-blue dark:text-brand-cream">
                    <p className="font-semibold mb-2">Address:</p>
                    {/* loops through each string in addressLines and adds <p> per line */}
                    {addressLines.map((line, i) => (
                        <p key={i}>{line}</p>
                    ))}
                </div>
            )}

            {/* school website section if available */}
            {school.SchoolWebsite && (
                <div className="text-brand-blue dark:text-brand-cream">
                    <p className="font-semibold mb-2">School website: <a className="text-blue-400" href={websiteHref} target="_blank" rel="noopener noreferrer">{rawWebsite}</a></p>
                </div>)}

            {/* contact section with local council so far */}
            <div className="pt-4 pb-4">
                <h3 className="font-semibold border-b text-lg text-brand-orange dark:text-brand-orange border-gray-300 dark:border-brand-lightgrey inline-block mb-3">Contact the school</h3>
                <p className=" text-brand-azure dark:text-brand-cream"><b>Local council:</b> {school["LA (name)"]}</p>
            </div>
        </div>
    );
}

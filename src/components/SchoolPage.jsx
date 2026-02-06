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

    const formatPhoneForTel = (phone) =>
        String(phone ?? "").replace(/[^\d+]/g, "");

    const formatPhoneForDisplay = (phone) =>
        phone; 


    /* builds address lines and skips any null values */
    /* creates array of possible address data points */
    const addressLines = [school.Street, school.Locality, school.Address3, school.Town, school["County (name)"], school.Postcode]
    
        .map((v) => (typeof v === "string" ? v.trim() : v))
        .filter(Boolean);   /* removes empty values */

    return (
        <div className="display-headings">

            {/* school name large heading */}
            {/* <h2 className="font-semibold text-brand-orange dark:text-brand-orange mt-16 mb-4 text-center">
                {school.EstablishmentName}
            </h2> */}

            {/* line underneath heading
            <hr className="border-brand-brown dark:border-brand-cream mb-6" /> */}

            {/* conditional address block if there are lines */}
            {addressLines.length > 0 && (
                <div className="pl-5 mt-16 mb-8 text-brand-blue dark:text-brand-cream">
                    <h3 className="font-semibold mb-2">Address:</h3>
                    {/* loops through each string in addressLines and adds <p> per line */}
                    {addressLines.map((line, i) => (
                        <h5 key={i}>{line}</h5>
                    ))}
                    <h5 className=" text-brand-blue dark:text-brand-cream mt-4"><b>Local council:</b> {school["LA (name)"]}</h5>
                </div>
            )}

            {/* contact section with local council so far */}
            <div className="pb-4 pl-5">
                <h3 className="font-semibold border-b text-brand-orange dark:text-brand-orange border-gray-300 dark:border-brand-lightgrey inline-block mb-3">Contact the school</h3>

                {school.SchoolWebsite && (
                <div className="text-brand-blue dark:text-brand-cream">
                    <h5 className="font-semibold mt-4 mb-2">School website: <a className="text-blue-400" href={websiteHref} target="_blank" rel="noopener noreferrer">{rawWebsite}</a></h5>
                </div>)}

                {school.TelephoneNum && (
                <div className="text-brand-blue dark:text-brand-cream">
                    <h5 className="font-semibold mt-4 mb-2">Telephone:{""} <a className="text-blue-400" href={`tel:${formatPhoneForTel(school.TelephoneNum)}`} 
                    >
                    {formatPhoneForDisplay(school.TelephoneNum)}
                    </a>
                    </h5>
                </div>)}

                
            </div>         
        </div>
    );
}

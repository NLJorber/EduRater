/* school and num are passed as props containing the schools data and its index */
export default function SchoolCard({ school, num }) {
    if (!school) return null;   /* prevent rendering if no school data is provided */

    return (
        <div className="rounded-lg border p-4 bg-brand-custard dark:bg-brand-darkgreen border-brand-custard dark:border-brand-darkgreen">
            {/* Display school name as heading */}
            <h2 className="text-lg font-semibold text-brand-azure dark:text-brand-custard">{school.EstablishmentName}</h2>

            {/* Display school town */}
            <p className="text-brand-azure dark:text-brand-white">{school.Town}</p>

            {/* Display school postcode */}
            <p className="text-brand-azure dark:text-brand-white">Location: {school.Postcode}</p>

            {/* Display school index in list of found schools */}
            <p className="text-brand-azure dark:text-brand-white">Number: {num + 1}</p>
        </div>
    );
}
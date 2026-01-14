/* school and num are passed as props containing the schools data and its index */
export default function SchoolCard({ school, num }) {
    if (!school) return null;   /* prevent rendering if no school data is provided */

    return (
        <div className="rounded-lg border p-4 bg-white dark:bg-gray-900 dark:border-gray-700">
            {/* Display school name as heading */}
            <h2 className="text-lg font-semibold text-black dark:text-white">{school.EstablishmentName}</h2>

            {/* Display school town */}
            <p className="text-gray-700 dark:text-gray-300">{school.Town}</p>

            {/* Display school postcode */}
            <p className="text-gray-700 dark:text-gray-300">Location: {school.Postcode}</p>

            {/* Display school index in list of found schools */}
            <p className="text-gray-700 dark:text-gray-300">Number: {num + 1}</p>
        </div>
    );
}
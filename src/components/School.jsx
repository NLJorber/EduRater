export default function SchoolCard({ school, num }) {
    return (
        <div className="rounded-lg border p-4 bg-white dark:bg-gray-900 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-black dark:text-white">{school.EstablishmentName}</h2>
            <p className="text-gray-700 dark:text-gray-300">{school.Town}</p>
            <p className="text-gray-700 dark:text-gray-300">Location: {school.Postcode}</p>
            <p className="text-gray-700 dark:text-gray-300">Number: {num + 1}</p>
        </div>
    );
}
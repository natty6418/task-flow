
function DashboardCard({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 ease-in-out ${className}`}
      >
        {title && <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">{title}</h3>}
        <div className="text-gray-600 dark:text-gray-400">{children}</div>
      </div>
    );
  }


export default DashboardCard;
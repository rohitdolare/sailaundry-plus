// src/components/PageHeader.jsx

/**
 * PageHeader - Reusable page title component
 * @param {string} title - The title to display on the page
 */
const PageHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
        {subtitle && (
          <span className="ml-1 text-indigo-600 dark:text-indigo-300 font-semibold">
            {subtitle}
          </span>
        )}
      </h1>
      <div className="h-1 w-16 bg-indigo-600 dark:bg-indigo-400 rounded mt-1" />
    </div>
  );
};

export default PageHeader;

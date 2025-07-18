// src/components/PageHeader.jsx

/**
 * PageHeader - Reusable page title component
 * @param {string} title - The title to display on the page
 */
const PageHeader = ({ title }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <div className="h-1 w-16 bg-blue-500 rounded mt-1" />
    </div>
  );
};

export default PageHeader;

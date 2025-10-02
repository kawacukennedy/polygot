
import React from 'react';

const recentExecutions = [
  { id: 1, snippetTitle: 'Fibonacci Sequence', language: 'python', result: 'Success', executionTime: '120ms' },
  { id: 2, snippetTitle: 'Hello World', language: 'javascript', result: 'Success', executionTime: '50ms' },
  { id: 3, snippetTitle: 'Quicksort', language: 'cpp', result: 'Error', executionTime: '200ms' },
  { id: 4, snippetTitle: 'Web Server', language: 'go', result: 'Success', executionTime: '80ms' },
  { id: 5, snippetTitle: 'Factorial', language: 'ruby', result: 'Success', executionTime: '90ms' },
];

const RecentExecutions = () => {
  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-light-text_primary dark:text-dark-text_primary sm:pl-0">
                  Snippet
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-light-text_primary dark:text-dark-text_primary">
                  Language
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-light-text_primary dark:text-dark-text_primary">
                  Result
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-light-text_primary dark:text-dark-text_primary">
                  Execution Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentExecutions.map((execution) => (
                <tr key={execution.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-light-text_secondary dark:text-dark-text_secondary sm:pl-0">
                    {execution.snippetTitle}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-light-text_secondary dark:text-dark-text_secondary">
                    {execution.language}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-light-text_secondary dark:text-dark-text_secondary">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                      execution.result === 'Success' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10'
                    }`}>
                      {execution.result}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-light-text_secondary dark:text-dark-text_secondary">
                    {execution.executionTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecentExecutions;

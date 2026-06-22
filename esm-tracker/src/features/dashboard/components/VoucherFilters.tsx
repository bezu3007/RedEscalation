import { FilterState } from "../types";

interface VoucherFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
}

export const VoucherFilters = ({
  filters,
  onFilterChange,
  onResetFilters,
}: VoucherFiltersProps) => {
  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg border border-red-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Filters
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {/* Project */}
        <div>
          <label className="text-xs text-gray-600 uppercase font-semibold mb-2 block">
            Project
          </label>
          <select
            value={filters.project}
            onChange={(e) => handleChange("project", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">All Projects</option>
            <option value="proj1">Project 1</option>
            <option value="proj2">Project 2</option>
          </select>
        </div>

        {/* Module */}
        <div>
          <label className="text-xs text-gray-600 uppercase font-semibold mb-2 block">
            Module
          </label>
          <select
            value={filters.module}
            onChange={(e) => handleChange("module", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">All Modules</option>
            <option value="mod1">Module 1</option>
            <option value="mod2">Module 2</option>
          </select>
        </div>

        {/* Case Type */}
        <div>
          <label className="text-xs text-gray-600 uppercase font-semibold mb-2 block">
            Case Type
          </label>
          <select
            value={filters.caseType}
            onChange={(e) => handleChange("caseType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="Bug">Bug</option>
            <option value="Feature">Feature</option>
            <option value="Improvement">Improvement</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="text-xs text-gray-600 uppercase font-semibold mb-2 block">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="ON PROGRESS">On Progress</option>
            <option value="SOLVED">Solved</option>
            <option value="RETURNED">Returned</option>
          </select>
        </div>

        {/* Reported After */}
        <div>
          <label className="text-xs text-gray-600 uppercase font-semibold mb-2 block">
            Report Date From
          </label>
          <input
            type="date"
            value={filters.reportedAfter}
            onChange={(e) => handleChange("reportedAfter", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Reported Before */}
        <div>
          <label className="text-xs text-gray-600 uppercase font-semibold mb-2 block">
            Report Date To
          </label>
          <input
            type="date"
            value={filters.reportedBefore}
            onChange={(e) => handleChange("reportedBefore", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="text-right mt-4">
        <button
          onClick={onResetFilters}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
};

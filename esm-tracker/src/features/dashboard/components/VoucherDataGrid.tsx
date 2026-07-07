import { Voucher } from "../types";
import { Eye, Copy } from "lucide-react";

interface VoucherDataGridProps {
  vouchers: Voucher[];
  isLoading: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "ON PROGRESS":
      return "bg-blue-100 text-blue-700";
    case "SOLVED":
      return "bg-green-100 text-green-700";
    case "RETURNED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getCaseTypeColor = (caseType: string) => {
  switch (caseType) {
    case "Bug":
      return "bg-red-100 text-red-700";
    case "Feature":
      return "bg-green-100 text-green-700";
    case "Improvement":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const VoucherDataGrid = ({
  vouchers,
  isLoading,
}: VoucherDataGridProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <p className="text-gray-500">Loading vouchers...</p>
      </div>
    );
  }

  if (vouchers.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <p className="text-gray-500">No vouchers found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider text-xs">
                Expand
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider text-xs">
                Voucher Code
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider text-xs">
                Project Context
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider text-xs">
                Case Type
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider text-xs">
                Module
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider text-xs">
                Status
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider text-xs">
                Assigned Squad
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider text-xs">
                Issue Date
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider text-xs">
                Deadline
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider text-xs">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {vouchers.map((voucher) => (
              <tr key={voucher.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-center">
                  <button className="text-gray-400 hover:text-gray-600">
                    &gt;
                  </button>
                </td>
                <td className="px-6 py-4 font-medium text-blue-600">
                  {voucher.voucherCode}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {voucher.projectContext}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCaseTypeColor(
                      voucher.caseType
                    )}`}
                  >
                    {voucher.caseType}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">{voucher.module}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      voucher.status
                    )}`}
                  >
                    {voucher.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {voucher.assignedSquad}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {voucher.issueDate}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {voucher.deadline}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Eye size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Copy size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 flex justify-between items-center">
        <div>DISPLAYING LIST OF {vouchers.length} PARENT VOUCHERS</div>
        <div>
          OPEN: <span className="font-semibold">{vouchers.length}</span> | UAT
          SOLVED: <span className="font-semibold">1</span>
        </div>
      </div>
    </div>
  );
};

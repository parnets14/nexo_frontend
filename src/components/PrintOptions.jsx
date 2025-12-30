import { FiPrinter } from 'react-icons/fi';

const PrintOptions = ({ onPrint }) => {

  const handleQuickPrint = () => {
    window.print();
    if (onPrint) onPrint();
  };

  return (
    <div className="print:hidden">
      {/* Single Print Button */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={handleQuickPrint}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPrinter className="w-4 h-4 mr-2" />
          Print Invoice
        </button>
      </div>

      {/* Print Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Print Tips</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Click "Print Invoice" to print the invoice</li>
          <li>• For best results, use A4 paper in portrait orientation</li>
          <li>• Enable "Print backgrounds" in your browser for proper colors</li>
          <li>• The invoice is optimized for single-page printing</li>
        </ul>
      </div>
    </div>
  );
};

export default PrintOptions;
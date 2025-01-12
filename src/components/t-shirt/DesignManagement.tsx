interface DesignManagementProps {
  onSave: () => void;
  onLoad: () => void;
}

export default function DesignManagement({
  onSave,
  onLoad,
}: DesignManagementProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-medium text-lg mb-4">Design Management</h3>
      <div className="space-y-2">
        <button
          onClick={onSave}
          className="w-full px-4 py-3 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Design
        </button>
        <button
          onClick={onLoad}
          className="w-full px-4 py-3 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Load Saved Design
        </button>
      </div>
    </div>
  );
}

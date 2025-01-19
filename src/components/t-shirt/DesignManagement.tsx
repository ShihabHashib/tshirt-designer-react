interface DesignManagementProps {
  onSave: () => Promise<void>;
  onLoad: () => void;
  isSaving?: boolean;
}

export default function DesignManagement({
  onSave,
  onLoad,
  isSaving = false,
}: DesignManagementProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onSave}
        disabled={isSaving}
        className={`px-4 py-2 rounded bg-blue-500 text-white ${
          isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
        }`}
      >
        {isSaving ? "Saving..." : "Save Design"}
      </button>
      <button
        onClick={onLoad}
        disabled={isSaving}
        className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
      >
        Load Design
      </button>
    </div>
  );
}

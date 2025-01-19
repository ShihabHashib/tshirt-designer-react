import { SavedDesign } from "../types/design";

interface DesignCardProps {
  id: string;
  designData: SavedDesign;
  createdAt: string;
  onLoad: (design: SavedDesign) => void;
  onDelete: (id: string) => void;
}

export default function DesignCard({
  id,
  designData,
  createdAt,
  onLoad,
  onDelete,
}: DesignCardProps) {
  const date = new Date(createdAt).toLocaleDateString();

  // Get the first available design image
  const previewImage =
    Object.values(designData.designs).find((design) => design?.image)?.image ||
    null;

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square relative bg-gray-100">
        {previewImage ? (
          <img
            src={previewImage}
            alt="Design Preview"
            className="w-full h-full object-contain p-4"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No preview available
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: designData.tshirtColor }}
          />
          <span className="text-sm text-gray-500">{date}</span>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onLoad(designData)}
            className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Load
          </button>
          <button
            onClick={() => onDelete(id)}
            className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

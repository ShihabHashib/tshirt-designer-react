interface Color {
  name: string;
  value: string;
}

interface ColorPickerProps {
  colors: Color[];
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export default function ColorPicker({
  colors,
  selectedColor,
  onColorChange,
}: ColorPickerProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-medium text-lg">T-Shirt Color</h3>
        <span className="text-gray-600">
          {colors.find((c) => c.value === selectedColor)?.name}
        </span>
      </div>

      <div className="w-full max-w-[280px] grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4">
        {colors.map((color) => (
          <button
            key={color.value}
            className={`w-full aspect-square rounded-full relative`}
            style={{
              backgroundColor: color.value,
              border: color.value === "#ffffff" ? "1px solid #e5e7eb" : "none",
            }}
            onClick={() => onColorChange(color.value)}
          >
            {selectedColor === color.value && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

import { useRef, useState } from "react";
import Draggable from "react-draggable";
import { ResizableBox, ResizeCallbackData } from "react-resizable";
import "react-resizable/css/styles.css";
import { DraggableEvent } from "react-draggable";

interface TshirtCanvasProps {
  designImage: string | null;
  setDesignImage: (image: string | null) => void;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

// Add new interface for design data
interface SavedDesign {
  tshirtColor: string;
  designImage: string | null;
  position: Position;
  size: Size;
}

export default function TshirtCanvas({
  designImage,
  setDesignImage,
}: TshirtCanvasProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedColor = localStorage.getItem("tshirtColor") || "#ffffff";
  const [tshirtColor, setTshirtColor] = useState(savedColor);

  // Initial position only for first upload
  const INITIAL_POSITION = { x: 72, y: 0 };
  const INITIAL_SIZE = { width: 150, height: 150 };

  const [position, setPosition] = useState<Position>(INITIAL_POSITION);
  const [size, setSize] = useState<Size>(INITIAL_SIZE);
  const [isFirstUpload, setIsFirstUpload] = useState(true);

  const colors = [
    { name: "White", value: "#ffffff" },
    { name: "Black", value: "#000000" },
    { name: "Teal", value: "#008080" },
    { name: "Light Blue", value: "#add8e6" },
    { name: "Maroon", value: "#800000" },
    { name: "Olive", value: "#808000" },
    { name: "Coral", value: "#ff7f50" },
    { name: "Brown", value: "#8b4513" },
    { name: "Gray", value: "#808080" },
    { name: "Orange", value: "#ffa500" },
    { name: "Purple", value: "#800080" },
    { name: "Yellow", value: "#ffff00" },
    { name: "Green", value: "#008000" },
    { name: "Red", value: "#ff0000" },
    { name: "Navy", value: "#000080" },
    { name: "Pink", value: "#ffc0cb" },
  ];

  const handleDrag = (_e: DraggableEvent, data: { x: number; y: number }) => {
    setPosition({ x: data.x, y: data.y });
  };

  const handleResize = (_e: React.SyntheticEvent, data: ResizeCallbackData) => {
    setSize({ width: data.size.width, height: data.size.height });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Only reset position if it's the first upload
        if (isFirstUpload) {
          setPosition(INITIAL_POSITION);
          setIsFirstUpload(false);
        }
        // Always set the new image
        setDesignImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleColorChange = (color: string) => {
    setTshirtColor(color);
    localStorage.setItem("tshirtColor", color);
  };

  // Reset isFirstUpload when design is removed
  const handleRemoveDesign = () => {
    setDesignImage(null);
    setIsFirstUpload(true);
  };

  const saveDesign = () => {
    const designData: SavedDesign = {
      tshirtColor,
      designImage,
      position,
      size,
    };

    // Save to localStorage (for demo purposes)
    localStorage.setItem("savedDesign", JSON.stringify(designData));

    // Or send to backend API
    // await fetch('/api/designs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(designData)
    // });
  };

  const loadSavedDesign = () => {
    const savedDesign = localStorage.getItem("savedDesign");
    if (savedDesign) {
      const design: SavedDesign = JSON.parse(savedDesign);
      setTshirtColor(design.tshirtColor);
      setDesignImage(design.designImage);
      setPosition(design.position);
      setSize(design.size);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (isFirstUpload) {
          setPosition(INITIAL_POSITION);
          setIsFirstUpload(false);
        }
        setDesignImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div className="flex justify-center gap-20 px-8">
        {/* Control Panel */}
        <div className="w-[320px] space-y-8">
          {/* Color Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-medium text-lg">T-Shirt Color</h3>
              <span className="text-gray-600">
                {colors.find((c) => c.value === tshirtColor)?.name}
              </span>
            </div>

            <div className="w-[280px] grid grid-cols-5 gap-4">
              {colors.map((color) => (
                <button
                  key={color.value}
                  className={`w-12 h-12 rounded-full relative`}
                  style={{
                    backgroundColor: color.value,
                    border:
                      color.value === "#ffffff" ? "1px solid #e5e7eb" : "none",
                  }}
                  onClick={() => handleColorChange(color.value)}
                >
                  {tshirtColor === color.value && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
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

          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-medium text-lg mb-4">Upload Design</h3>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <div
              onClick={handleUploadClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <div className="text-gray-500">
                <svg
                  className="mx-auto h-8 w-8 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
            {/* Update Remove Design Button */}
            {designImage && (
              <button
                onClick={handleRemoveDesign}
                className="w-full px-4 py-3 mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                Remove Design
              </button>
            )}
          </div>

          {/* Add Save/Load Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-medium text-lg mb-4">Design Management</h3>
            <div className="space-y-2">
              <button
                onClick={saveDesign}
                className="w-full px-4 py-3 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Design
              </button>
              <button
                onClick={loadSavedDesign}
                className="w-full px-4 py-3 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Load Saved Design
              </button>
            </div>
          </div>
        </div>

        {/* T-shirt Canvas */}
        <div className="flex items-center justify-center">
          <div className="relative w-[600px] h-[700px] bg-white rounded-lg p-8">
            <svg
              className="absolute inset-0 w-full h-full p-12"
              viewBox="0 0 357.08 379.82"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <mask id="tshirt-mask">
                  <path
                    fill="white"
                    d="m345.79 601.06c-10.725-0.4181-26.925-1.4782-36-2.3556-36.648-3.5435-34.346-3.0691-39-8.0383-2.317-2.474-2.5266-3.524-2.8627-14.342-0.1995-6.4198 0.16063-16.622 0.80029-22.672 1.2282-11.617 3.2325-93.777 3.4396-141 0.12597-28.718-0.84859-40.024-4.0946-47.5l-1.5197-3.5-10.779 11.314c-8.651 9.0806-11.342 11.329-13.631 11.392-2.7841 0.0763-12.81-4.3264-22.853-10.036-2.75-1.5633-7.25-4.1199-10-5.6812s-7.1802-3.9712-9.845-5.3553c-10.356-5.3791-12.211-12.254-5.9078-21.899 2.0609-3.154 3.9734-5.9596 4.25-6.2346 0.27655-0.275 1.7633-2.8572 3.3039-5.7382 3.9894-7.4605 16.324-26.328 19.449-29.75 0.6875-0.75286 1.25-1.6299 1.25-1.9489 0-0.92598 5.3864-8.1413 15.812-21.18 8.1974-10.253 10.843-12.824 17.188-16.71 4.125-2.5261 10.65-5.7559 14.5-7.1774s9.475-3.7378 12.5-5.1473 8.7521-3.8555 12.727-5.4356c7.2337-2.8756 25.935-12.331 27.723-14.016 0.5225-0.49255 1.9675-0.89554 3.211-0.89554 1.2436 0 3.1216-0.92367 4.1734-2.0526 3.239-3.4767 6.9346-3.8269 14.254-1.3507 10.086 3.4123 31.272 5.1042 43.657 3.4864 5.3652-0.70083 12.26-2.1312 15.321-3.1787 6.9889-2.391 11.003-2.412 14.049-0.0733 1.3117 1.0071 8.0099 4.561 14.885 7.8976 13.095 6.355 35.078 16.773 38.5 18.245 24.772 10.658 28.188 13.639 41.208 35.96 3.0688 5.2612 6.4117 10.781 7.4286 12.265 1.0169 1.4847 4.0469 7.1097 6.7334 12.5s8.6 17.001 13.141 25.801c5.0261 9.7397 8.2291 17.127 8.1862 18.879-0.0663 2.7077-4.4587 8.6207-6.4039 8.6207-0.45803 0-2.7363 1.2097-5.0629 2.6882-4.5225 2.874-12.71 7.3733-24.585 13.511-10.176 5.2593-14.99 5.2579-20.013-0.006-1.9978-2.0939-4.7519-5.3564-6.1202-7.25-2.9538-4.0876-9.9078-10.943-11.101-10.943-1.5445 0-2.8754 3.7483-5.0303 14.167-3.1668 15.311-3.7738 26.78-2.77 52.333 0.49696 12.65 1.3267 41.9 1.8438 65s1.4181 53.283 2.0022 67.073c0.75847 17.906 0.75354 25.958-0.0173 28.169-1.6058 4.6063-6.4522 6.4404-20.94 7.9248-48.703 4.9902-52.257 5.256-68.5 5.1236-8.25-0.067-23.775-0.4644-34.5-0.8826z"
                    transform="translate(-189.9 -222.14)"
                  />
                </mask>
              </defs>

              <path
                style={{
                  fill: tshirtColor,
                  stroke: tshirtColor === "#ffffff" ? "#000000" : "none",
                  strokeWidth: "2",
                }}
                d="m345.79 601.06c-10.725-0.4181-26.925-1.4782-36-2.3556-36.648-3.5435-34.346-3.0691-39-8.0383-2.317-2.474-2.5266-3.524-2.8627-14.342-0.1995-6.4198 0.16063-16.622 0.80029-22.672 1.2282-11.617 3.2325-93.777 3.4396-141 0.12597-28.718-0.84859-40.024-4.0946-47.5l-1.5197-3.5-10.779 11.314c-8.651 9.0806-11.342 11.329-13.631 11.392-2.7841 0.0763-12.81-4.3264-22.853-10.036-2.75-1.5633-7.25-4.1199-10-5.6812s-7.1802-3.9712-9.845-5.3553c-10.356-5.3791-12.211-12.254-5.9078-21.899 2.0609-3.154 3.9734-5.9596 4.25-6.2346 0.27655-0.275 1.7633-2.8572 3.3039-5.7382 3.9894-7.4605 16.324-26.328 19.449-29.75 0.6875-0.75286 1.25-1.6299 1.25-1.9489 0-0.92598 5.3864-8.1413 15.812-21.18 8.1974-10.253 10.843-12.824 17.188-16.71 4.125-2.5261 10.65-5.7559 14.5-7.1774s9.475-3.7378 12.5-5.1473 8.7521-3.8555 12.727-5.4356c7.2337-2.8756 25.935-12.331 27.723-14.016 0.5225-0.49255 1.9675-0.89554 3.211-0.89554 1.2436 0 3.1216-0.92367 4.1734-2.0526 3.239-3.4767 6.9346-3.8269 14.254-1.3507 10.086 3.4123 31.272 5.1042 43.657 3.4864 5.3652-0.70083 12.26-2.1312 15.321-3.1787 6.9889-2.391 11.003-2.412 14.049-0.0733 1.3117 1.0071 8.0099 4.561 14.885 7.8976 13.095 6.355 35.078 16.773 38.5 18.245 24.772 10.658 28.188 13.639 41.208 35.96 3.0688 5.2612 6.4117 10.781 7.4286 12.265 1.0169 1.4847 4.0469 7.1097 6.7334 12.5s8.6 17.001 13.141 25.801c5.0261 9.7397 8.2291 17.127 8.1862 18.879-0.0663 2.7077-4.4587 8.6207-6.4039 8.6207-0.45803 0-2.7363 1.2097-5.0629 2.6882-4.5225 2.874-12.71 7.3733-24.585 13.511-10.176 5.2593-14.99 5.2579-20.013-0.006-1.9978-2.0939-4.7519-5.3564-6.1202-7.25-2.9538-4.0876-9.9078-10.943-11.101-10.943-1.5445 0-2.8754 3.7483-5.0303 14.167-3.1668 15.311-3.7738 26.78-2.77 52.333 0.49696 12.65 1.3267 41.9 1.8438 65s1.4181 53.283 2.0022 67.073c0.75847 17.906 0.75354 25.958-0.0173 28.169-1.6058 4.6063-6.4522 6.4404-20.94 7.9248-48.703 4.9902-52.257 5.256-68.5 5.1236-8.25-0.067-23.775-0.4644-34.5-0.8826z"
                transform="translate(-189.9 -222.14)"
              />

              {designImage && (
                <foreignObject
                  width="100%"
                  height="100%"
                  mask="url(#tshirt-mask)"
                >
                  <div className="w-full h-full relative p-8">
                    <Draggable
                      position={position}
                      onDrag={handleDrag}
                      bounds="parent"
                      defaultPosition={INITIAL_POSITION}
                    >
                      <div className="absolute">
                        <ResizableBox
                          width={size.width}
                          height={size.height}
                          onResize={handleResize}
                          minConstraints={[50, 50]}
                          maxConstraints={[300, 300]}
                          lockAspectRatio
                          resizeHandles={["se", "sw", "ne", "nw"]}
                          className="group"
                        >
                          <div className="relative">
                            <img
                              src={designImage}
                              alt="Design"
                              className="w-full h-full object-contain"
                              draggable={false}
                            />

                            {/* Size indicator */}
                            <div className="size-indicator">
                              {Math.round(size.width)} ×{" "}
                              {Math.round(size.height)}
                            </div>

                            {/* Guidelines */}
                            <div className="resize-guidelines">
                              <div className="resize-guideline-h absolute top-1/2 -translate-y-1/2" />
                              <div className="resize-guideline-v absolute left-1/2 -translate-x-1/2" />
                            </div>
                          </div>
                        </ResizableBox>
                      </div>
                    </Draggable>
                  </div>
                </foreignObject>
              )}
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}

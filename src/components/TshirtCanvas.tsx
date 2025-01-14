import { useState, useEffect } from "react";
import "react-resizable/css/styles.css";
import ColorPicker from "./t-shirt/ColorPicker";
import { DraggableEvent } from "react-draggable";
import { ResizeCallbackData } from "react-resizable";
import DesignUploader from "./t-shirt/DesignUploader.tsx";
import DraggableDesign from "./t-shirt/DraggableDesign.tsx";
import DesignManagement from "./t-shirt/DesignManagement.tsx";

interface TshirtCanvasProps {
  frontImage?: string;
  backImage?: string;
  leftSleeveImage?: string;
  rightSleeveImage?: string;
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
  designs: {
    front: { image: string | null; position: Position; size: Size } | null;
    back: { image: string | null; position: Position; size: Size } | null;
    leftSleeve: { image: string | null; position: Position; size: Size } | null;
    rightSleeve: {
      image: string | null;
      position: Position;
      size: Size;
    } | null;
  };
}

// Update the localStorage access with safety checks
const getSavedColor = () => {
  try {
    return localStorage.getItem("tshirtColor") || "#ffffff";
  } catch (error) {
    console.warn("Could not access localStorage:", error);
    return "#ffffff";
  }
};

const saveColor = (color: string) => {
  try {
    localStorage.setItem("tshirtColor", color);
  } catch (error) {
    console.warn("Could not save to localStorage:", error);
  }
};

export default function TshirtCanvas({
  frontImage,
  backImage,
  leftSleeveImage,
  rightSleeveImage,
  setDesignImage,
}: TshirtCanvasProps) {
  const [tshirtColor, setTshirtColor] = useState(getSavedColor());

  // Update the INITIAL_POSITION and INITIAL_SIZE to handle sleeve views
  const getInitialPosition = (viewType: string): Position => {
    if (viewType.includes("Sleeve")) {
      return { x: 1000, y: 957 }; // Increased y position for better visibility
    }
    return { x: 107, y: 38 }; // Original position for front/back
  };

  const getInitialSize = (viewType: string): Size => {
    if (viewType.includes("Sleeve")) {
      return { width: 500, height: 500 }; // Increased size for sleeves
    }
    return { width: 150, height: 150 }; // Original size for front/back
  };

  const [position, setPosition] = useState<Position>(
    getInitialPosition("front")
  );
  const [size, setSize] = useState<Size>(getInitialSize("front"));
  const [isFirstUpload, setIsFirstUpload] = useState(true);

  // Add new view type
  const [viewType, setViewType] = useState<
    "front" | "back" | "leftSleeve" | "rightSleeve"
  >("front");

  // Replace uploadedDesign with designsByView
  const [designsByView, setDesignsByView] = useState<{
    front: { image: string | null; position: Position; size: Size } | null;
    back: { image: string | null; position: Position; size: Size } | null;
    leftSleeve: { image: string | null; position: Position; size: Size } | null;
    rightSleeve: {
      image: string | null;
      position: Position;
      size: Size;
    } | null;
  }>({
    front: null,
    back: null,
    leftSleeve: null,
    rightSleeve: null,
  });

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

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const initialPos = getInitialPosition(viewType);
      const initialSize = getInitialSize(viewType);

      setDesignsByView((prev) => ({
        ...prev,
        [viewType]: {
          image: result,
          position: isFirstUpload ? initialPos : position,
          size: initialSize,
        },
      }));
      setDesignImage(result);
      if (isFirstUpload) {
        setPosition(initialPos);
        setSize(initialSize);
        setIsFirstUpload(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleColorChange = (color: string) => {
    setTshirtColor(color);
    saveColor(color);
  };

  // Update handleRemoveDesign to remove design from current view
  const handleRemoveDesign = () => {
    setDesignsByView((prev) => ({
      ...prev,
      [viewType]: null,
    }));
    setDesignImage(null);
    setIsFirstUpload(true);
  };

  // Update position and size when switching views
  useEffect(() => {
    const currentDesign = designsByView[viewType];
    if (currentDesign) {
      setPosition(currentDesign.position);
      setSize(currentDesign.size);
    } else {
      setPosition(getInitialPosition(viewType));
      setSize(getInitialSize(viewType));
    }
  }, [viewType, designsByView]);

  // Update position and size storage when they change
  useEffect(() => {
    if (designsByView[viewType]) {
      setDesignsByView((prev) => ({
        ...prev,
        [viewType]: {
          ...prev[viewType]!,
          position,
          size,
        },
      }));
    }
  }, [position, size, viewType, designsByView]);

  // Update the designImage calculation
  const designImage = designsByView[viewType]?.image || null;

  // Update saveDesign function
  const saveDesign = () => {
    try {
      const designData: SavedDesign = {
        tshirtColor,
        designs: designsByView,
      };
      localStorage.setItem("savedDesign", JSON.stringify(designData));
    } catch (error) {
      console.warn("Could not save design:", error);
    }
  };

  // Update loadSavedDesign function
  const loadSavedDesign = () => {
    try {
      const savedDesign = localStorage.getItem("savedDesign");
      if (savedDesign) {
        const design: SavedDesign = JSON.parse(savedDesign);
        setTshirtColor(design.tshirtColor);
        setDesignsByView(design.designs);

        const currentDesign = design.designs[viewType];
        if (currentDesign) {
          setPosition(currentDesign.position);
          setSize(currentDesign.size);
        }
      }
    } catch (error) {
      console.warn("Could not load saved design:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="container mx-auto flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-20">
        {/* Control Panel */}
        <div className="w-full lg:w-[320px] space-y-6 min-w-[320px]">
          <ColorPicker
            colors={colors}
            selectedColor={tshirtColor}
            onColorChange={handleColorChange}
          />

          <DesignUploader
            onFileSelect={handleFileSelect}
            onRemoveDesign={handleRemoveDesign}
            hasDesign={!!designImage}
          />

          <DesignManagement onSave={saveDesign} onLoad={loadSavedDesign} />
        </div>

        {/* T-shirt Canvas */}
        <div className="w-full flex-1 flex flex-col items-center justify-center min-w-0 lg:min-w-[600px]">
          {/* View Toggle - Enhanced design */}
          <div className="bg-white rounded-lg shadow p-4 lg:p-6 mb-4 lg:mb-6 w-full max-w-[600px]">
            <div className="flex justify-center gap-2">
              {/* Front View Button */}
              <button
                className={`flex-1 max-w-[120px] px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  viewType === "front"
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setViewType("front")}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                  Front
                </div>
              </button>

              {/* Left Sleeve Button */}
              <button
                className={`flex-1 max-w-[120px] px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  viewType === "leftSleeve"
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setViewType("leftSleeve")}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                    />
                  </svg>
                  Left Hand
                </div>
              </button>

              {/* Right Sleeve Button */}
              <button
                className={`flex-1 max-w-[120px] px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  viewType === "rightSleeve"
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setViewType("rightSleeve")}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 transform scale-x-[-1]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                    />
                  </svg>
                  Right Hand
                </div>
              </button>

              {/* Back View Button */}
              <button
                className={`flex-1 max-w-[120px] px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  viewType === "back"
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setViewType("back")}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                    />
                  </svg>
                  Back
                </div>
              </button>
            </div>
          </div>

          <div className="relative w-full max-w-[600px] h-[400px] lg:h-[700px] bg-white rounded-lg p-4 lg:p-8 flex items-center justify-center">
            <svg
              className="w-full h-full"
              viewBox={
                viewType.includes("Sleeve") ? "0 0 2490 3510" : "0 0 400 500"
              }
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <mask id="tshirt-mask">
                  <path
                    fill="white"
                    d={
                      viewType.includes("Sleeve")
                        ? "m1550.4 804.1c0-411.9-596.8-411.9-596.8 0v656.7c0 60.2 596.8 60.2 596.8 0z"
                        : "m345.79 601.06c-10.725-0.4181-26.925-1.4782-36-2.3556-36.648-3.5435-34.346-3.0691-39-8.0383-2.317-2.474-2.5266-3.524-2.8627-14.342-0.1995-6.4198 0.16063-16.622 0.80029-22.672 1.2282-11.617 3.2325-93.777 3.4396-141 0.12597-28.718-0.84859-40.024-4.0946-47.5l-1.5197-3.5-10.779 11.314c-8.651 9.0806-11.342 11.329-13.631 11.392-2.7841 0.0763-12.81-4.3264-22.853-10.036-2.75-1.5633-7.25-4.1199-10-5.6812s-7.1802-3.9712-9.845-5.3553c-10.356-5.3791-12.211-12.254-5.9078-21.899 2.0609-3.154 3.9734-5.9596 4.25-6.2346 0.27655-0.275 1.7633-2.8572 3.3039-5.7382 3.9894-7.4605 16.324-26.328 19.449-29.75 0.6875-0.75286 1.25-1.6299 1.25-1.9489 0-0.92598 5.3864-8.1413 15.812-21.18 8.1974-10.253 10.843-12.824 17.188-16.71 4.125-2.5261 10.65-5.7559 14.5-7.1774s9.475-3.7378 12.5-5.1473 8.7521-3.8555 12.727-5.4356c7.2337-2.8756 25.935-12.331 27.723-14.016 0.5225-0.49255 1.9675-0.89554 3.211-0.89554 1.2436 0 3.1216-0.92367 4.1734-2.0526 3.239-3.4767 6.9346-3.8269 14.254-1.3507 10.086 3.4123 31.272 5.1042 43.657 3.4864 5.3652-0.70083 12.26-2.1312 15.321-3.1787 6.9889-2.391 11.003-2.412 14.049-0.0733 1.3117 1.0071 8.0099 4.561 14.885 7.8976 13.095 6.355 35.078 16.773 38.5 18.245 24.772 10.658 28.188 13.639 41.208 35.96 3.0688 5.2612 6.4117 10.781 7.4286 12.265 1.0169 1.4847 4.0469 7.1097 6.7334 12.5s8.6 17.001 13.141 25.801c5.0261 9.7397 8.2291 17.127 8.1862 18.879-0.0663 2.7077-4.4587 8.6207-6.4039 8.6207-0.45803 0-2.7363 1.2097-5.0629 2.6882-4.5225 2.874-12.71 7.3733-24.585 13.511-10.176 5.2593-14.99 5.2579-20.013-0.006-1.9978-2.0939-4.7519-5.3564-6.1202-7.25-2.9538-4.0876-9.9078-10.943-11.101-10.943-1.5445 0-2.8754 3.7483-5.0303 14.167-3.1668 15.311-3.7738 26.78-2.77 52.333 0.49696 12.65 1.3267 41.9 1.8438 65s1.4181 53.283 2.0022 67.073c0.75847 17.906 0.75354 25.958-0.0173 28.169-1.6058 4.6063-6.4522 6.4404-20.94 7.9248-48.703 4.9902-52.257 5.256-68.5 5.1236-8.25-0.067-23.775-0.4644-34.5-0.8826z"
                    }
                    transform={
                      viewType.includes("Sleeve")
                        ? undefined
                        : "translate(-189.9 -222.14)"
                    }
                  />
                </mask>
              </defs>

              {/* Main path */}
              <path
                style={{
                  fill: tshirtColor,
                  stroke: tshirtColor === "#ffffff" ? "#000000" : "none",
                  strokeWidth: "2",
                }}
                d={
                  viewType.includes("Sleeve")
                    ? "m1550.4 804.1c0-411.9-596.8-411.9-596.8 0v656.7c0 60.2 596.8 60.2 596.8 0z"
                    : "m345.79 601.06c-10.725-0.4181-26.925-1.4782-36-2.3556-36.648-3.5435-34.346-3.0691-39-8.0383-2.317-2.474-2.5266-3.524-2.8627-14.342-0.1995-6.4198 0.16063-16.622 0.80029-22.672 1.2282-11.617 3.2325-93.777 3.4396-141 0.12597-28.718-0.84859-40.024-4.0946-47.5l-1.5197-3.5-10.779 11.314c-8.651 9.0806-11.342 11.329-13.631 11.392-2.7841 0.0763-12.81-4.3264-22.853-10.036-2.75-1.5633-7.25-4.1199-10-5.6812s-7.1802-3.9712-9.845-5.3553c-10.356-5.3791-12.211-12.254-5.9078-21.899 2.0609-3.154 3.9734-5.9596 4.25-6.2346 0.27655-0.275 1.7633-2.8572 3.3039-5.7382 3.9894-7.4605 16.324-26.328 19.449-29.75 0.6875-0.75286 1.25-1.6299 1.25-1.9489 0-0.92598 5.3864-8.1413 15.812-21.18 8.1974-10.253 10.843-12.824 17.188-16.71 4.125-2.5261 10.65-5.7559 14.5-7.1774s9.475-3.7378 12.5-5.1473 8.7521-3.8555 12.727-5.4356c7.2337-2.8756 25.935-12.331 27.723-14.016 0.5225-0.49255 1.9675-0.89554 3.211-0.89554 1.2436 0 3.1216-0.92367 4.1734-2.0526 3.239-3.4767 6.9346-3.8269 14.254-1.3507 10.086 3.4123 31.272 5.1042 43.657 3.4864 5.3652-0.70083 12.26-2.1312 15.321-3.1787 6.9889-2.391 11.003-2.412 14.049-0.0733 1.3117 1.0071 8.0099 4.561 14.885 7.8976 13.095 6.355 35.078 16.773 38.5 18.245 24.772 10.658 28.188 13.639 41.208 35.96 3.0688 5.2612 6.4117 10.781 7.4286 12.265 1.0169 1.4847 4.0469 7.1097 6.7334 12.5s8.6 17.001 13.141 25.801c5.0261 9.7397 8.2291 17.127 8.1862 18.879-0.0663 2.7077-4.4587 8.6207-6.4039 8.6207-0.45803 0-2.7363 1.2097-5.0629 2.6882-4.5225 2.874-12.71 7.3733-24.585 13.511-10.176 5.2593-14.99 5.2579-20.013-0.006-1.9978-2.0939-4.7519-5.3564-6.1202-7.25-2.9538-4.0876-9.9078-10.943-11.101-10.943-1.5445 0-2.8754 3.7483-5.0303 14.167-3.1668 15.311-3.7738 26.78-2.77 52.333 0.49696 12.65 1.3267 41.9 1.8438 65s1.4181 53.283 2.0022 67.073c0.75847 17.906 0.75354 25.958-0.0173 28.169-1.6058 4.6063-6.4522 6.4404-20.94 7.9248-48.703 4.9902-52.257 5.256-68.5 5.1236-8.25-0.067-23.775-0.4644-34.5-0.8826z"
                }
                transform={
                  viewType.includes("Sleeve")
                    ? undefined
                    : "translate(-189.9 -222.14)"
                }
              />

              {/* Optional: Add the decorative path for sleeve detail */}
              {viewType.includes("Sleeve") && (
                <path
                  style={{
                    fill: tshirtColor === "#ffffff" ? "#000000" : "#ffffff",
                    opacity: 0.1,
                  }}
                  d="m543.2 1563c-3.9 0-7.5-1.5-10.1-3.9-2.7 2.4-6.1 4.1-10.2 3.9q-10.1-0.1-20.2-0.2c-3.9 0-7.4-1.5-10-4-2.8 2.4-6.7 3.8-10.2 3.7q-10.1-0.1-20.2-0.4c-3.9-0.1-7.4-1.6-10-4.1-2.7 2.4-6.4 3.7-10.2 3.6q-10.2-0.3-20.3-0.6c-3.8-0.2-7.3-1.8-9.9-4.3-2.8 2.3-6.4 3.7-10.3 3.5q-10.2-0.4-20.2-0.9c-3.9-0.2-7.4-1.9-9.9-4.4-2.8 2.3-6.5 3.5-10.4 3.3q-10.2-0.6-20.2-1.2c-3.9-0.3-7.3-2-9.9-4.6-2.8 2.3-6.5 3.4-10.3 3.2q-10 0.7-20.1 0.9c-3.8 0.2-7.3 1.7-10 4.1-2.7-2.3-6.1-3.8-10.1-3.6q-10 0.3-20 0.4c-3.8 0.1-7.3 1.5-10 3.9-2.7-2.4-6.2-3.9-10-3.7q-10 0.1-20.1 0.1c-3.8 0-7.5-1.4-10.2-3.7-2.6 2.4-6.2 3.9-10.1 3.9q-10.1 0.1-20.2 0.1 0 0 0 0z"
                />
              )}

              {designImage && (
                <foreignObject
                  width="100%"
                  height="100%"
                  mask="url(#tshirt-mask)"
                >
                  <div className="w-full h-full relative">
                    <DraggableDesign
                      designImage={designImage}
                      position={position}
                      size={size}
                      onDrag={handleDrag}
                      onResize={handleResize}
                      initialPosition={getInitialPosition(viewType)}
                      bounds={
                        viewType.includes("Sleeve")
                          ? { left: 500, top: 400, right: 1500, bottom: 1500 }
                          : { left: -50, top: -50, right: 250, bottom: 250 }
                      }
                      maxConstraints={
                        viewType.includes("Sleeve") ? [800, 800] : [200, 200]
                      }
                      viewType={viewType}
                    />
                  </div>
                </foreignObject>
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import "react-resizable/css/styles.css";
import ColorPicker from "./t-shirt/ColorPicker";
import { DraggableEvent } from "react-draggable";
import { ResizeCallbackData } from "react-resizable";
import DesignUploader from "./t-shirt/DesignUploader.tsx";
import DraggableDesign from "./t-shirt/DraggableDesign.tsx";
import DesignManagement from "./t-shirt/DesignManagement.tsx";
import { cloudinaryService } from "../services/cloudinary";
import { auth } from "../config/firebase";
import { designService } from "../services/designs";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { useErrorHandler } from "../hooks/useErrorHandler";
import ErrorMessage from "./ErrorMessage";

interface TshirtCanvasProps {
  designImage?: string;
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
  designImage,
  setDesignImage,
}: TshirtCanvasProps) {
  const { error, handleError, clearError } = useErrorHandler();
  const [tshirtColor, setTshirtColor] = useState(getSavedColor());
  const [viewType, setViewType] = useState<
    "front" | "back" | "leftSleeve" | "rightSleeve"
  >("front");

  // Keep track of positions and sizes for each view separately
  const [positions, setPositions] = useState<Record<string, Position>>({
    front: { x: 107, y: 38 },
    back: { x: 107, y: 38 },
    leftSleeve: { x: 1000, y: 957 },
    rightSleeve: { x: 1000, y: 957 },
  });

  const [sizes, setSizes] = useState<Record<string, Size>>({
    front: { width: 150, height: 150 },
    back: { width: 150, height: 150 },
    leftSleeve: { width: 500, height: 500 },
    rightSleeve: { width: 500, height: 500 },
  });

  const handleDrag = (_e: DraggableEvent, data: { x: number; y: number }) => {
    setPositions((prev) => ({
      ...prev,
      [viewType]: { x: data.x, y: data.y },
    }));
  };

  const handleResize = (_e: React.SyntheticEvent, data: ResizeCallbackData) => {
    setSizes((prev) => ({
      ...prev,
      [viewType]: { width: data.size.width, height: data.size.height },
    }));
  };

  const [isFirstUpload, setIsFirstUpload] = useState(true);

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

  const handleFileSelect = async (file: File) => {
    try {
      // 1. Compress and store locally first
      const compressedFile = await compressImage(file);
      const localUrl = URL.createObjectURL(compressedFile);

      // Store the file for later upload
      setDesignFiles((prev) => ({
        ...prev,
        [viewType]: compressedFile,
      }));

      const initialPos = positions[viewType];
      const initialSize = sizes[viewType];

      setDesignsByView((prev) => ({
        ...prev,
        [viewType]: {
          image: localUrl,
          position: isFirstUpload ? initialPos : positions[viewType],
          size: initialSize,
        },
      }));

      setDesignImage(localUrl);

      if (isFirstUpload) {
        setPositions((prev) => ({
          ...prev,
          [viewType]: initialPos,
        }));
        setSizes((prev) => ({
          ...prev,
          [viewType]: initialSize,
        }));
        setIsFirstUpload(false);
      }
    } catch (err) {
      handleError(err, "Failed to process image");
    }
  };

  // Add image compression utility
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Max dimensions
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to file
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error("Failed to compress image"));
              }
            },
            "image/jpeg",
            0.8 // Quality (0.8 = 80%)
          );
        };
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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

  // First useEffect - Position and size updates when switching views
  useEffect(() => {
    const currentDesign = designsByView[viewType];
    if (currentDesign && currentDesign.position && currentDesign.size) {
      // Only update if the values are actually different
      if (
        positions[viewType].x !== currentDesign.position.x ||
        positions[viewType].y !== currentDesign.position.y ||
        sizes[viewType].width !== currentDesign.size.width ||
        sizes[viewType].height !== currentDesign.size.height
      ) {
        setPositions((prev) => ({
          ...prev,
          [viewType]: currentDesign.position,
        }));
        setSizes((prev) => ({
          ...prev,
          [viewType]: currentDesign.size,
        }));
      }
    }
  }, [viewType]); // Only depend on viewType changes

  // Add before the useEffect
  const currentPosition = positions[viewType];
  const currentSize = sizes[viewType];

  // Second useEffect - Update designsByView when position or size changes
  useEffect(() => {
    if (designsByView[viewType]?.image) {
      const currentDesign = designsByView[viewType];

      if (
        currentDesign &&
        (currentDesign.position.x !== currentPosition.x ||
          currentDesign.position.y !== currentPosition.y ||
          currentDesign.size.width !== currentSize.width ||
          currentDesign.size.height !== currentSize.height)
      ) {
        setDesignsByView((prev) => ({
          ...prev,
          [viewType]: {
            ...prev[viewType]!,
            position: currentPosition,
            size: currentSize,
          },
        }));
      }
    }
  }, [viewType, currentPosition, currentSize]);

  // Update the designImage calculation
  const currentDesignImage = designsByView[viewType]?.image || null;

  // Add new state for loading
  const [isSaving, setIsSaving] = useState(false);

  // Helper to generate a design hash
  const generateDesignHash = (designData: SavedDesign): string => {
    // Create a string of all image URLs and positions
    const designString = Object.entries(designData.designs)
      .map(([view, design]) => {
        if (!design) return "";
        return `${view}:${design.image}:${design.position.x}:${design.position.y}:${design.size.width}:${design.size.height}`;
      })
      .join("|");

    return `${designData.tshirtColor}|${designString}`;
  };

  // Update saveDesign function
  const saveDesign = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);

      // 1. Create design data first
      const designData: SavedDesign = {
        tshirtColor,
        designs: designsByView,
      };

      // 2. Generate hash for the current design
      const designHash = generateDesignHash(designData);

      // 3. Check if a similar design exists
      const user = auth.currentUser;
      if (user) {
        const designsRef = collection(db, "designs");
        const q = query(
          designsRef,
          where("userId", "==", user.uid),
          where("designHash", "==", designHash)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          if (!confirm("A similar design already exists. Save anyway?")) {
            return;
          }
        }

        // 4. Upload images to Cloudinary
        const uploadedFiles = new Map<string, string>();
        const uploadPromises = Object.entries(designFiles).map(
          async ([view, file]) => {
            if (!file) return [view, null];

            // Check if this exact file was already uploaded
            const fileHash = await hashFile(file);
            if (uploadedFiles.has(fileHash)) {
              return [view, uploadedFiles.get(fileHash)];
            }

            const imageUrl = await cloudinaryService.uploadDesignImage(file);
            uploadedFiles.set(fileHash, imageUrl);
            return [view, imageUrl];
          }
        );

        const uploadedUrls = Object.fromEntries(
          await Promise.all(uploadPromises)
        );

        // 5. Update design data with Cloudinary URLs
        const finalDesignData = {
          ...designData,
          designs: Object.entries(designData.designs).reduce(
            (acc, [view, design]) => ({
              ...acc,
              [view]: design
                ? {
                    ...design,
                    image: uploadedUrls[view] || design.image,
                  }
                : null,
            }),
            {} as SavedDesign["designs"]
          ),
        };

        // 6. Save to Firebase with hash
        await designService.saveDesign(user.uid, finalDesignData, designHash);

        // 7. Save to localStorage as backup
        localStorage.setItem("savedDesign", JSON.stringify(finalDesignData));
      }
    } catch (err) {
      handleError(err, "Failed to save design");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to generate hash for file
  const hashFile = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
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
          setPositions((prev) => ({
            ...prev,
            [viewType]: currentDesign.position,
          }));
          setSizes((prev) => ({
            ...prev,
            [viewType]: currentDesign.size,
          }));
        }
      }
    } catch (error) {
      console.warn("Could not load saved design:", error);
    }
  };

  // Add at the top with other state declarations
  const [designFiles, setDesignFiles] = useState<Record<string, File>>({});

  // Add cleanup useEffect
  useEffect(() => {
    return () => {
      // Cleanup local URLs when component unmounts
      Object.values(designsByView).forEach((design) => {
        if (design?.image?.startsWith("blob:")) {
          URL.revokeObjectURL(design.image);
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {error && (
        <div className="fixed top-4 right-4 z-50">
          <ErrorMessage
            message={error.message}
            type={error.type}
            onClose={clearError}
          />
        </div>
      )}
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
            hasDesign={!!currentDesignImage}
          />

          <DesignManagement
            onSave={saveDesign}
            onLoad={loadSavedDesign}
            isSaving={isSaving}
          />
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

              {currentDesignImage && (
                <foreignObject
                  width="100%"
                  height="100%"
                  mask="url(#tshirt-mask)"
                >
                  <div className="w-full h-full relative">
                    <DraggableDesign
                      designImage={currentDesignImage}
                      position={positions[viewType]}
                      size={sizes[viewType]}
                      onDrag={handleDrag}
                      onResize={handleResize}
                      initialPosition={positions[viewType]}
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

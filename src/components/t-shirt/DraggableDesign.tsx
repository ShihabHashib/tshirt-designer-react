import { DraggableEvent } from "react-draggable";
import { ResizeCallbackData, ResizableBox } from "react-resizable";
import Draggable from "react-draggable";

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface DraggableDesignProps {
  designImage: string;
  position: Position;
  size: Size;
  onDrag: (e: DraggableEvent, data: { x: number; y: number }) => void;
  onResize: (e: React.SyntheticEvent, data: ResizeCallbackData) => void;
  initialPosition: Position;
  bounds: { left: number; top: number; right: number; bottom: number };
  maxConstraints: [number, number];
  viewType: string;
}

export default function DraggableDesign({
  designImage,
  position,
  size,
  onDrag,
  onResize,
  initialPosition,
  bounds,
  maxConstraints,
  viewType,
}: DraggableDesignProps) {
  return (
    <Draggable
      position={position}
      onDrag={onDrag}
      bounds={bounds}
      defaultPosition={initialPosition}
    >
      <div className="absolute">
        <ResizableBox
          width={size.width}
          height={size.height}
          onResize={onResize}
          minConstraints={[50, 50]}
          maxConstraints={maxConstraints}
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
            <div className="size-indicator text-xs text-center">
              {Math.round(size.width)} × {Math.round(size.height)}
            </div>
            <div className="resize-guidelines">
              <div className="resize-guideline-h absolute top-1/2 -translate-y-1/2" />
              <div className="resize-guideline-v absolute left-1/2 -translate-x-1/2" />
            </div>
          </div>
        </ResizableBox>
      </div>
    </Draggable>
  );
}

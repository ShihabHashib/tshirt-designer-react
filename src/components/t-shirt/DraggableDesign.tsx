import React, { forwardRef } from "react";
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

const ResizeHandle = forwardRef<HTMLDivElement>((props, ref) => {
  const { handleAxis } = props as { handleAxis: string };

  const getHandleStyle = (axis: string) => {
    switch (axis) {
      case "se":
        return "bottom-0 right-0";
      case "sw":
        return "bottom-0 left-0";
      case "ne":
        return "top-0 right-0";
      case "nw":
        return "top-0 left-0";
      default:
        return "";
    }
  };

  return (
    <div
      ref={ref}
      className={`absolute w-3 h-3 bg-blue-500 opacity-0 group-hover:opacity-100 rounded-full cursor-${handleAxis}-resize transition-opacity ${getHandleStyle(
        handleAxis
      )}`}
    />
  );
});

ResizeHandle.displayName = "ResizeHandle";

const DraggableDesign = forwardRef<HTMLDivElement, DraggableDesignProps>(
  (
    {
      designImage,
      position,
      size,
      onDrag,
      onResize,
      initialPosition,
      bounds,
      maxConstraints,
      viewType,
    },
    ref
  ) => {
    const nodeRef = React.useRef<HTMLDivElement>(null);

    return (
      <Draggable
        position={position}
        onDrag={onDrag}
        bounds={bounds}
        defaultPosition={initialPosition}
        scale={1}
        handle=".drag-handle"
        positionOffset={{ x: 0, y: 0 }}
        nodeRef={nodeRef}
      >
        <div
          ref={nodeRef}
          className="absolute touch-none"
          style={{ transform: "translate(0,0)" }}
        >
          <ResizableBox
            width={size.width}
            height={size.height}
            onResize={onResize}
            minConstraints={[50, 50]}
            maxConstraints={maxConstraints}
            lockAspectRatio
            resizeHandles={["se", "sw", "ne", "nw"]}
            handleSize={[8, 8]}
            className="group relative"
            style={{ transformOrigin: "center center" }}
          >
            <div
              className="relative w-full h-full drag-handle cursor-move"
              style={{
                willChange: "transform",
                transform: "translateZ(0)",
              }}
            >
              <img
                src={designImage}
                alt="Design"
                className="w-full h-full object-contain select-none"
                draggable={false}
                loading="eager"
                style={{
                  willChange: "transform",
                  backfaceVisibility: "hidden",
                }}
              />
            </div>
          </ResizableBox>
        </div>
      </Draggable>
    );
  }
);

DraggableDesign.displayName = "DraggableDesign";

export default DraggableDesign;

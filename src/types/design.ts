export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface SavedDesign {
    tshirtColor: string;
    designs: {
        front: { image: string | null; position: Position; size: Size } | null;
        back: { image: string | null; position: Position; size: Size } | null;
        leftSleeve: { image: string | null; position: Position; size: Size } | null;
        rightSleeve: { image: string | null; position: Position; size: Size } | null;
    };
} 
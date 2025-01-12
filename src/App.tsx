import { useState } from "react";
import TshirtCanvas from "./components/TshirtCanvas";

export default function App() {
  const [designImage, setDesignImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">T-Shirt Designer</h1>
      <div className="max-w-2xl mx-auto">
        <TshirtCanvas
          designImage={designImage}
          setDesignImage={setDesignImage}
        />
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import DesignCard from "../components/DesignCard";
import { SavedDesign } from "../types/design";
import { useErrorHandler } from "../hooks/useErrorHandler";
import ErrorMessage from "../components/ErrorMessage";

interface Design {
  id: string;
  userId: string;
  designData: SavedDesign;
  createdAt: string;
}

export default function Designs() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { error, handleError, clearError } = useErrorHandler();

  const fetchDesigns = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const designsRef = collection(db, "designs");
      const q = query(
        designsRef,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const designsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Design[];

      setDesigns(designsData);
    } catch (err) {
      handleError(err, "Failed to fetch designs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, [user]);

  const handleLoadDesign = (design: SavedDesign) => {
    localStorage.setItem("savedDesign", JSON.stringify(design));
    navigate("/");
  };

  const handleDeleteDesign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this design?")) return;

    try {
      await deleteDoc(doc(db, "designs", id));
      await fetchDesigns(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete design:", err);
      handleError(err, "Failed to delete design");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Please log in to view your designs</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">My Designs</h1>
      {error && (
        <div className="mb-4">
          <ErrorMessage
            message={error.message}
            type={error.type}
            onClose={clearError}
          />
        </div>
      )}
      {!error && designs.length === 0 && (
        <div className="text-center text-gray-500">
          <p>No designs saved yet</p>
        </div>
      )}
      {!error && designs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => (
            <DesignCard
              key={design.id}
              id={design.id}
              designData={design.designData}
              createdAt={design.createdAt}
              onLoad={handleLoadDesign}
              onDelete={handleDeleteDesign}
            />
          ))}
        </div>
      )}
    </div>
  );
}

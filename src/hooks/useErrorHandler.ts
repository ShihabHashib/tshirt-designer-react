import { useState, useCallback } from "react";

interface ErrorState {
    message: string;
    type?: "error" | "warning" | "info";
}

export const useErrorHandler = () => {
    const [error, setError] = useState<ErrorState | null>(null);

    const handleError = useCallback((error: unknown, customMessage?: string) => {
        console.error(error);

        if (error instanceof Error) {
            setError({ message: customMessage || error.message, type: "error" });
        } else if (typeof error === "string") {
            setError({ message: customMessage || error, type: "error" });
        } else {
            setError({
                message: customMessage || "An unexpected error occurred",
                type: "error"
            });
        }

        // Auto-clear error after 5 seconds
        setTimeout(() => {
            setError(null);
        }, 5000);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return { error, handleError, clearError };
}; 
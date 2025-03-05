import { useEffect, useState } from "react";
import { useErrorStore } from "../../store/store";

export default function Toast() {
  const { errorMessage, setError } = useErrorStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (errorMessage) {
      setVisible(true);
      setTimeout(() => {
        setVisible(false);
        setError(null); // Clear error after fade-out
      }, 3000); // Hide toast after 3s
    }
  }, [errorMessage, setError]);

  if (!visible) return null; // Don't render if no error

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg transition-opacity duration-300">
      {errorMessage}
    </div>
  );
}

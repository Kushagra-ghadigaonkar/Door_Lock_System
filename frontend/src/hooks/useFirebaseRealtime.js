import { useState, useEffect } from "react";
import { realtimeDb } from "../firebase-config";
import { ref, onValue, off } from "firebase/database";

export const useFirebaseRealtime = (path, limit = 50) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        setError(new Error("Firebase connection timeout"));
        setLoading(false);
      }
    }, 5000);

    try {
      const dataRef = ref(realtimeDb, path);

      const unsubscribe = onValue(
        dataRef,
        (snapshot) => {
          try {
            clearTimeout(loadingTimeout);

            if (snapshot.exists()) {
              const firebaseData = snapshot.val();
              const dataArray = Object.keys(firebaseData).map((key) => ({
                id: key,
                ...firebaseData[key],
              }));

              // Sort by timestamp/entry_time (newest first)
              dataArray.sort((a, b) => {
                const timeA = new Date(a.entry_time || a.timestamp).getTime();
                const timeB = new Date(b.entry_time || b.timestamp).getTime();
                return timeB - timeA;
              });

              setData(dataArray.slice(0, limit));
            } else {
              setData([]);
            }
            setLoading(false);
            setError(null);
          } catch (err) {
            console.error("Firebase data processing error:", err);
            setError(err);
            setLoading(false);
          }
        },
        (err) => {
          console.error("Firebase connection error:", err);
          clearTimeout(loadingTimeout);
          setError(err);
          setLoading(false);
        }
      );

      return () => {
        clearTimeout(loadingTimeout);
        if (unsubscribe) {
          off(dataRef, "value", unsubscribe);
        }
      };
    } catch (err) {
      console.error("Firebase initialization error:", err);
      clearTimeout(loadingTimeout);
      setError(err);
      setLoading(false);
    }
  }, [path, limit]);

  return { data, loading, error };
};

import { useState, useEffect } from "react";
import { realtimeDb } from "../firebase-config";
import { ref, onValue } from "firebase/database";

export const useFirebaseRealtime = (path, limit = 50) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let loadingTimeout;

    try {
      const dataRef = ref(realtimeDb, path);

      loadingTimeout = setTimeout(() => {
        setError(new Error("Firebase connection timeout"));
        setLoading(false);
      }, 5000);

      const unsubscribe = onValue(
        dataRef,
        (snapshot) => {
          clearTimeout(loadingTimeout);

          if (snapshot.exists()) {
            const firebaseData = snapshot.val();

            const dataArray = Object.keys(firebaseData).map((key) => ({
              id: key,
              ...firebaseData[key],
            }));

            // Safe sorting (newest first)
            dataArray.sort((a, b) => {
              const timeA =
                typeof a.timestamp === "number"
                  ? a.timestamp
                  : new Date(a.entry_time || 0).getTime();

              const timeB =
                typeof b.timestamp === "number"
                  ? b.timestamp
                  : new Date(b.entry_time || 0).getTime();

              return timeB - timeA;
            });

            setData(dataArray.slice(0, limit));
          } else {
            setData([]);
          }

          setLoading(false);
          setError(null);
        },
        (err) => {
          clearTimeout(loadingTimeout);
          setError(err);
          setLoading(false);
        }
      );

      // ✅ Proper v9 cleanup
      return () => {
        clearTimeout(loadingTimeout);
        unsubscribe();
      };
    } catch (err) {
      clearTimeout(loadingTimeout);
      setError(err);
      setLoading(false);
    }
  }, [path, limit]);

  return { data, loading, error };
};
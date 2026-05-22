import { useCallback, useEffect, useState } from "react";

const wait = (delayMs) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, delayMs);
  });

export const useRetryableRequest = ({
  load,
  initialData,
  attempts = 3,
  retryDelayMs = 250,
}) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(1);
  const [requestKey, setRequestKey] = useState(0);

  const retry = useCallback(() => {
    setRequestKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      for (let nextAttempt = 1; nextAttempt <= attempts; nextAttempt += 1) {
        if (cancelled) return;
        setAttempt(nextAttempt);

        try {
          const nextData = await load();
          if (cancelled) return;
          setData(nextData);
          setError(null);
          setLoading(false);
          return;
        } catch (requestError) {
          if (cancelled) return;
          if (nextAttempt >= attempts) {
            setError(requestError);
            setLoading(false);
            return;
          }
          if (retryDelayMs > 0) {
            await wait(retryDelayMs);
          }
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [attempts, load, requestKey, retryDelayMs]);

  return {
    data,
    loading,
    error,
    attempt,
    retry,
  };
};

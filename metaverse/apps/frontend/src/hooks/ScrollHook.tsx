import { useRef, useCallback, useEffect } from "react";

export const useScrollAnimation = (customThreshold = 0.1) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const observedElementsRef = useRef<Set<Element>>(new Set());

  const initObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else {
            // entry.target.classList.remove('is-visible'); // Uncomment to re-animate on scroll up
          }
        });
      },
      { threshold: customThreshold },
    );
  }, [customThreshold]);

  useEffect(() => {
    initObserver();
    const currentObservedElements = new Set(observedElementsRef.current); // Create a copy
    currentObservedElements.forEach((el) => {
      if (el && observerRef.current) observerRef.current.observe(el);
    });
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [initObserver]);

  const addToObserve = useCallback((el: Element | null) => {
    if (el && observerRef.current && !observedElementsRef.current.has(el)) {
      observedElementsRef.current.add(el);
      observerRef.current.observe(el);
    }
  }, []);

  return addToObserve;
};

import React, { createContext, useContext, useState } from 'react';

const RecentlyViewedContext = createContext(null);

export function RecentlyViewedProvider({ children }) {
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recentlyViewed') || '[]'); } catch { return []; }
  });

  function addViewed(image) {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((img) => img.id !== image.id);
      const next = [image, ...filtered].slice(0, 10);
      localStorage.setItem('recentlyViewed', JSON.stringify(next));
      return next;
    });
  }

  return (
    <RecentlyViewedContext.Provider value={{ recentlyViewed, addViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  return useContext(RecentlyViewedContext);
}

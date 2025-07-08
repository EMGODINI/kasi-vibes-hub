import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

const GUEST_POST_LIMIT = 2;
const STORAGE_KEY = 'guest_posts_viewed';

export const useGuestLimit = () => {
  const { user } = useAuth();
  const [guestPostsViewed, setGuestPostsViewed] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    if (!user) {
      // Load from localStorage for guest users
      const stored = localStorage.getItem(STORAGE_KEY);
      setGuestPostsViewed(stored ? parseInt(stored, 10) : 0);
    } else {
      // Reset for authenticated users
      setGuestPostsViewed(0);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const trackPostView = () => {
    if (user) return; // No limit for authenticated users

    const newCount = guestPostsViewed + 1;
    setGuestPostsViewed(newCount);
    localStorage.setItem(STORAGE_KEY, newCount.toString());

    if (newCount >= GUEST_POST_LIMIT) {
      setShowLimitModal(true);
    }
  };

  const resetGuestLimit = () => {
    setGuestPostsViewed(0);
    localStorage.removeItem(STORAGE_KEY);
    setShowLimitModal(false);
  };

  const isLimitReached = !user && guestPostsViewed >= GUEST_POST_LIMIT;

  return {
    guestPostsViewed,
    isLimitReached,
    showLimitModal,
    setShowLimitModal,
    trackPostView,
    resetGuestLimit,
    remainingViews: Math.max(0, GUEST_POST_LIMIT - guestPostsViewed)
  };
};
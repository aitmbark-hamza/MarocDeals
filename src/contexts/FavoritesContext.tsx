import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { favoritesApi, offlineSyncQueue, auth } from '../lib/api';

interface FavoriteItem {
  _id: string;
  itemId: string;
  itemData: any;
  createdAt: string;
  updatedAt: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  localFavorites: string[]; // For offline fallback
  toggleFavorite: (productId: string, productData?: any) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  favoritesCount: number;
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
  syncQueueSize: number;
  refreshFavorites: () => Promise<void>;
  clearError: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [localFavorites, setLocalFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Load local favorites on mount
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setLocalFavorites(storedFavorites);
  }, []);

  // Setup online/offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Process sync queue when coming back online
      offlineSyncQueue.processQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load favorites from API when user is authenticated
  const loadFavorites = useCallback(async () => {
    if (!auth.isAuthenticated()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await favoritesApi.getFavorites(1000, 0);
      if (response.success) {
        setFavorites(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to load favorites');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load favorites';
      setError(errorMessage);
      console.error('Error loading favorites:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load favorites when component mounts or auth status changes
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const refreshFavorites = useCallback(async () => {
    await loadFavorites();
  }, [loadFavorites]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const toggleFavorite = async (productId: string, productData?: any) => {
    if (!auth.isAuthenticated()) {
      // Fallback to localStorage when not authenticated
      const updatedFavorites = localFavorites.includes(productId)
        ? localFavorites.filter(id => id !== productId)
        : [productId, ...localFavorites];

      setLocalFavorites(updatedFavorites);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      return;
    }

    setIsLoading(true);
    setError(null);

    const isCurrentlyFavorite = favorites.some(fav => fav.itemId === productId);

    try {
      if (isCurrentlyFavorite) {
        // Remove favorite
        const favoriteToRemove = favorites.find(fav => fav.itemId === productId);
        if (favoriteToRemove) {
          if (isOnline) {
            await favoritesApi.removeFavorite(favoriteToRemove._id);
          } else {
            // Add to offline sync queue
            offlineSyncQueue.addToQueue('remove', productId);
          }
        }
      } else {
        // Add favorite
        if (isOnline) {
          await favoritesApi.addFavorite(productId, productData || { productId });
        } else {
          // Add to offline sync queue
          offlineSyncQueue.addToQueue('add', productId, productData || { productId });
        }
      }

      // Refresh favorites to get updated state
      await loadFavorites();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle favorite';
      setError(errorMessage);
      console.error('Error toggling favorite:', err);

      // Fallback to localStorage on error
      const updatedFavorites = localFavorites.includes(productId)
        ? localFavorites.filter(id => id !== productId)
        : [productId, ...localFavorites];

      setLocalFavorites(updatedFavorites);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } finally {
      setIsLoading(false);
    }
  };

  const isFavorite = (productId: string) => {
    // Check API favorites first (if authenticated)
    if (auth.isAuthenticated()) {
      return favorites.some(fav => fav.itemId === productId);
    }

    // Fallback to localStorage
    return localFavorites.includes(productId);
  };

  const value = {
    favorites,
    localFavorites,
    toggleFavorite,
    isFavorite,
    favoritesCount: auth.isAuthenticated() ? favorites.length : localFavorites.length,
    isLoading,
    error,
    isOnline,
    syncQueueSize: offlineSyncQueue.getQueueSize(),
    refreshFavorites,
    clearError
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchCurrentUser } from "../api/iam-client";

interface IAMContextType {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: any | null;
  setAccessToken: (token: string) => void;
}

const IAMContext = createContext<IAMContextType | undefined>(undefined);

export function IAMProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    async function loadAuth() {
      if (accessToken) {
        const currentUser = await fetchCurrentUser(accessToken);
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setIsLoaded(true);
    }
    loadAuth();
  }, [accessToken]);

  const value = {
    isLoaded,
    isSignedIn: !!user,
    user,
    setAccessToken,
  };

  return <IAMContext.Provider value={value}>{children}</IAMContext.Provider>;
}

export function useIAM() {
  const context = useContext(IAMContext);
  if (context === undefined) {
    throw new Error("useIAM must be used within an IAMProvider");
  }
  return context;
}

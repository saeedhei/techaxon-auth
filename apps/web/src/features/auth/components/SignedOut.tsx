"use client";
import { useIAM } from "./IAMProvider";

export function SignedOut({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useIAM();
  if (!isLoaded || isSignedIn) return null;
  return <>{children}</>;
}

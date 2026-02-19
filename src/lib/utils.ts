import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { jwtDecode } from 'jwt-decode';

type JwtPayload = {
  exp?: number; // expiration timestamp (seconds)
};

/**
 * Checks whether a JWT stored in localStorage is expired.
 * @param storageKey - The localStorage key where the token is stored.
 * @returns true if expired or invalid, false if valid.
 */
export function isTokenExpired(storageKey: string): boolean {
  try {
    const token = localStorage.getItem(storageKey);

    if (!token) {
      return true; // No token = treated as expired
    }

    const decoded = jwtDecode<JwtPayload>(token);

    if (!decoded.exp) {
      return true; // No expiration claim = treat as invalid
    }

    const currentTime = Date.now() / 1000; // convert ms → seconds

    return decoded.exp < currentTime;
  } catch (error) {
    // If decoding fails, treat token as invalid/expired
    return true;
  }
}

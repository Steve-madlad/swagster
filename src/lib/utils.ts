import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import type { FieldProps } from '@/components/form/FormBuilder';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';

type JwtPayload = {
  exp?: number;
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
      return true;
    }

    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.exp) {
      return true;
    }

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

export function copyToClipboard(text?: string) {
  if (!text) return;

  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast.success('Copied to clipboard!');
    })
    .catch((err) => {
      toast.error('Failed to copy');
      console.error('Failed to copy:', err);
    });
}

export const manualTokenField = (inputDescription?: string, defaultValue?: string): FieldProps => ({
  name: 'Access Token',
  type: 'string',
  required: true,
  censored: true,
  defaultValue,
  description: 'The authentication token. Accepts standard Bearer JWTs, UUIDs, or opaque API keys.',
  inputDescription:
    inputDescription ||
    'Obtain your token from your API provider and paste it here to authenticate your requests.',
});

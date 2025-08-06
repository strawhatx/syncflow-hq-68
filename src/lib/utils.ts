import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getImagePath = (icon_name: string) => {
  if (!icon_name) return;
  return `/svg/${icon_name}.svg`;
};

/**
 * Extracts secret fields from an object based on key patterns.
 * Returns an object with { secrets, rest }.
 */
export function extractSecrets<T extends Record<string, any>>(obj: T) {
  const secretKeyPatterns = ['password', 'connection_string','connectionstring', 'secret', 'key', 'token', 'api'];
  const secrets: Record<string, any> = {};
  const rest: Record<string, any> = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (secretKeyPatterns.some(pattern => key.toLowerCase().includes(pattern))) {
      secrets[key] = value;
    } else {
      rest[key] = value;
    }
  });

  return { secrets, rest };
}

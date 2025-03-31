import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to combine class names with Tailwind CSS support
 * Uses clsx for conditional class names and tailwind-merge for conflict resolution
 * 
 * @param {...ClassValue[]} inputs - Class names to combine (strings, objects, arrays)
 * @returns {string} Merged and deduplicated class names string
 * @example
 * cn('px-2 py-1', { 'bg-blue-500': isActive }, ['hover:bg-blue-600'])
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merges Tailwind classes and removes conflicts (e.g., 'p-2' and 'p-4')
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

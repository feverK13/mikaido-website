import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/* Кастомні токени з styles/mikaido-theme.css (@theme і @utility) мають бути відомі tailwind-merge,
   інакше він не відрізняє text-px11 від кольору й прибирає його поруч із text-muted чи text-fg,
   а різні значення одного токена (space-2 і space-4, duration-fast і duration-base) не зливає.
   Кольори тут не потрібні: tailwind-merge приймає будь-яке ім'я після bg-, text-, border-. */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['h48', 'h30', 'h24', 'h20', 't18', 't16', 't14', 't13', 'px11', 'px22', 'px33', 'px44'],
      spacing: ['space-1', 'space-2', 'space-3', 'space-4', 'space-5', 'space-6', 'space-7', 'tap'],
      radius: ['r0', 'r2', 'r3'],
      shadow: ['modal', 'paper'],
      ease: ['out-mk', 'inout-mk'],
    },
    classGroups: {
      duration: [{ duration: ['instant', 'fast', 'base', 'slow'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

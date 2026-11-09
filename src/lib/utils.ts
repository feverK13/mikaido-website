import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/* Розміри тексту з теми (text-h30, text-px11 тощо) мають бути відомі tailwind-merge як font-size,
   інакше він приймає їх за колір і прибирає разом із text-muted чи text-fg. */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['h48', 'h30', 'h24', 'h20', 't18', 't16', 't14', 't13', 'px11', 'px22', 'px33', 'px44'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

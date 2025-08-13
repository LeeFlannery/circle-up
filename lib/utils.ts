// Simple replacement for clsx and tailwind-merge
export type ClassValue = string | number | boolean | undefined | null | ClassValue[]

function clsx(...inputs: ClassValue[]): string {
  const classes: string[] = []

  for (const input of inputs) {
    if (!input) continue

    if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input))
    } else if (Array.isArray(input)) {
      const result = clsx(...input)
      if (result) classes.push(result)
    }
  }

  return classes.join(" ")
}

// Simple class name merger (basic version of tailwind-merge)
function twMerge(classNames: string): string {
  return classNames
    .split(" ")
    .filter(Boolean)
    .filter((className, index, array) => {
      // Basic deduplication - keep the last occurrence of each class
      const lastIndex = array.lastIndexOf(className)
      return index === lastIndex
    })
    .join(" ")
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs))
}

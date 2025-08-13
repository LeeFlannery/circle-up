// Simple replacement for class-variance-authority
export type VariantProps<T> = T extends (...args: any[]) => any ? Parameters<T>[0] : never

export function cva(base: string, config?: any) {
  return (props?: any) => {
    if (!config || !props) return base

    let classes = base

    if (config.variants) {
      Object.keys(props).forEach((key) => {
        const variant = config.variants[key]
        const value = props[key]
        if (variant && variant[value]) {
          classes += ` ${variant[value]}`
        }
      })
    }

    return classes
  }
}

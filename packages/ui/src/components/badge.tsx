import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-[12px] border px-3 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-[#e8e8ea] bg-white text-zinc-800 shadow-[0_1px_2px_rgba(15,23,42,0.012)]',
        secondary: 'border-transparent bg-zinc-100 text-zinc-600',
        outline: 'border-[#e8e8ea] bg-white text-zinc-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-white',
  {
    variants: {
      variant: {
        default: 'border border-[#e8e8ea] bg-white text-zinc-700 shadow-[0_1px_2px_rgba(15,23,42,0.015)] hover:bg-zinc-50',
        secondary: 'border border-transparent bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80',
        outline: 'border border-[#e8e8ea] bg-white text-zinc-500 shadow-[0_1px_2px_rgba(15,23,42,0.012)] hover:bg-zinc-50'
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 rounded-xl px-3 text-[13px]',
        lg: 'h-11 rounded-[16px] px-6'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode
}

function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }

import * as React from 'react'

import { cn } from '../lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-[12px] border border-[#e8e8ea] bg-white px-4 text-sm text-zinc-950 outline-none shadow-[0_1px_2px_rgba(15,23,42,0.012)] transition-[color,box-shadow,border-color] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 focus-visible:border-sky-200 focus-visible:ring-2 focus-visible:ring-sky-500/24 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export { Input }

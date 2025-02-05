declare module 'lucide-react/icons/*' {
  import type { LucideProps } from 'lucide-react/dist/types/types'
  import type { ForwardRefExoticComponent } from 'react'

  const cmp: ForwardRefExoticComponent<LucideProps>

  export = cmp
}

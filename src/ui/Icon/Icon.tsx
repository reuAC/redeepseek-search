import type { SVGProps } from 'react'
import { ICONS, type IconName } from './icons'

export type { IconName }

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
}

export function Icon({ name, size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
      <path d={ICONS[name]} />
    </svg>
  )
}

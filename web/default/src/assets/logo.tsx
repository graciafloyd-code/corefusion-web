/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { type SVGProps } from 'react'
import { cn } from '@/lib/utils'

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      id='corefusion-logo'
      viewBox='0 0 100 100'
      xmlns='http://www.w3.org/2000/svg'
      height='100'
      width='100'
      fill='none'
      className={cn('size-6', className)}
      {...props}
    >
      <title>CoreFusion</title>
      <polygon
        points='50,15 80.31,32.5 80.31,67.5 50,85 19.69,67.5 19.69,32.5'
        stroke='#1F57F0'
        strokeWidth='2.4'
        strokeLinejoin='round'
        fill='none'
      />
      <line
        x1='50'
        y1='50'
        x2='50'
        y2='15'
        stroke='#13B5AB'
        strokeWidth='2.2'
        strokeLinecap='round'
      />
      <line
        x1='50'
        y1='50'
        x2='80.31'
        y2='67.5'
        stroke='#13B5AB'
        strokeWidth='2.2'
        strokeLinecap='round'
      />
      <line
        x1='50'
        y1='50'
        x2='19.69'
        y2='67.5'
        stroke='#13B5AB'
        strokeWidth='2.2'
        strokeLinecap='round'
      />
      <circle cx='50' cy='15' r='3.2' fill='#1F57F0' />
      <circle cx='80.31' cy='32.5' r='3.2' fill='#1F57F0' />
      <circle cx='80.31' cy='67.5' r='3.2' fill='#1F57F0' />
      <circle cx='50' cy='85' r='3.2' fill='#1F57F0' />
      <circle cx='19.69' cy='67.5' r='3.2' fill='#1F57F0' />
      <circle cx='19.69' cy='32.5' r='3.2' fill='#1F57F0' />
      <circle cx='50' cy='50' r='6.4' fill='#0C1B30' />
      <circle cx='50' cy='50' r='2.7' fill='#13B5AB' />
    </svg>
  )
}

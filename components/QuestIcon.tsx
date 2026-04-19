/**
 * QuestIcon — renders a polished SVG icon for a quest based on its emoji/type.
 * Falls back to the emoji if no matching icon exists.
 */

import Image from 'next/image'

const ICON_MAP: Record<string, string> = {
  '🐉': '/assets/quest-icons/dishes.svg',
  '🧺': '/assets/quest-icons/laundry.svg',
}

interface QuestIconProps {
  emoji: string
  size?: number
  className?: string
}

export function QuestIcon({ emoji, size = 48, className = '' }: QuestIconProps) {
  const svgPath = ICON_MAP[emoji]

  if (svgPath) {
    return (
      <Image
        src={svgPath}
        alt={emoji}
        width={size}
        height={size}
        className={className}
      />
    )
  }

  // Fallback: render emoji in a styled container
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ fontSize: size * 0.7, lineHeight: 1, width: size, height: size }}
    >
      {emoji}
    </span>
  )
}

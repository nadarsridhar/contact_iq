import React from 'react'

interface PhoneDialpadClearIconProps {
  size?: number
  color?: string
  className?: string
  onClick?: () => void
}

export default function DialpadClearIcon({
  size = 24,
  color = 'currentColor',
  className = '',
  onClick
}: PhoneDialpadClearIconProps = {}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`phone-dialpad-clear-icon ${className}`}
      onClick={onClick}
      aria-hidden="true"
      role="img"
    >
      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
      <line x1="18" y1="9" x2="12" y2="15" />
      <line x1="12" y1="9" x2="18" y2="15" />
    </svg>
  )
}
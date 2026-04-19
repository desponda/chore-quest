'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'

interface IconOption {
  id: string
  label: string
}

interface IconPickerProps {
  name: string
  options: readonly IconOption[]
  defaultValue?: string
  color?: string
}

export function IconPicker({ name, options, defaultValue, color = '#d8b4fe' }: IconPickerProps) {
  const [selected, setSelected] = useState(defaultValue ?? options[0].id)

  return (
    <div>
      <input type="hidden" name={name} value={selected} />
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              title={opt.label}
              onClick={() => setSelected(opt.id)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-150"
              style={{
                background: active
                  ? 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(124,58,237,0.2))'
                  : 'rgba(255,255,255,0.04)',
                border: active
                  ? '2px solid rgba(168,85,247,0.8)'
                  : '2px solid rgba(255,255,255,0.08)',
                boxShadow: active ? '0 0 10px rgba(168,85,247,0.35)' : 'none',
                transform: active ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              <Icon
                icon={opt.id}
                width={28}
                height={28}
                color={active ? color : 'rgba(156,163,175,0.6)'}
              />
              <span
                className="text-xs leading-none"
                style={{ color: active ? 'rgba(196,167,255,0.9)' : 'rgba(107,114,128,0.8)', fontSize: 9 }}
              >
                {opt.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

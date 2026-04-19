'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AVATAR_CLASSES } from '@/lib/icons'

export function AvatarPicker() {
  const [selected, setSelected] = useState<string>(AVATAR_CLASSES[0].f)

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="avatar" value={selected} />
      {AVATAR_CLASSES.map((cls) => (
        <div key={cls.class} className="flex items-center gap-3">
          <span className="text-gray-500 text-xs w-14 text-right flex-shrink-0" style={{ fontFamily: "'Cinzel', serif", fontSize: 10 }}>
            {cls.class}
          </span>
          {[
            { id: cls.f, gender: '♀' },
            { id: cls.m, gender: '♂' },
          ].map(({ id, gender }) => {
            const active = selected === id
            return (
              <button
                key={id}
                type="button"
                title={`${cls.class} ${gender}`}
                onClick={() => setSelected(id)}
                className="relative flex-shrink-0 transition-all duration-150"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: active
                    ? '0 0 0 3px rgba(168,85,247,1), 0 0 14px rgba(168,85,247,0.6)'
                    : '0 0 0 2px rgba(255,255,255,0.1)',
                  opacity: active ? 1 : 0.45,
                  filter: active ? 'none' : 'grayscale(0.4)',
                  transform: active ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                <Image
                  src={`/assets/avatars/${id}.png`}
                  alt={`${cls.class} ${gender}`}
                  fill
                  className="object-cover"
                  sizes="52px"
                />
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/**
 * Central icon registry for ChoreQuest.
 * All icons use game-icons.net (CC BY 3.0) via @iconify/react.
 *
 * Storage convention: quest.emoji and reward.emoji fields in the DB
 * now store the full iconify ID string, e.g. "game-icons:dragon-head".
 *
 * Attribution: Icons by Lorc, Delapouite, and contributors at game-icons.net under CC BY 3.0
 */

/** Icon options shown in the quest creation / edit picker */
export const QUEST_ICON_OPTIONS = [
  { id: 'game-icons:dragon-head',      label: 'Dragon' },
  { id: 'game-icons:washing-machine',  label: 'Laundry' },
  { id: 'game-icons:magic-broom',      label: 'Sweep' },
  { id: 'game-icons:vacuum-cleaner',   label: 'Vacuum' },
  { id: 'game-icons:trash-can',        label: 'Trash' },
  { id: 'game-icons:fork-knife-spoon', label: 'Kitchen' },
  { id: 'game-icons:broom',            label: 'Broom' },
  { id: 'game-icons:empty-wood-bucket',label: 'Mop' },
  { id: 'game-icons:clothesline',      label: 'Clothes' },
  { id: 'game-icons:anvil',            label: 'Forge' },
  { id: 'game-icons:soap',             label: 'Clean' },
  { id: 'game-icons:sprout',           label: 'Garden' },
  { id: 'game-icons:dog-house',        label: 'Pets' },
  { id: 'game-icons:cat',              label: 'Cats' },
  { id: 'game-icons:book-pile',        label: 'Reading' },
  { id: 'game-icons:star-formation',   label: 'Stars' },
  { id: 'game-icons:crossed-swords',   label: 'Battle' },
  { id: 'game-icons:ancient-sword',    label: 'Quest' },
  { id: 'game-icons:scroll-unfurled',  label: 'Scroll' },
  { id: 'game-icons:crystal-wand',     label: 'Magic' },
  { id: 'game-icons:fire',             label: 'Fire' },
  { id: 'game-icons:crown',            label: 'Royal' },
  { id: 'game-icons:sickle',           label: 'Harvest' },
  { id: 'game-icons:hand-truck',       label: 'Haul' },
] as const

/** Icon options shown in the reward creation / edit picker */
export const REWARD_ICON_OPTIONS = [
  { id: 'game-icons:open-treasure-chest', label: 'Treasure' },
  { id: 'game-icons:film-projector',      label: 'Movie' },
  { id: 'game-icons:joystick',            label: 'Gaming' },
  { id: 'game-icons:fork-knife-spoon',    label: 'Dinner' },
  { id: 'game-icons:moon',               label: 'Late Night' },
  { id: 'game-icons:crown',              label: 'Royal' },
  { id: 'game-icons:magic-potion',       label: 'Treat' },
  { id: 'game-icons:beveled-star',       label: 'Star' },
  { id: 'game-icons:coins',             label: 'Bonus' },
  { id: 'game-icons:fairy-wand',         label: 'Wish' },
  { id: 'game-icons:witch-flight',       label: 'Adventure' },
  { id: 'game-icons:crystal-wand',       label: 'Magic' },
] as const

export const DIFFICULTY_ICON_MAP: Record<string, string> = {
  easy:      'game-icons:shield',
  medium:    'game-icons:broadsword',
  hard:      'game-icons:dragon-head',
  legendary: 'game-icons:crown',
}

/** Avatar choices for hero creation — illustrated portrait PNGs, male & female variants */
export const AVATAR_CLASSES = [
  { class: 'Wizard',  f: 'wizard-f',  m: 'wizard-m'  },
  { class: 'Elf',     f: 'elf-f',     m: 'elf-m'     },
  { class: 'Viking',  f: 'viking-f',  m: 'viking-m'  },
  { class: 'Rogue',   f: 'rogue-f',   m: 'rogue-m'   },
  { class: 'Warrior', f: 'warrior-f', m: 'warrior-m' },
  { class: 'Witch',   f: 'witch-f',   m: 'witch-m'   },
  { class: 'Dwarf',   f: 'dwarf-f',   m: 'dwarf-m'   },
  { class: 'Monk',    f: 'monk-f',    m: 'monk-m'    },
] as const

export const AVATAR_OPTIONS = AVATAR_CLASSES.flatMap(c => [
  { id: c.f, label: `${c.class} ♀`, src: `/assets/avatars/${c.f}.png` },
  { id: c.m, label: `${c.class} ♂`, src: `/assets/avatars/${c.m}.png` },
])

export type AvatarId = string

export function avatarSrc(id: string): string {
  const opt = AVATAR_OPTIONS.find(a => a.id === id)
  return opt?.src ?? '/assets/avatars/wizard-f.png'
}

export const UI_ICONS = {
  coin:          'game-icons:coins',
  chest:         'game-icons:open-treasure-chest',
  scroll:        'game-icons:scroll-unfurled',
  sword:         'game-icons:ancient-sword',
  crossedSwords: 'game-icons:crossed-swords',
  star:          'game-icons:beveled-star',
  flame:         'game-icons:fire',
  potion:        'game-icons:health-potion',
  lock:          'game-icons:padlock',
  crown:         'game-icons:crown',
  shield:        'game-icons:shield',
} as const

/** Icon stored in DB is always a full iconify ID, e.g. "game-icons:dragon-head" */
export function resolveIcon(stored: string): string {
  return stored || 'game-icons:scroll-unfurled'
}

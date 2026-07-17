import { it } from './it'
import { en } from './en'

export const LINGUE = { it, en }

export function rilevaLinguaDispositivo() {
  return navigator.language?.toLowerCase().startsWith('it') ? 'it' : 'en'
}

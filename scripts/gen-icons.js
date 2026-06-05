// Genera le icone PNG dell'app dall'SVG sorgente
// Uso: node scripts/gen-icons.js
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const svg = readFileSync(resolve(root, 'public/icon.svg'))

await sharp(svg).resize(512).png().toFile(resolve(root, 'public/icons/icon-512.png'))
await sharp(svg).resize(192).png().toFile(resolve(root, 'public/icons/icon-192.png'))
await sharp(svg).resize(32).png().toFile(resolve(root, 'public/favicon.png'))

console.log('✓ public/icons/icon-512.png')
console.log('✓ public/icons/icon-192.png')
console.log('✓ public/favicon.png')

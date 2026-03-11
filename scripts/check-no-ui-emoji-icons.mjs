import { readFileSync, statSync, readdirSync } from 'node:fs'
import { resolve, extname, relative } from 'node:path'

const projectRoot = process.cwd()
const targets = [
  resolve(projectRoot, 'components'),
  resolve(projectRoot, 'pages'),
  resolve(projectRoot, 'utils/constants.ts'),
]

const validExtensions = new Set(['.vue', '.ts'])
const emojiRegex = /(?:\p{Extended_Pictographic}|[\u2713\u2714\u2715\u2716])/u

function collectFiles(pathname, bucket) {
  const stats = statSync(pathname)

  if (stats.isFile()) {
    if (validExtensions.has(extname(pathname))) {
      bucket.push(pathname)
    }
    return
  }

  for (const entry of readdirSync(pathname, { withFileTypes: true })) {
    const fullPath = resolve(pathname, entry.name)

    if (entry.isDirectory()) {
      collectFiles(fullPath, bucket)
      continue
    }

    if (entry.isFile() && validExtensions.has(extname(fullPath))) {
      bucket.push(fullPath)
    }
  }
}

const files = []
for (const target of targets) {
  collectFiles(target, files)
}

const violations = []

for (const file of files) {
  const content = readFileSync(file, 'utf8')
  const lines = content.split('\n')

  lines.forEach((line, index) => {
    if (emojiRegex.test(line)) {
      violations.push({
        file: relative(projectRoot, file),
        line: index + 1,
        content: line.trim(),
      })
    }
  })
}

if (violations.length > 0) {
  console.error('Found emoji-like characters in UI icon guarded scope:')
  for (const violation of violations) {
    console.error(`- ${violation.file}:${violation.line}`)
    console.error(`  ${violation.content}`)
  }
  process.exit(1)
}

console.log(`Emoji icon guard passed (${files.length} files scanned).`)

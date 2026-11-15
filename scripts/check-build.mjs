import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve, relative } from 'node:path'

// Regression check for the old production-only failure: HTML components and
// unbundled scripts were requested at paths that did not exist in dist.
const root = fileURLToPath(new URL('../dist/', import.meta.url))
const html = await readFile(resolve(root, 'index.html'), 'utf8')
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
const idSet = new Set(ids)
assert.equal(ids.length, idSet.size, 'Production HTML contains duplicate IDs')
assert.match(html, /<header\b/, 'Navigation must be rendered into production HTML')
assert.match(html, /<footer\b/, 'Footer must be rendered into production HTML')
assert.match(html, /<h1\b/, 'Primary content must work without JavaScript')
assert.doesNotMatch(
  html,
  /<!-- app:|src\/js\/main\.js|\/components\/(navbar|footer)\.html/,
  'Unprocessed shell or legacy script found'
)

const base = new URL('https://example.test/wolfstrike/')
const files = new Set()
let fragments = 0
for (const tag of html.matchAll(/<(a|link|script|img|source|use)\b[^>]*>/g)) {
  for (const attribute of tag[0].matchAll(/\b(href|src|srcset)="([^"]+)"/g)) {
    const references =
      attribute[1] === 'srcset'
        ? attribute[2].split(',').map((item) => item.trim().split(/\s+/)[0])
        : [attribute[2]]
    for (const reference of references) {
      if (reference.startsWith('#')) {
        assert.ok(idSet.has(reference.slice(1)), `Broken fragment target: ${reference}`)
        fragments += 1
        continue
      }
      const url = new URL(reference, base)
      if (url.origin !== base.origin) continue
      assert.ok(
        url.pathname.startsWith(base.pathname),
        `Asset escapes subdirectory deployment: ${reference}`
      )
      const path = resolve(root, decodeURIComponent(url.pathname.slice(base.pathname.length)))
      assert.ok(
        !relative(root, path).startsWith('..'),
        `Asset escapes output directory: ${reference}`
      )
      assert.ok((await stat(path)).isFile(), `Missing production asset: ${reference}`)
      files.add(path)
    }
  }
}
assert.equal([...html.matchAll(/<h1\b/g)].length, 1, 'Page must have one primary heading')
for (const link of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
  assert.match(link[0], /rel="[^"]*noopener[^\"]*"/, 'External tabs must be isolated')
}
const bundles = [...files].filter((path) => path.endsWith('.js'))
assert.ok(bundles.length > 0, 'Missing JavaScript entry bundle')
for (const path of bundles) {
  const code = await readFile(path, 'utf8')
  assert.doesNotMatch(
    code,
    /components\/(navbar|footer)\.html/,
    'Components must not be fetched at runtime'
  )
}
console.log(
  `Production checks passed: ${files.size} local assets, ${fragments} fragment links, one rendered header/footer, subdirectory-safe URLs.`
)

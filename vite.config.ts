import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// Inline the shared shell before Vite processes HTML and asset URLs.
// This also keeps navigation available without JavaScript.
function htmlComponents(): Plugin {
  const components = ['navbar', 'footer'] as const
  const paths = components.map((name) =>
    fileURLToPath(new URL(`./components/${name}.html`, import.meta.url))
  )
  const watchedPaths = new Set(paths.map((path) => path.replaceAll('\\', '/')))

  return {
    name: 'wolfstrike-html-components',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return components.reduce(
          (page, name, index) =>
            page.replace(`<!-- app:${name} -->`, readFileSync(paths[index], 'utf8')),
          html
        )
      },
    },
    configureServer(server) {
      server.watcher.add(paths)
      server.watcher.on('change', (path) => {
        if (watchedPaths.has(path.replaceAll('\\', '/'))) server.ws.send({ type: 'full-reload' })
      })
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [htmlComponents(), tailwindcss()],
})

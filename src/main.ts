import './input.css'
import { initializeDemo } from './demo'

document.documentElement.classList.add('js')
const lifetime = new AbortController()
const listenerOptions = { signal: lifetime.signal }
const cleanupTasks: Array<() => void> = []
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

// Mobile navigation: keyboard dismissal, outside click, and breakpoint cleanup.
const header = document.querySelector<HTMLElement>('#site-header')
const menuToggle = document.querySelector<HTMLButtonElement>('#menu-toggle')
const mobileMenu = document.querySelector<HTMLElement>('#mobile-menu')
if (header && menuToggle && mobileMenu) {
  function setMenuOpen(open: boolean, restoreFocus = false) {
    mobileMenu!.hidden = !open
    menuToggle!.setAttribute('aria-expanded', String(open))
    menuToggle!.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi')
    if (restoreFocus) menuToggle!.focus()
  }

  menuToggle.addEventListener(
    'click',
    () => setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true'),
    listenerOptions
  )
  mobileMenu.addEventListener(
    'click',
    (event) => {
      if (event.target instanceof Element && event.target.closest('a')) setMenuOpen(false)
    },
    listenerOptions
  )
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && !mobileMenu.hidden) setMenuOpen(false, true)
    },
    listenerOptions
  )
  document.addEventListener(
    'click',
    (event) => {
      if (event.target instanceof Node && !header.contains(event.target)) setMenuOpen(false)
    },
    listenerOptions
  )
  header.addEventListener(
    'focusout',
    (event) => {
      if (event.relatedTarget instanceof Node && !header.contains(event.relatedTarget))
        setMenuOpen(false)
    },
    listenerOptions
  )
  const desktop = window.matchMedia('(min-width: 901px)')
  desktop.addEventListener(
    'change',
    (event) => {
      if (event.matches) setMenuOpen(false)
    },
    listenerOptions
  )
}

// Copy actions keep their text available when clipboard access is denied.
const toast = document.querySelector<HTMLElement>('#copy-status')
let toastTimer: ReturnType<typeof setTimeout> | undefined
function notify(message: string) {
  if (!toast) return
  clearTimeout(toastTimer)
  toast.textContent = message
  toast.classList.add('is-visible')
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3500)
}

async function copyText(text: string) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
    await navigator.clipboard.writeText(text)
    notify('Teks berhasil disalin.')
  } catch {
    const dialog = document.querySelector<HTMLDialogElement>('#copy-fallback')
    const field = document.querySelector<HTMLTextAreaElement>('#copy-fallback-text')
    if (dialog && field) {
      field.value = text
      if (!dialog.open) dialog.showModal()
      field.focus()
      field.select()
    }
    notify('Clipboard tidak tersedia. Teks siap disalin secara manual.')
  }
}

document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
  button.addEventListener(
    'click',
    async () => {
      const target = button.dataset.copy ? document.getElementById(button.dataset.copy) : null
      if (target?.textContent) await copyText(target.textContent.trim())
    },
    listenerOptions
  )
})
cleanupTasks.push(initializeDemo(document, copyText))

// Animate only when an element is already on screen: content fails open if
// JavaScript, IntersectionObserver, or the Web Animations API is unavailable.
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        if (!reducedMotion.matches && 'animate' in entry.target) {
          entry.target.animate(
            [
              { opacity: 0.2, transform: 'translateY(18px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 550, easing: 'cubic-bezier(.2,.65,.3,1)' }
          )
        }
        revealObserver.unobserve(entry.target)
      })
    },
    { threshold: 0.08 }
  )
  document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element))
  cleanupTasks.push(() => revealObserver.disconnect())

  const navigationLinks = [...document.querySelectorAll<HTMLAnchorElement>('.desktop-nav a')]
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        navigationLinks.forEach((link) => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location')
          else link.removeAttribute('aria-current')
        })
      })
    },
    { rootMargin: '-15% 0px -65% 0px', threshold: 0 }
  )
  document
    .querySelectorAll('#home, #about, #fitur, #cara-kerja, #faq')
    .forEach((section) => sectionObserver.observe(section))
  cleanupTasks.push(() => sectionObserver.disconnect())
}

const year = document.querySelector('#year')
if (year) year.textContent = String(new Date().getFullYear())

document.addEventListener(
  'visibilitychange',
  () => {
    document.documentElement.classList.toggle('page-hidden', document.hidden)
  },
  listenerOptions
)

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    lifetime.abort()
    clearTimeout(toastTimer)
    cleanupTasks.forEach((cleanup) => cleanup())
  })
}

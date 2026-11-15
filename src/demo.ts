export type ScenarioId = 'ssh' | 'phishing' | 'ioc'

type InvestigationStep = {
  tool: string
  detail: string
}

export type Scenario = {
  id: string
  title: string
  prompt: string
  description: string
  severity: 'HIGH' | 'MEDIUM'
  technique: string
  recommendation: string
  steps: readonly InvestigationStep[]
}

// These are authored examples, not live threat intelligence or API responses.
// IPs and domains use documentation ranges and reserved example domains.
export const scenarios: Record<ScenarioId, Scenario> = {
  ssh: {
    id: 'DEMO-001',
    title: 'SSH brute force',
    prompt:
      'Analisis alert SSH ini. Ekstrak IOC, petakan teknik serangan, lalu susun rekomendasi respons.',
    description: 'Percobaan login SSH berulang pada satu host dari alamat IP yang sama.',
    severity: 'HIGH',
    technique: 'T1110',
    recommendation:
      'Validasi pola login, tinjau akses akun, lalu pertimbangkan pembatasan IP melalui kontrol keamanan yang sudah dikonfigurasi.',
    steps: [
      {
        tool: 'intake_incident',
        detail: 'Case DEMO-001 dibuat dari contoh alert SSH: 213 login gagal dalam 12 detik.',
      },
      {
        tool: 'triage_incident',
        detail: 'Pola percobaan autentikasi berulang → prioritas HIGH pada skenario ini.',
      },
      { tool: 'map_mitre_attack', detail: 'Perilaku dipetakan ke T1110 — Brute Force.' },
      {
        tool: 'investigate_incident',
        detail: 'IOC contoh 203.0.113.24 diekstrak. Konteks log dan hasil enrichment disandingkan.',
      },
      {
        tool: 'respond_and_report',
        detail:
          'Laporan dan rekomendasi siap ditinjau. Tidak ada tindakan blocking yang dieksekusi.',
      },
    ],
  },
  phishing: {
    id: 'DEMO-002',
    title: 'Phishing email',
    prompt:
      'Tinjau laporan email mencurigakan ini. Identifikasi domain, petakan perilaku phishing, dan rangkum langkah respons.',
    description:
      'Email yang meniru layanan internal meminta pengguna membuka halaman login yang mencurigakan.',
    severity: 'HIGH',
    technique: 'T1566',
    recommendation:
      'Validasi header dan URL email. Tinjau akun penerima, lalu koordinasikan isolasi pesan dan reset kredensial bila paparan terkonfirmasi.',
    steps: [
      {
        tool: 'intake_incident',
        detail: 'Laporan email manual dinormalisasi menjadi case DEMO-002.',
      },
      {
        tool: 'triage_incident',
        detail: 'Permintaan kredensial dan indikasi impersonasi → prioritas HIGH dalam contoh ini.',
      },
      { tool: 'map_mitre_attack', detail: 'Perilaku dipetakan ke T1566 — Phishing.' },
      {
        tool: 'investigate_incident',
        detail:
          'Domain login.example diekstrak dari bukti. Simulasi menggabungkan konteks pesan dan URL.',
      },
      {
        tool: 'respond_and_report',
        detail: 'Temuan dan rekomendasi disusun. Tidak ada email atau akun yang diubah.',
      },
    ],
  },
  ioc: {
    id: 'DEMO-003',
    title: 'Suspicious IOC',
    prompt:
      'Periksa indikator pada log koneksi ini. Korelasikan konteksnya dan susun rekomendasi investigasi lanjutan.',
    description: 'Sebuah host menunjukkan koneksi berulang ke domain yang belum dikenali oleh tim.',
    severity: 'MEDIUM',
    technique: 'T1071',
    recommendation:
      'Tinjau proses sumber, DNS, dan pola trafik. Validasi relevansi IOC sebelum memutuskan pemblokiran atau isolasi host.',
    steps: [
      {
        tool: 'intake_incident',
        detail: 'Cuplikan log koneksi contoh diterima sebagai case DEMO-003.',
      },
      {
        tool: 'triage_incident',
        detail:
          'Koneksi berkala memerlukan validasi tambahan → prioritas MEDIUM pada skenario ini.',
      },
      {
        tool: 'map_mitre_attack',
        detail:
          'Hipotesis ilustratif: T1071 — Application Layer Protocol. Belum konfirmasi serangan.',
      },
      {
        tool: 'investigate_incident',
        detail:
          'sync.example dan 198.51.100.18 diekstrak. Hasil reputasi dalam demo ini bersifat ilustratif.',
      },
      {
        tool: 'respond_and_report',
        detail: 'Laporan menyarankan pemeriksaan proses dan trafik. Tidak ada perubahan pada host.',
      },
    ],
  },
}

export function isScenarioId(value: string | undefined): value is ScenarioId {
  return value === 'ssh' || value === 'phishing' || value === 'ioc'
}

export function createDemoReport(scenario: Scenario): string {
  return [
    '# WolfStrike — Laporan Simulasi',
    '',
    'DATA CONTOH: bukan hasil analisis ancaman langsung. Tidak ada remediation yang dieksekusi.',
    '',
    `Case: ${scenario.id}`,
    `Skenario: ${scenario.title}`,
    `Severity ilustratif: ${scenario.severity}`,
    `MITRE ATT&CK (skenario): ${scenario.technique}`,
    '',
    '## Alur investigasi',
    ...scenario.steps.map((step, index) => `${index + 1}. ${step.tool}: ${step.detail}`),
    '',
    '## Rekomendasi untuk ditinjau operator',
    scenario.recommendation,
    '',
    'Validasi seluruh indikator dan konteks lingkungan sebelum mengambil tindakan.',
  ].join('\n')
}

function required<T extends Element>(root: Document, selector: string): T {
  const element = root.querySelector<T>(selector)
  if (!element) throw new Error(`WolfStrike demo: missing ${selector}`)
  return element
}

export function initializeDemo(root: Document, copy: (text: string) => Promise<void>) {
  const lifetime = new AbortController()
  const listenerOptions = { signal: lifetime.signal }
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-scenario]')]
  const panel = required<HTMLElement>(root, '#scenario-panel')
  const output = required<HTMLElement>(root, '#terminal-output')
  const runButton = required<HTMLButtonElement>(root, '#run-demo')
  const runLabel = required<HTMLElement>(root, '#run-demo span')
  const copyButton = required<HTMLButtonElement>(root, '#copy-report')
  const status = required<HTMLElement>(root, '#demo-status')
  const progress = required<HTMLElement>(root, '#demo-progress')
  const progressFill = required<HTMLElement>(root, '#demo-progress > span')
  const progressLabel = required<HTMLElement>(root, '#demo-progress-label')
  const recommendation = required<HTMLElement>(root, '#finding-recommendation')
  const motionPreference = root.defaultView?.matchMedia('(prefers-reduced-motion: reduce)')

  let activeScenario: ScenarioId = 'ssh'
  let timer: ReturnType<typeof setTimeout> | undefined
  let report: string | undefined
  let generation = 0
  let running = false

  function stop() {
    generation += 1
    clearTimeout(timer)
    timer = undefined
    running = false
    runButton.disabled = false
    panel.setAttribute('aria-busy', 'false')
  }

  function updateProgress(completed: number) {
    progress.setAttribute('aria-valuenow', String(completed))
    progressFill.style.width = `${completed * 20}%`
    progressLabel.textContent = `${completed} / 5`
  }

  function selectScenario(id: ScenarioId) {
    stop()
    activeScenario = id
    const scenario = scenarios[id]
    report = undefined
    copyButton.disabled = true
    tabs.forEach((tab) => {
      const selected = tab.dataset.scenario === id
      tab.setAttribute('aria-selected', String(selected))
      tab.tabIndex = selected ? 0 : -1
    })
    panel.setAttribute('aria-labelledby', `tab-${id}`)
    required(root, '#case-id').textContent = scenario.id
    required(root, '#findings-title').textContent = scenario.title
    required(root, '#scenario-prompt').textContent = scenario.prompt
    required(root, '#scenario-description').textContent = scenario.description
    const severity = required<HTMLElement>(root, '#finding-severity')
    severity.textContent = scenario.severity
    severity.dataset.level = scenario.severity
    required(root, '#finding-technique').textContent = scenario.technique
    recommendation.textContent = 'Jalankan simulasi untuk melihat rekomendasi penanganan.'
    status.textContent = 'Skenario siap'
    runLabel.textContent = 'Jalankan simulasi'
    updateProgress(0)
    const idle = root.createElement('p')
    idle.className = 'terminal-idle'
    idle.textContent = '› Pilih “Jalankan simulasi” untuk mengikuti investigasi.'
    output.replaceChildren(idle)
  }

  function run() {
    if (running) return
    stop()
    const currentGeneration = generation
    const scenario = scenarios[activeScenario]
    const reducedMotion = motionPreference?.matches ?? false
    let stepIndex = 0
    running = true
    report = undefined
    runButton.disabled = true
    copyButton.disabled = true
    runLabel.textContent = 'Menyimulasikan…'
    status.textContent = 'Simulasi berjalan'
    panel.setAttribute('aria-busy', 'true')
    recommendation.textContent = 'Menyusun konteks dan rekomendasi…'
    output.replaceChildren()
    updateProgress(0)

    function step() {
      if (currentGeneration !== generation) return
      const item = scenario.steps[stepIndex]
      const line = root.createElement('div')
      line.className = 'terminal-line'
      const check = root.createElement('span')
      check.textContent = '✓'
      check.setAttribute('aria-hidden', 'true')
      const detail = root.createElement('p')
      const tool = root.createElement('strong')
      tool.textContent = item.tool
      detail.append(tool, root.createTextNode(` ${item.detail}`))
      line.append(check, detail)
      output.append(line)
      stepIndex += 1
      updateProgress(stepIndex)

      if (stepIndex === scenario.steps.length) {
        running = false
        timer = undefined
        runButton.disabled = false
        copyButton.disabled = false
        panel.setAttribute('aria-busy', 'false')
        runLabel.textContent = 'Jalankan ulang'
        status.textContent = 'Simulasi selesai'
        recommendation.textContent = scenario.recommendation
        report = createDemoReport(scenario)
      } else if (reducedMotion) {
        step()
      } else {
        timer = setTimeout(step, 650)
      }
    }
    step()
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener(
      'click',
      () => {
        if (isScenarioId(tab.dataset.scenario)) selectScenario(tab.dataset.scenario)
      },
      listenerOptions
    )
    tab.addEventListener(
      'keydown',
      (event) => {
        let targetIndex: number
        switch (event.key) {
          case 'ArrowRight':
            targetIndex = (index + 1) % tabs.length
            break
          case 'ArrowLeft':
            targetIndex = (index - 1 + tabs.length) % tabs.length
            break
          case 'Home':
            targetIndex = 0
            break
          case 'End':
            targetIndex = tabs.length - 1
            break
          default:
            return
        }
        event.preventDefault()
        const next = tabs[targetIndex]
        if (isScenarioId(next.dataset.scenario)) selectScenario(next.dataset.scenario)
        next.focus()
      },
      listenerOptions
    )
  })
  runButton.addEventListener('click', run, listenerOptions)
  copyButton.addEventListener(
    'click',
    async () => {
      if (report) await copy(report)
    },
    listenerOptions
  )

  return () => {
    stop()
    lifetime.abort()
  }
}

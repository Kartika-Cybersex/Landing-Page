# WolfStrike landing page

Landing page untuk **WolfStrike**, MCP server yang membantu AI agent melakukan incident intake, triage, MITRE ATT&CK mapping, investigasi IOC, dan pelaporan.

## Menjalankan proyek

Gunakan Node.js yang kompatibel dengan versi Vite di `package.json`.

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run check:build
npm run preview
```

Hasil build tersedia di `dist/`. URL aset relatif mendukung deployment di root maupun subdirektori. Build tidak membutuhkan server backend.

## Struktur

- `index.html`: konten utama, ilustrasi, markup demo, dan dialog clipboard.
- `components/`: navbar dan footer yang disisipkan oleh Vite saat dev/build, bukan di-fetch saat runtime.
- `src/main.ts`: menu seluler, clipboard, animasi progresif, dan penanda navigasi.
- `src/demo.ts`: tiga skenario simulasi lokal beserta pengelolaan progres, pergantian tab, dan laporan.
- `src/input.css`: entry Tailwind; `src/style.css`: desain dan breakpoint responsif.
- `public/images/`: foto serigala dalam dua ukuran, disajikan dari build sendiri.
- `scripts/check-build.mjs`: pemeriksaan aset, anchor, shell HTML, dan dukungan deployment subdirektori.
- `docs/DESIGN.md`: analisis repo, riset referensi, keputusan desain, dan sumber visual.

## Batas demo dan klaim produk

Demo berjalan seluruhnya di browser dengan data yang sudah disiapkan. Tidak ada koneksi ke MCP, VirusTotal, SIEM, email, atau LLM. Tidak ada tindakan remediation yang dieksekusi. IP dan domain contoh menggunakan alamat dokumentasi dan domain `.example`.

Copy produk disesuaikan dengan README dan implementasi lokal `../csirt-skill-hermes`. Konektor blocking infrastruktur masih harus diimplementasikan dan dikonfigurasi di produk; landing page tidak mengklaim perlindungan otomatis yang sudah aktif.

CTA utama dan panduan setup tetap berada di halaman. Link GitHub menuju [repo produk](https://github.com/Kartika-Cybersex/csirt-skill-hermes), mengikuti origin repo produk lokal. Saat diperiksa tanpa autentikasi, URL tersebut mengembalikan HTTP 404. Karena itu halaman memberi keterangan bahwa akses repository diperlukan; jangan menganggap source sudah tersedia publik.

## Aksesibilitas dan motion

Navigasi dan konten utama tersedia tanpa JavaScript. Menu mendukung Escape, klik di luar, serta penutupan saat breakpoint desktop. Tab skenario mendukung ArrowLeft/ArrowRight, Home, dan End. FAQ menggunakan elemen `details` asli. Semua animasi dekoratif menghormati `prefers-reduced-motion`; simulasi ditampilkan langsung ketika preferensi tersebut aktif. Clipboard yang ditolak menyediakan dialog salin manual.

## Aset

Foto oleh **christels**, [Pixnio, CC0](https://pixnio.com/de/tiere/fuchse-and-wolfe/portrat-grauwolf-fell-tier-auge-kopf). Atribusi juga dicantumkan di footer dan `public/images/CREDITS.md`. Logo WolfStrike asli dipertahankan. Font menggunakan Google Fonts dengan fallback lokal.

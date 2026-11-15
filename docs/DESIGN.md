# WolfStrike — konteks dan arah desain

Riset dan implementasi: 15 November 2026.

## Konteks yang ditemukan

Repo ini menggunakan Vite, TypeScript, dan Tailwind CSS. Audiensnya adalah operator IT/security serta pengguna AI agent yang ingin melakukan investigasi dan respons insiden secara lebih terstruktur.

Sumber konteks produk: `../docs/project-overview.md`, `../csirt-skill-hermes/README.md`, dan pendaftaran tool dalam `../csirt-skill-hermes/index.ts`. WolfStrike adalah **MCP server**, bukan model AI atau pengganti CSIRT. Alurnya intake → triage → MITRE mapping → investigasi IOC → laporan/rekomendasi.

Pembacaan kode memperjelas batas produk: handler `respond_and_report` dapat menghasilkan catatan `BLOCKED`, tetapi belum memanggil firewall, Wazuh Active Response, atau EDR. Karena itu landing page tidak menjanjikan bahwa blocking infrastruktur sudah bekerja. Nama ekosistem menunjukkan konteks agent/tools yang direncanakan atau digunakan produk; bukan klaim sertifikasi, kemitraan, atau konektor siap pakai tanpa konfigurasi.

## Masalah awal

- Entry TypeScript masih berisi starter Vite, sementara halaman menggunakan JavaScript non-module yang tidak dipaketkan. Build awal mengeluarkan peringatan tentang script tersebut.
- Navbar/footer diambil dari `/components/*.html` melalui fetch, sedangkan file tersebut tidak masuk output build.
- CTA mengarah ke `#demo`, `#daftar`, dan `#aman` yang tidak tersedia; GitHub hanya menuju homepage GitHub.
- Copy belum menjelaskan MCP server, terdapat typo, dan ada klaim operasional yang melampaui implementasi saat ini.
- Bagian fitur berupa kartu teks seragam; belum ada pengalaman demo yang konkret, metadata deskripsi, atau favicon produk.

## Referensi yang diteliti

| Referensi primer                                                                               | Pembelajaran                                                                               | Keputusan untuk WolfStrike                                                                                                 |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| [Hermes Agent](https://hermes-agent.nousresearch.com/)                                         | Positioning produk, cara mulai, fitur, dan FAQ membentuk perjalanan pengunjung.            | Susun narasi produk yang konkret, dengan demo dan panduan mulai. Branding dan komposisi dibuat khusus WolfStrike.          |
| [Tines](https://www.tines.com/)                                                                | Penjelasan alur produk dan kendali pengguna membuat kapabilitas AI lebih mudah dipahami.   | Utamakan bukti, konteks, dan operator review. Tidak menyalin klaim atau testimoni mereka.                                  |
| [Socket](https://socket.dev/)                                                                  | Visual dan bahasa teknis membantu menjelaskan produk security.                             | Gunakan ilustrasi IOC dan terminal yang relevan dengan modul WolfStrike, tanpa metrik atau customer logo fiktif.           |
| [Lenis](https://lenis.dev/)                                                                    | Smooth scrolling dapat mendukung pengalaman presentasi.                                    | Scroll native dengan CSS sudah mencukupi; navigasi anchor dan kontrol browser dipertahankan.                               |
| [GSAP](https://gsap.com/) dan [matchMedia](<https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/>) | Timeline dan media conditions berguna untuk animasi kompleks.                              | Kebutuhan halaman cukup dengan CSS, IntersectionObserver, dan Web Animations API; tidak perlu dependency animasi tambahan. |
| [Vanta](https://www.vantajs.com/)                                                              | Latar WebGL menarik, tetapi sumbernya sendiri mencatat keterbatasan perangkat lama/mobile. | Gunakan foto lokal, grid, dan radar CSS yang ringan.                                                                       |
| [React Bits](https://reactbits.dev/)                                                           | Komponen animasi dapat menjadi inspirasi ritme dan interaksi visual.                       | Tidak menambahkan React pada repo Vite vanilla hanya untuk efek dekoratif.                                                 |

Ini adalah keputusan desain berdasarkan konteks produk dan implementasi, bukan kesimpulan riset konversi atau hasil A/B test. Referensi telah dibaca melalui web; inspeksi visual browser otomatis terhenti karena sistem tidak dapat memverifikasi URL browser Windows.

## Arah visual dan isi

**Konsep:** editorial security / the watchful eye. Hitam arang, putih hangat, dan aksen merah-oranye yang meneruskan identitas logo WolfStrike. Space Grotesk untuk headline, Inter untuk isi, JetBrains Mono untuk konteks teknis.

1. Hero asimetris dengan headline besar dan fotografi serigala berlatar gelap. Radar hanya menjadi lapisan dekoratif.
2. Ekosistem AI agent dan security tools memperjelas posisi MCP server.
3. Tiga kartu dengan hierarki berbeda menjelaskan investigasi, prioritas, dan respons.
4. Simulasi tiga skenario memperlihatkan alur, bukan mengaku sebagai console produk live.
5. Bagian terang menampilkan lima tahap kerja dan tanggung jawab operator.
6. Panduan mulai berada di halaman, dengan endpoint dan perintah dari README produk. Link sumber tetap mengikuti origin lokal, tetapi diberi keterangan akses diperlukan karena pemeriksaan HTTP publik mengembalikan 404. Klaim “open source” tidak digunakan; lisensi MIT disebut sesuai file lisensi lokal.
7. FAQ membahas batas kapabilitas dan kebutuhan setup; CTA akhir memberi langkah berikutnya.

Copy utama menggunakan Bahasa Indonesia; judul dan label singkat mempertahankan karakter developer-facing halaman awal. Tidak ada testimoni, statistik, pelanggan, atau hasil deteksi yang dikarang sebagai klaim produk.

## Copywriting yang dipertahankan

Deskripsi Hero, About, judul Feature, serta headline dan deskripsi CTA akhir mengikuti teks versi lama yang ditetapkan pemilik produk. Headline Hero diperbarui menjadi “Your Agent, Working Like a Professional CSIRT Team” sesuai arahan terbaru untuk membuang “Make”; tata bahasa dan ejaan Professional disesuaikan. About menjadi section tersendiri dengan `id="about"`, sementara Hero menggunakan `id="home"`.

FAQ menggunakan judul “Frequently Asked Questions” dan diringkas dari delapan menjadi lima pertanyaan. Dua pertanyaan tentang pengganti CSIRT digabung; dukungan server, persyaratan setup, dan penggunaan melalui AI agent dijelaskan dalam satu jawaban. Tiga topik utama tetap berada di urutan awal: peran CSIRT, server/setup, dan kondisi API LLM mati. Dua pertanyaan berikutnya menjelaskan demo lokal serta blocking ancaman. Desain, visual, demo interaktif, dan alur halaman tetap digunakan.

## Teknis dan aksesibilitas

- Navbar/footer disisipkan sebelum Vite memproses HTML melalui [`transformIndexHtml`](https://vite.dev/guide/api-plugin.html#transformindexhtml), sehingga aset dapat ditulis ulang sesuai base path dan shell tersedia tanpa JS.
- Semua gambar disimpan lokal, dengan sumber 1536 px dan 768 px melalui `picture`; tidak ada hotlink gambar.
- Tidak ada dependency runtime baru. Font memiliki fallback jika Google Fonts tidak tersedia.
- Mobile menu mendukung keyboard, Escape, klik di luar, dan reset pada desktop. Demo menggunakan pola ARIA tab dengan navigasi panah serta pembatalan timer saat skenario berganti.
- Motion mengikuti [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion). Reveal gagal secara terbuka: konten tetap tampil bila API animasi tidak tersedia.
- Demo tidak meminta data, tidak menjalankan perintah, tidak memanggil API security, dan tidak membutuhkan backend.

## Sumber visual

Foto **christels**, [Pixnio](https://pixnio.com/de/tiere/fuchse-and-wolfe/portrat-grauwolf-fell-tier-auge-kopf), CC0. Halaman sumber menyatakan penggunaan pribadi dan komersial diperbolehkan. Ukuran turunan diunduh langsung dari URL gambar yang tercantum pada halaman sumber. Tidak ada penghapusan watermark atau penggunaan preview berbayar.

Logo utama menggunakan aset asli repo. Favicon dibuat dari path emblem merah pada logo tersebut.

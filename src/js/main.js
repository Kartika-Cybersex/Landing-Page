// =====================================
// COMPONENT LOADER
// =====================================

async function loadComponent(elementId, filePath) {
    const element = document.getElementById(elementId);

    if (!element) return;

    try {
        const response = await fetch(filePath);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        element.innerHTML = await response.text();

    } catch (error) {
        console.error(`Gagal memuat ${filePath}:`, error);
    }
}


// =====================================
// INITIALIZATION
// =====================================

document.addEventListener("DOMContentLoaded", async () => {

    // Load Navbar dan Footer
    await Promise.all([
        loadComponent("navbar", "/components/navbar.html"),
        loadComponent("footer", "/components/footer.html")
    ]);


    // =====================================
    // MOBILE NAVIGATION
    // =====================================

    const menuBtn = document.getElementById("menuBtn");
    const menu = document.getElementById("menu");

    if (menuBtn && menu) {

        menuBtn.addEventListener("click", () => {

            const isHidden = menu.classList.toggle("hidden");

            menuBtn.setAttribute(
                "aria-expanded",
                String(!isHidden)
            );

        });

        menu.addEventListener("click", (e) => {

            if (e.target.closest("a")) {

                menu.classList.add("hidden");

                menuBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        });

    }


    // =====================================
    // INCIDENT DEMO SIMULATION
    // =====================================

    const L = [
        ['03:14', 'DETEKTOR', '213 login gagal dari 45.13.22.7 dalam 12 detik', 'text-mut'],
        ['03:14', 'POLICY', 'block_ip, TTL 24 jam, bukan protected → otomatis', 'text-acc'],
        ['03:41', 'AGREGATOR', 'Login SSH berhasil dari IP lain setelah banyak kegagalan', 'text-mut'],
        ['03:41', 'AGREGATOR', 'User baru svc_update + authorized_keys berubah', 'text-mut'],
        ['03:42', 'AGREGATOR', 'Cron baru + koneksi keluar berkala ke 185.x.x.x', 'text-mut'],
        ['03:42', 'ANALYZER', 'Dugaan kompromi akun, severity KRITIS', 'text-acc'],
        ['03:42', 'POLICY', 'lock_account, kill_process → minta persetujuan', 'text-acc'],
        ['03:43', 'CHAT', 'Setujui aksi #A-77? [YA/TIDAK]', 'text-fg']
    ];

    const F = [
        ['Brute force SSH diblokir sementara', 'Rendah'],
        ['Kompromi akun via SSH', 'Kritis'],
        ['Persistensi: user + cron', 'Tinggi']
    ];

    const log = document.getElementById('log');
    const find = document.getElementById('find');

    if (log && find) {

        let i = 0;

        function esc(s) {
            return s.replace(/[&<>]/g, function(c) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;'
                }[c];
            });
        }

        function step() {

            if (i >= L.length) {

                setTimeout(() => {
                    log.innerHTML = '';
                    find.innerHTML = '';
                    i = 0;
                    step();
                }, 4000);

                return;
            }

            const r = L[i];

            const d = document.createElement('div');

            d.className = 'mb-1.5';

            d.innerHTML =
                '<span class="text-mut">[' + r[0] + ']</span> ' +
                '<span class="font-semibold ' + r[3] + '">' + r[1] + '</span> ' +
                esc(r[2]);

            log.appendChild(d);

            log.scrollTop = log.scrollHeight;

            const fi = {
                1: 0,
                5: 1,
                3: 2
            }[i];

            if (fi !== undefined) {

                const li = document.createElement('li');

                li.className = 'rounded-lg border border-line bg-bg2 p-3';

                li.innerHTML =
                    '<p class="font-medium">' + F[fi][0] + '</p>' +
                    '<p class="mt-0.5 text-xs text-acc">Severity: ' + F[fi][1] + '</p>';

                find.appendChild(li);

            }

            i++;

            setTimeout(step, 1100);

        }

        step();

    }


    // =====================================
    // DEMO FORM
    // =====================================

    const form = document.getElementById('f');
    const successMessage = document.getElementById('ok');

    if (form && successMessage) {

        form.addEventListener('submit', (e) => {

            e.preventDefault();

            successMessage.classList.remove('hidden');

            form.reset();

        });

    }

});
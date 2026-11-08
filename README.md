# My Site Measurement

Aplikasi web ringkas untuk merekod ukuran tapak dan lakaran awal bagi kerja interior design / renovation.

## Struktur projek (semua fail dalam satu folder)

```text
my-site-measurement/
├── index.html
├── style.css
├── app.js
├── measurement.js
├── sketch.js
├── storage.js
├── manifest.webmanifest
├── sw.js
└── README.md
```

## Fungsi versi 1
- Maklumat projek dan pelanggan
- Senarai ruang / bilik
- Rekod ukuran linear dalam mm
- Kiraan keluasan lantai dalam sqft dan m²
- Hand sketch menggunakan jari atau stylus
- Foto tapak dan nota
- Eksport backup JSON dan ukuran CSV
- Print / Save as PDF
- PWA asas untuk pemasangan pada telefon/tablet dan cache offline

## Upload ke GitHub
1. Extract ZIP ini.
2. Dalam repository GitHub, pilih **Add file → Upload files**.
3. Extract ZIP, kemudian pilih dan upload semua 9 fail yang berada dalam folder utama. Tidak perlu buat folder css atau js.
4. Commit changes ke branch `main`.
5. Pergi ke **Settings → Pages**.
6. Pilih **Deploy from a branch**, branch `main`, folder `/(root)`, kemudian Save.

## Nota penggunaan
- Untuk PWA dan service worker, laman perlu diakses melalui HTTPS (GitHub Pages menyediakannya).
- Data semasa disimpan secara setempat dalam browser/peranti melalui localStorage.
- Data tidak sync automatik antara telefon dan tablet lagi. Sync cloud memerlukan backend/database dan proses login.
- Export JSON secara berkala sebagai backup.
- Untuk membuka terus `index.html` sebagai file tempatan, sesetengah browser tidak membenarkan ES modules / service worker. Jalankan melalui GitHub Pages atau local development server.

## Cadangan fasa seterusnya
1. Sketch tools: garisan lurus, rectangle, pintu/tingkap, dimension labels, grid snap, redo.
2. Sync cloud dan akaun pengguna.
3. Laporan PDF berformat profesional.
4. Import ukuran laser Bluetooth (jika disokong melalui aplikasi native / bridge).

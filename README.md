# 🎉 Portfolio Website dengan Supabase

Versi final dengan database online & autentikasi yang aman!

---

## 📁 File yang Diperlukan

```
portfolio-supabase/
├── index.html
├── style.css
├── app.js
├── supabase-config.js  ← Sudah diisi dengan kredensial Anda
└── README.md
```

**Semua file harus berada dalam satu folder.**

---

## ✨ Fitur Lengkap

### Two-Side System
- 👁️ **Mode Pengunjung** (default) — Rekruter hanya bisa lihat
- 🔓 **Mode Admin** (login) — Anda bisa edit semua

### Database Online (Supabase)
- ✅ Data tersimpan permanen di cloud
- ✅ Bisa dilihat dari mana saja, kapan saja
- ✅ Sinkron otomatis antar device
- ✅ Backup otomatis oleh Supabase

### Autentikasi Aman
- ✅ Login pakai email & password Anda
- ✅ Password ter-hash di server
- ✅ Session-based (auto logout saat tutup browser)
- ✅ Tidak bisa di-bypass via DevTools

### Storage untuk File
- ✅ Upload CV, sertifikat, foto sampai 50MB
- ✅ Foto profil tersinkron ke cloud
- ✅ File bisa di-download semua orang

---

## 🔑 Login Admin Anda

```
Email: akbarprastowo16@gmail.com
Password: [yang Anda buat saat setup Supabase]
```

Klik tombol **"🔒 Login Admin"** di pojok kiri bawah saat membuka website.

---

## 🚀 Cara Deploy ke Internet (Gratis)

### Netlify (Direkomendasikan, paling mudah)

1. Buka https://netlify.com → daftar gratis (bisa via GitHub)
2. Klik **"Add new site" → "Deploy manually"**
3. **Drag & drop folder `portfolio-supabase`** ke area upload
4. Tunggu beberapa detik
5. Anda akan dapat URL seperti `https://random-name.netlify.app`
6. Bisa custom URL ke `https://nama-anda.netlify.app` di Settings

### URL Hasil Bisa Langsung Dibagikan!
- ✅ Ke rekruter via LinkedIn message
- ✅ Di CV/resume sebagai link portofolio
- ✅ Di bio Instagram/Twitter
- ✅ Email signature

---

## 📝 Cara Mengisi Konten Pertama Kali

1. Buka website (lokal atau online)
2. Klik **"🔒 Login Admin"** di pojok kiri bawah
3. Masukkan email & password Supabase Anda
4. Klik **"✎ Edit Profil"** di navbar atas
5. Isi semua data → klik **"Simpan"**
6. Tambah proyek, skills, pengalaman dari menu masing-masing
7. Upload CV & dokumen di menu **Dokumen**
8. Klik **Logout** saat selesai

Data Anda **otomatis tersimpan** di Supabase! Rekruter dari mana saja bisa lihat semuanya. 🎉

---

## 🛡️ Keamanan

- ✅ **Anon Key** boleh dipublish (sudah aman karena RLS)
- ✅ Data hanya bisa di-EDIT oleh yang login
- ✅ Data bisa di-BACA semua orang (untuk rekruter)
- ⚠️ **JANGAN** publish Secret Key Anda

---

## 🔧 Troubleshooting

### "Failed to fetch" atau data tidak muncul
- Cek koneksi internet
- Cek Supabase project masih aktif (login dashboard Supabase)
- Pastikan URL & key di `supabase-config.js` benar

### Tidak bisa login
- Cek email/password benar
- Pastikan akun di Supabase sudah "Confirmed"
- Coba reset password via Supabase Dashboard → Authentication → Users

### Upload file gagal
- Pastikan login admin dulu
- Cek size file tidak lebih dari 50MB
- Cek storage bucket `portfolio-files` masih ada

---

## 💡 Tips

- **Backup data** sesekali: ke Supabase Dashboard → Database → export
- **Update profil regular** — tambah proyek baru segera setelah selesai
- **Bagikan URL** di tempat strategis: LinkedIn, CV, signature email

---

Selamat menggunakan! 🚀

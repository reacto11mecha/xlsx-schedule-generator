# XLSX Schedule Generator

Sebuah project yang digunakan untuk membaca file excel xlsx dan menjadikannya dua file json data jadwal pelajaran dan alokasi waktunya. Project ini sebenarnya dipakai [`jadwal-ssg`](https://github.com/reacto11mecha/jadwal-ssg) untuk menghasilkan informasi statis mengenai jadwal pelajaran yang ada di sekolah saya.

## Prerequisites

Anda butuh

- Node.js dan NPM (atau Package Manager lainnya)

## Pemakaian

### Cloning Dari Github

Jalankan perintah ini Command Line.

```sh
# HTTPS
git clone https://github.com/reacto11mecha/xlsx-schedule-generator.git

# SSH
git clone git@github.com:reacto11mecha/xlsx-schedule-generator.git
```

### Menginstall package

Anda ke root directory project dan menginstall package yang diperlukan.

```sh
npm install

# atau menggunakan pnpm
pnpm install
```

### Mengubah Jadwal dan Waktu

### Menjalankan Generator

Setelah mengubah apa yang ada di file excel, jalankan generator dengan script di bawah ini.

```
npm run gen

# atau menggunakan pnpm
pnpm gen
```

Cek folder `result` setelah menjalankan script di atas, akan terdapat dua file didalamnya.

## Lisensi

Project ini bernaung di bawah lisensi [MIT](LICENSE).

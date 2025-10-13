// --- Central Site Configuration ---
const siteConfig = {
  name: "Ade Syofyan",
  jobTitle: "Programmer Senior",
  jobTitleShort: "Mobile & Web Developer",
  location: "Padang, Sumatera Barat, Indonesia",
  email: "ade.syofyan@gmail.com",
  phone: "+6282284955080",
  phoneDisplay: "0822-8495-5080",
  cvUrl:
    "https://drive.google.com/file/d/1TtAS_WC3AgzFMkg8Nl9VQ211LGdm9foJ/view?usp=sharing",
  social: {
    linkedin: "https://www.linkedin.com/in/ade-syofyan/",
    whatsapp: "https://wa.me/6282284955080",
  },
};

const projectsData = [
  {
    id: "sitampan-duo",
    title: "Aplikasi Klinik Si Tampan Duo",
    type: "Aplikasi Booking Pemeriksaan Kesehatan",
    thumbnail: "./assets/img/project/sitampan/sitampan-1.png",
    tag: "Mobile & Backend Development",
    category: "mobile",
    goal: "Memudahkan pasien untuk melakukan **booking pemeriksaan umum & gigi**, memantau antrean, dan mengakses resep/rujukan secara digital tanpa perlu antre panjang di klinik.",
    role: "Lead Mobile & Backend Developer",
    process:
      "Saya merancang dan mengembangkan sistem ini secara end-to-end. **Aplikasi mobile** dibangun dengan **Flutter** untuk memberikan pengalaman pengguna yang mulus. **Backend** menggunakan **Laravel** untuk mengelola jadwal, antrean, dan data medis pasien. Fitur utama yang diimplementasikan meliputi: **sistem antrean digital** otomatis, **notifikasi real-time** untuk status booking dan hasil, serta **manajemen dokumen** untuk resep dan rujukan yang aman.",
    impact:
      "Aplikasi ini berhasil **mengubah pengalaman berobat menjadi lebih cepat, aman, dan transparan**. Pasien dapat meminimalkan waktu tunggu dan mengelola riwayat kesehatan mereka dengan mudah. Di sisi klinik, sistem ini **meningkatkan efisiensi operasional** melalui dashboard admin terintegrasi untuk mengelola check-in, panggilan antrean, dan upload hasil pemeriksaan.",
    images: [
      {
        src: "./assets/img/project/sitampan/sitampan-1.png",
        alt: "Screenshot Halaman Login Aplikasi Si Tampan Duo",
      },
      {
        src: "./assets/img/project/sitampan/sitampan-2.png",
        alt: "Screenshot Dashboard Aplikasi Si Tampan Duo",
      },
    ],
    links: {
      playStore:
        "https://play.google.com/store/apps/details?id=com.adein.sitampan",
    },
    techStack: [
      {
        name: "Flutter",
        reason:
          "Membangun aplikasi mobile cross-platform yang responsif dan modern untuk Android & iOS.",
      },
      {
        name: "Laravel",
        reason:
          "Menyediakan API yang andal dan aman untuk mengelola data booking, antrean, dan rekam medis.",
      },
      {
        name: "MySQL",
        reason:
          "Menyimpan data pasien, jadwal, dan riwayat pemeriksaan secara terstruktur dan efisien.",
      },
    ],
  },
  {
    id: "vigoshop",
    title: "Vigoshop - Aplikasi Pulsa & PPOB",
    type: "Aplikasi Agen Pulsa & PPOB",
    thumbnail: "./assets/img/project/vigoshop/vigoshop-1.png",
    tag: "Mobile & Backend Development",
    category: "mobile",
    goal: "Membangun aplikasi PPOB (Payment Point Online Bank) yang **andal dan mudah digunakan** bagi para agen untuk menjual pulsa, paket data, token listrik, dan membayar berbagai tagihan secara efisien.",
    role: "Lead Developer",
    process:
      "Saya mengembangkan aplikasi ini dari awal, menggunakan **Java** untuk membangun aplikasi **Android Native** yang performanya optimal dan **Laravel** untuk backend. Prosesnya meliputi perancangan **arsitektur sistem transaksi** yang cepat, integrasi dengan berbagai **API biller** nasional, dan memastikan keamanan data pengguna serta saldo agen.",
    impact:
      "Vigoshop berhasil menjadi platform yang stabil dan dipercaya oleh **ratusan agen pulsa**. Aplikasi ini memfasilitasi ribuan transaksi setiap harinya, membantu para agen meningkatkan pendapatan mereka dengan menyediakan layanan pembayaran digital yang lengkap dan harga yang kompetitif.",
    images: [
      {
        src: "./assets/img/project/vigoshop/vigoshop-1.png",
        alt: "Screenshot Halaman Utama Vigoshop",
      },
      {
        src: "./assets/img/project/vigoshop/vigoshop-2.png",
        alt: "Screenshot Fitur Transaksi Vigoshop",
      },
    ],
    links: {
      playStore:
        "https://play.google.com/store/apps/details?id=com.sukumaya.metashop",
    },
    techStack: [
      {
        name: "Java (Native Android)",
        reason:
          "Membangun aplikasi Android native yang cepat dan memiliki performa optimal untuk transaksi.",
      },
      {
        name: "Laravel",
        reason:
          "Menyediakan backend yang kuat untuk mengelola ribuan transaksi harian dan integrasi API biller.",
      },
      {
        name: "MySQL",
        reason:
          "Menyimpan data transaksi, produk, dan pengguna secara aman dan terstruktur.",
      },
    ],
  },
  {
    id: "pasarpedia",
    title: "Pasarpedia - Belanja Pasar Online",
    type: "Aplikasi E-commerce & Logistik Lokal",
    thumbnail: "./assets/img/project/pasarpedia/pasarpedia-1.png",
    tag: "Mobile & Backend Development",
    category: "mobile",
    goal: "Memudahkan pengguna untuk berbelanja kebutuhan dari **pasar tradisional dan swalayan** secara online, dengan jaminan kualitas, pengantaran di hari yang sama, dan pembayaran di tempat (COD).",
    role: "Lead Developer",
    process:
      "Saya mengembangkan aplikasi ini dari sisi **backend dan mobile menggunakan Flutter**. Prosesnya meliputi pembuatan sistem katalog produk dinamis, manajemen order, **pelacakan mitra pengantaran**, dan sistem nota belanja yang transparan. Fokus utama adalah menciptakan alur belanja yang sangat mudah digunakan oleh berbagai kalangan.",
    impact:
      "Pasarpedia berhasil **mendigitalisasi pengalaman belanja pasar lokal**, menghemat waktu dan biaya bagi pengguna. Sistem COD dan jaminan kualitas barang meningkatkan kepercayaan, sementara para mitra pengantaran mendapatkan peluang kerja baru.",
    images: [
      {
        src: "./assets/img/project/pasarpedia/pasarpedia-1.png",
        alt: "Screenshot Aplikasi Pasarpedia",
      },
      {
        src: "./assets/img/project/pasarpedia/pasarpedia-2.png",
        alt: "Screenshot Fitur Belanja Pasarpedia",
      },
    ],
    links: {
      playStore:
        "https://play.google.com/store/apps/details?id=id.kliker.pasarpedia",
      liveSite: "http://www.pasarpedia.id",
    },
    techStack: [
      {
        name: "Flutter",
        reason:
          "Membangun aplikasi cross-platform yang user-friendly dan memiliki performa baik.",
      },
      {
        name: "PHP (Backend)",
        reason:
          "Menyediakan API untuk manajemen produk, order, dan mitra pengantaran.",
      },
      {
        name: "MySQL",
        reason:
          "Menyimpan data produk, pengguna, dan riwayat transaksi secara efisien.",
      },
    ],
  },
  {
    id: "mbakrhoda",
    title: "Mbakrhoda - Toko Teknik Online",
    type: "Aplikasi E-commerce B2B & B2C",
    thumbnail: "./assets/img/project/mbakrhoda/mbakrhoda-1.png",
    tag: "Mobile & Backend Development",
    category: "mobile",
    goal: "Mendigitalisasi 'Mbakrhoda', sebuah toko teknik legendaris sejak 1987, untuk melayani pelanggan industri dan ritel secara online, serta mempermudah proses pemesanan dan manajemen produk.",
    role: "Lead Developer",
    process:
      "Saya mengembangkan aplikasi ini dengan pendekatan **WebView**, di mana aplikasi mobile Android berfungsi sebagai *wrapper* untuk situs web e-commerce yang sudah ada. Saya juga mengimplementasikan jembatan (bridge) antara **JavaScript dan Java** untuk mengakses fitur native seperti pemindaian produk (barcode/QR scanner).",
    impact:
      "Aplikasi ini berhasil membawa bisnis yang telah berdiri puluhan tahun ke ranah digital, memperluas jangkauan pasar ke seluruh Indonesia. Fitur pemindaian produk mempercepat proses inventaris dan pemesanan bagi pelanggan B2B, meningkatkan efisiensi secara keseluruhan.",
    images: [
      {
        src: "./assets/img/project/mbakrhoda/mbakrhoda-1.png",
        alt: "Screenshot Aplikasi Mbakrhoda",
      },
      {
        src: "./assets/img/project/mbakrhoda/mbakrhoda-2.png",
        alt: "Screenshot Fitur Scan Produk Mbakrhoda",
      },
    ],
    links: {
      playStore:
        "https://play.google.com/store/apps/details?id=com.sukumaya.mbakrhoda",
    },
    techStack: [
      {
        name: "WebView (Android)",
        reason:
          "Membungkus situs web menjadi aplikasi Android yang dapat di-publish ke Play Store dengan cepat.",
      },
      {
        name: "Java & JavaScript Bridge",
        reason:
          "Untuk memungkinkan komunikasi antara web dan aplikasi native, khususnya untuk mengakses fitur pemindaian produk.",
      },
      {
        name: "PHP (Backend)",
        reason:
          "Menyediakan API untuk manajemen katalog produk yang luas dan sistem order.",
      },
    ],
  },
  {
    id: "atip-maintenance",
    title: "Maintenance & Repair ATIP",
    type: "Aplikasi Pengaduan Online",
    thumbnail: "./assets/img/project/atip/atip-1.png",
    tag: "Mobile Development",
    category: "mobile",
    goal: "Mendigitalisasi proses pengaduan kerusakan dan permintaan perbaikan di lingkungan Politeknik ATI Padang melalui sebuah aplikasi online yang mudah diakses.",
    role: "Lead Developer",
    process:
      "Mengembangkan aplikasi mobile menggunakan pendekatan **WebView** untuk membungkus sistem pengaduan berbasis web. Ini memungkinkan deployment cepat ke Play Store dan memastikan konsistensi antara platform web dan mobile.",
    impact:
      "Aplikasi ini berhasil menyederhanakan alur pelaporan, mempercepat respons tim perbaikan, dan menyediakan jejak digital untuk setiap pengaduan, meningkatkan transparansi dan efisiensi manajemen fasilitas di Politeknik ATI Padang.",
    images: [
      {
        src: "./assets/img/project/atip/atip-1.png",
        alt: "Screenshot Aplikasi Maintenance & Repair ATIP",
      },
      {
        src: "./assets/img/project/atip/atip-2.png",
        alt: "Screenshot Fitur Pengaduan ATIP",
      },
    ],
    links: {
      playStore:
        "https://play.google.com/store/apps/details?id=com.sukumaya.pekersa",
    },
    techStack: [
      {
        name: "WebView (Android)",
        reason:
          "Membungkus situs web pengaduan menjadi aplikasi Android yang dapat di-publish ke Play Store.",
      },
      {
        name: "PHP (Backend)",
        reason:
          "Menyediakan sistem untuk mengelola tiket pengaduan, status, dan notifikasi.",
      },
    ],
  },
  {
    id: "ppdb",
    title: "Studi Kasus: PPDB Online SMAKPA Padang",
    type: "Website Pendaftaran Peserta Didik Baru Online",
    thumbnail: "./assets/img/project/ppdb-smakpa/ppdb-smakpa-public.png",
    tag: "Full-Stack Development",
    category: "web",
    goal: "SMAKPA Padang menghadapi tantangan dalam proses pendaftaran yang **masih manual**, memakan waktu, **rentan kesalahan data**, dan memiliki jangkauan terbatas. Mereka membutuhkan sebuah sistem digital untuk modernisasi proses ini.",
    role: "Lead Full-Stack Developer",
    process:
      "Sebagai **Lead Full-Stack Developer**, saya merancang dan membangun platform PPDB online dari awal. **Backend** dibangun menggunakan **Laravel** untuk memastikan keamanan data dan skalabilitas. **Frontend** dibuat responsif agar mudah diakses dari desktop maupun mobile. Prosesnya meliputi: 1) Analisis kebutuhan dengan pihak sekolah, 2) Desain alur pendaftaran yang intuitif, 3) Pengembangan fitur utama seperti **formulir dinamis, upload dokumen, dan dashboard admin**, 4) Pengujian intensif sebelum peluncuran.",
    impact:
      "Sistem ini berhasil **mengotomatisasi 95% proses pendaftaran**, mengurangi beban kerja tim administrasi secara signifikan. Platform ini sukses mengelola **lebih dari 1.000 pendaftar** pada gelombang pertama dengan lancar. Jangkauan pendaftaran meluas, memungkinkan calon siswa dari luar kota untuk mendaftar dengan mudah.",
    images: [
      {
        src: "./assets/img/project/ppdb-smakpa/ppdb-smakpa-public.png",
        alt: "Screenshot Beranda PPDB SMAKPA Padang",
      },
      {
        src: "./assets/img/project/ppdb-smakpa/ppdb-smakpa-admin.png",
        alt: "Screenshot Dashboard Admin PPDB SMAKPA Padang",
      },
      {
        src: "./assets/img/project/ppdb-smakpa/ppdb-smakpa-syarat.png",
        alt: "Screenshot Halaman Persyaratan PPDB SMAKPA Padang",
      },
    ],
    links: {
      liveSite: "https://psb.smk-smakpa.sch.id/",
    },
    techStack: [
      {
        name: "Laravel",
        reason:
          "Framework PHP yang kuat untuk backend yang aman, skalabel, dan memiliki ekosistem yang matang.",
      },
      {
        name: "JavaScript",
        reason:
          "Untuk interaktivitas frontend, validasi formulir, dan pengalaman pengguna yang dinamis.",
      },
      {
        name: "MySQL",
        reason:
          "Sistem database yang andal dan teruji untuk menyimpan data pendaftar dan konfigurasi sistem.",
      },
    ],
  },
  {
    id: "myintercom",
    title: "Aplikasi Customer: myIntercom (Toyota)",
    type: "Aplikasi Layanan Pelanggan Otomotif",
    thumbnail:
      "https://play-lh.googleusercontent.com/5-J1aWc6Pq-sYxR-9-g-h-i-j-k-l-m-n-o-p-q-r-s-t-u-v-w-x-y-z=w1052-h592-rw",
    tag: "Mobile & Backend Development",
    category: "mobile",
    goal: "Menciptakan aplikasi untuk pelanggan Toyota Intercom yang mempermudah berbagai layanan seperti **Booking Service**, **Test Drive**, hingga perpanjangan asuransi, serta memberikan **reward dan promo eksklusif**.",
    role: "Senior Programmer",
    process:
      "Sebagai **pengembang utama**, saya merancang dan membangun aplikasi ini menggunakan **Flutter** untuk mobile dan **Laravel** untuk backend. Proses pengembangan mencakup implementasi fitur-fitur krusial seperti: sistem **booking service & test drive**, modul **trade-in**, **pelacakan proses** secara real-time, sistem **poin reward** untuk referral, dan manajemen **voucher & promo**.",
    impact:
      "Aplikasi ini berhasil **mendigitalisasi layanan pelanggan** Toyota Intercom, **meningkatkan engagement** melalui sistem reward dan promo. Pelanggan mendapatkan kemudahan dalam mengakses layanan dan melacak proses, yang pada akhirnya **meningkatkan loyalitas dan kepuasan pelanggan**.",
    images: [
      {
        src: "https://play-lh.googleusercontent.com/5-J1aWc6Pq-sYxR-9-g-h-i-j-k-l-m-n-o-p-q-r-s-t-u-v-w-x-y-z=w1052-h592-rw",
        alt: "Screenshot Layanan myIntercom",
      },
      {
        src: "https://play-lh.googleusercontent.com/V-zE_TXZgLq_V_-_p-Z_g_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-",
        alt: "Screenshot Poin Reward myIntercom",
      },
      {
        src: "https://play-lh.googleusercontent.com/9-f-g-h-i-j-k-l-m-n-o-p-q-r-s-t-u-v-w-x-y-z-a-b-c-d-e-f-g-h-i-j-k-l-m-n-o-p-q-r-s-t-u-v-w-x-y-z=w1052-h592-rw",
        alt: "Screenshot Detail Promo myIntercom",
      },
    ],
    links: {
      playStore:
        "https://play.google.com/store/apps/details?id=com.sukumaya.intercomapp",
    },
    techStack: [
      {
        name: "Flutter",
        reason:
          "Dipilih untuk pengembangan cross-platform yang cepat, memungkinkan satu basis kode untuk Android & iOS.",
      },
      {
        name: "Laravel",
        reason:
          "Menyediakan API backend yang solid dan aman untuk mengelola data booking, reward, dan pengguna.",
      },
      {
        name: "Firebase",
        reason:
          "Digunakan untuk notifikasi push real-time agar pengguna selalu mendapatkan update promo dan status layanan.",
      },
    ],
  },
  {
    id: "payoapp",
    title: "Aplikasi Super-App: PayoKurir (PayoApp)",
    type: "Aplikasi Ojek Online, Kuliner & Logistik",
    thumbnail:
      "https://play-lh.googleusercontent.com/V-zE_TXZgLq_V_-_p-Z_g_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-",
    tag: "System Migration & Feature Dev",
    category: "mobile",
    goal: "Merevitalisasi PayoApp, sebuah **super-app lokal**, dengan melakukan **migrasi sistem besar-besaran** untuk mendukung berbagai layanan seperti transportasi online, kuliner, logistik, dan farmasi bagi masyarakat di Sumatera Barat.",
    role: "Senior Programmer",
    process:
      "Saya memimpin migrasi sistem backend dari **CodeIgniter ke Laravel 11** untuk meningkatkan **skalabilitas dan performa** aplikasi. Proses ini mencakup **perancangan ulang arsitektur** untuk mendukung berbagai layanan (Ojek, Kuliner, Logistik, PayoSehat) dan memastikan transisi berjalan lancar untuk ribuan pengguna.",
    impact:
      "Migrasi ke Laravel 11 berhasil **meningkatkan stabilitas dan kecepatan respons** aplikasi secara signifikan, memungkinkan **ekspansi layanan ke kota-kota baru**. Aplikasi ini menjadi **fondasi teknologi yang kuat** untuk mendukung pertumbuhan 'aplikasi urang awak' ini di pasar lokal.",
    images: [
      {
        src: "https://play-lh.googleusercontent.com/V-zE_TXZgLq_V_-_p-Z_g_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-",
        alt: "Screenshot Halaman Utama PayoKurir",
      },
      {
        src: "https://play-lh.googleusercontent.com/5-J1aWc6Pq-sYxR-9-g-h-i-j-k-l-m-n-o-p-q-r-s-t-u-v-w-x-y-z=w1052-h592-rw",
        alt: "Screenshot Layanan Ojek PayoKurir",
      },
      {
        src: "https://play-lh.googleusercontent.com/a-b-c-d-e-f-g-h-i-j-k-l-m-n-o-p-q-r-s-t-u-v-w-x-y-z-0-1-2-3-4-5-6-7-8-9-0-a-b-c-d-e-f-g-h-i-j-k-l-m-n-o-p-q-r-s-t-u-v-w-x-y-z=w1052-h592-rw",
        alt: "Screenshot Layanan PayoFood",
      },
    ],
    links: {
      playStore:
        "https://play.google.com/store/apps/details?id=com.payoapp.update",
    },
    techStack: [
      {
        name: "Laravel 11",
        reason:
          "Dipilih untuk migrasi karena performa tinggi, fitur modern, dan keamanan yang jauh lebih baik dari CodeIgniter.",
      },
      {
        name: "PHP 8.2",
        reason:
          "Memanfaatkan fitur-fitur bahasa terbaru untuk kode yang lebih bersih, cepat, dan efisien.",
      },
      {
        name: "MySQL",
        reason:
          "Struktur database dioptimalkan untuk menangani ribuan transaksi dan data pengguna secara efisien.",
      },
    ],
  },
];

// --- Work History Data ---
const workHistoryData = [
  {
    company: "PT. Dofla Jaya Properti",
    role: "Staff IT",
    duration: "Nov 2023 - Saat ini",
    description:
      "Bertanggung jawab sebagai Web Developer serta mencakup IT Support dan Maintenance Server untuk mendukung operasional perusahaan.",
    logo: "./assets/img/company/doflaland.png",
  },
  {
    company: "PT. Sukumaya Teknologi",
    role: "Senior Mobile Developer",
    duration: "Agu 2016 - Jan 2023",
    description:
      "Mengembangkan berbagai aplikasi mobile (Android Native & Flutter) dan web untuk klien. Terlibat dalam seluruh siklus hidup proyek, dari perencanaan hingga deployment dan maintenance.",
    logo: "./assets/img/company/sukumaya.png",
  },
  {
    company: "CV. Minangsoft",
    role: "Founder",
    duration: "Mei 2014 - Des 2016",
    description:
      "Mendirikan dan memimpin software house yang fokus pada pembuatan website dan aplikasi kustom untuk klien lokal menggunakan CodeIgniter dan MySQL.",
    logo: "./assets/img/company/minangsoft.png",
  },
];

// --- Certificates Data ---
const certificatesData = [
  {
    title: "Google Play Academy - Store Listing Certificate",
    issuer: "Google Play Academy",
    date: "September 2025",
    thumbnail:
      "./assets/certs/pdf/google_play_academy_store_listing_certificate.pdf",
    url: "./assets/certs/pdf/google_play_academy_store_listing_certificate.pdf",
  },
  {
    title:
      "Webinar #22 – Etika Ngoding di Era AI yang Harus Dikuasai Programmer Pemula",
    issuer: "Sinau Koding Academy",
    date: "September 2025",
    thumbnail:
      "./assets/certs/pdf/webinar_22_etika_ngoding_di_era_ai_yang_harus_dikuasai_programmer_pemula.pdf",
    url: "./assets/certs/pdf/webinar_22_etika_ngoding_di_era_ai_yang_harus_dikuasai_programmer_pemula.pdf",
  },
  {
    title: "Maju Bareng AI by Hacktiv8",
    issuer: "Hacktiv8 Indonesia",
    date: "Juli 2025",
    thumbnail: "./assets/certs/pdf/sertifikat_ai_for_it_developer_wave_1.pdf",
    url: "./assets/certs/pdf/sertifikat_ai_for_it_developer_wave_1.pdf",
  },
  {
    title: "AI For Business Blueprint",
    issuer: "Asian Tiger School",
    date: "April 2025",
    thumbnail: "./assets/certs/pdf/ai_for_business_blueprint.pdf",
    url: "./assets/certs/pdf/ai_for_business_blueprint.pdf",
  },
  {
    title: "Sololearn PHP",
    issuer: "Sololearn",
    date: "Agustus 2017",
    thumbnail: "./assets/certs/pdf/sololearn_php.pdf",
    url: "./assets/certs/pdf/sololearn_php.pdf",
  },
  {
    title: "Sololearn SQL",
    issuer: "Sololearn",
    date: "Agustus 2017",
    thumbnail: "./assets/certs/pdf/sololearn_sql.pdf",
    url: "./assets/certs/pdf/sololearn_sql.pdf",
  },
  {
    title: "Workshop “Informatics Day”",
    issuer: "STMIK Indonesia Padang (Bekerjasama dengan Intel & Baidu)",
    date: "September 2014",
    thumbnail: "./assets/certs/pdf/sertifikat_intel_dan_baidu.pdf",
    url: "./assets/certs/pdf/sertifikat_intel_dan_baidu.pdf",
  },
];

// --- Testimonials Data ---
const testimonialsData = [
  {
    quote:
      "Sistem PPDB online yang dibangun oleh Ade Syofyan benar-benar **mengubah cara kami bekerja**. Proses yang tadinya manual dan rumit kini menjadi **efisien dan transparan**. Kami berhasil mengelola ribuan pendaftar tanpa kendala. Sebuah solusi yang sangat kami butuhkan.",
    name: "Drs. Nasir",
    title: "Kepala Sekolah SMAKPA Padang",
    location: "Padang",
    avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDU2NmJlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjQwIiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5ETjwvdGV4dD48L3N2Zz4=",
  },
  {
    quote:
      "Implementasi AI Akuntan dari Ade adalah sebuah **game-changer** bagi tim keuangan kami. Waktu untuk input jurnal manual **berkurang hingga 80%**, memungkinkan kami fokus pada analisis strategis. Akurasi data pun meningkat drastis.",
    name: "Rina Wijayanti",
    title: "Finance Manager, PT. Logistik Cemerlang",
    location: "Jakarta",
    avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZDU0NjgwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjQwIiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5SVzwvdGV4dD48L3N2Zz4=",
  },
  {
    quote:
      "Kami mempercayakan pengembangan aplikasi mobile PropertiKita kepada Ade, dan hasilnya luar biasa. Aplikasi Flutter yang ia bangun tidak hanya **cepat dan stabil** di Android & iOS, tetapi juga memiliki **desain yang sangat intuitif**. Pengguna kami menyukainya!",
    name: "David Lee",
    title: "Founder, PropertiKita",
    location: "Surabaya",
    avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWE5YjY5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjQwIiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5ETDwvdGV4dD48L3N2Zz4=",
  },
  {
    quote:
      "Ade memiliki pemahaman mendalam tentang proses bisnis. Sistem ERP kustom yang ia kembangkan untuk dealer kami berhasil **mengintegrasikan data penjualan, servis, dan inventaris** dalam satu platform. Efisiensi operasional kami meningkat secara signifikan.",
    name: "Ir. Hendra Gunawan",
    title: "Direktur Operasional, Sentra Otomotif Nusantara",
    location: "Bandung",
    avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjYTY3ZjU5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjQwIiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5IRzwvdGV4dD48L3N2Zz4=",
  },
];

// --- Achievement System Data ---
const achievements = {
  file_explorer: {
    name: "Penjelajah File",
    unlocked: false,
    description: "Menggunakan perintah `ls` atau `cat` di terminal.",
    icon: "file-search",
  },
  code_inspector: {
    name: "Inspektur Kode",
    unlocked: false,
    description: 'Melihat "di balik layar" salah satu demo interaktif.',
    icon: "code",
  },
  explorer: {
    name: "Penjelajah Sejati",
    unlocked: false,
    description: "Menjelajahi hingga bagian akhir halaman.",
    icon: "compass",
  },
  ai_challenger: {
    name: "Penantang AI",
    unlocked: false,
    description: "Mengajukan pertanyaan pertama ke chatbot AI.",
    icon: "bot",
  },
  terminal_velocity: {
    name: "Kecepatan Terminal",
    unlocked: false,
    description: "Menggunakan mode terminal interaktif.",
    icon: "terminal",
  },
  social_butterfly: {
    name: "Kupu-kupu Sosial",
    unlocked: false,
    description: "Membuka salah satu profil media sosial.",
    icon: "share-2",
  },
  terminal_ai_chat: {
    name: "Terminal Talker",
    unlocked: false,
    description: "Berinteraksi dengan AI melalui terminal.",
    icon: "message-square",
  },
  palette_picasso: {
    name: "Palette Picasso",
    unlocked: false,
    description: "Menghasilkan 5 palet warna.",
    icon: "palette",
  },
  geek_cred: {
    name: "Geek Cred",
    unlocked: false,
    description: "Menampilkan info profil dengan perintah `neofetch`.",
    icon: "cpu",
  },
  system_crasher: {
    name: "System Crasher",
    unlocked: false,
    description: "Menemukan cara untuk 'merusak' portofolio.",
    icon: "shield-alert",
  },
  time_traveler: {
    name: "Penjelajah Waktu",
    unlocked: false,
    description: "Kembali setelah meninggalkan tab terbuka selama 15 menit.",
    icon: "clock",
  },
  css_hacker: {
    name: "Peretas CSS",
    unlocked: false,
    description: "Mengaktifkan mode rahasia melalui DevTools.",
    icon: "bug",
  },
  navigator: {
    name: "Sang Navigator",
    unlocked: false,
    description: "Menemukan jalan menggunakan Pathfinding Visualizer.",
    icon: "map",
  },
  case_study_analyst: {
    name: "Analis Studi Kasus",
    unlocked: false,
    description: "Memicu pembuatan studi kasus dinamis melalui AI.",
    icon: "file-text",
  },
  theme_connoisseur: {
    name: "Pakar Tema",
    unlocked: false,
    description: "Mencoba semua tema visual (Terang, Gelap, Sistem).",
    icon: "paintbrush-2",
  },
  animation_conductor: {
    name: "Konduktor Animasi",
    unlocked: false,
    description: "Berinteraksi dengan animasi partikel di header.",
    icon: "mouse-pointer-click",
  },
};

// --- Virtual File System Data ---
const fileSystem = {
  "README.md": `# Terminal Interaktif Portofolio Ade Syofyan

Selamat datang di terminal virtual saya! Fitur ini adalah sebuah "easter egg" untuk Anda yang berjiwa teknis.
Anda bisa menjelajahi informasi tentang saya menggunakan perintah-perintah dasar Linux.

## Perintah yang Tersedia:
- \`ls\`: Menampilkan daftar file dan direktori.
- \`cat <file>\`: Menampilkan isi dari sebuah file.
- \`cd <nama_direktori>\`: Pindah ke direktori lain. Gunakan \`cd ..\` untuk kembali.
- \`help\`: Menampilkan daftar semua perintah, termasuk perintah non-filesystem.
- \`clear\`: Membersihkan layar terminal.
- \`exit\`: Menutup terminal.

Coba jelajahi direktori \`projects/\` atau baca file \`skills.json\`! Gunakan \`open cv\` untuk melihat CV saya.
`,
  "about.txt": `Nama: Ade Syofyan
Jabatan: Programmer Senior
Pengalaman: 7+ tahun
Lokasi: Padang, Sumatera Barat, Indonesia

Ringkasan:
Saya seorang developer berpengalaman dengan semangat tinggi untuk memecahkan masalah dan membangun solusi digital yang inovatif. Keahlian saya terbentang dari pengembangan aplikasi mobile cross-platform, aplikasi web yang kuat, hingga integrasi sistem cerdas menggunakan AI.

Saya percaya bahwa teknologi terbaik adalah yang dapat memberikan dampak positif dan efisiensi nyata bagi bisnis.
`,
  "skills.json": JSON.stringify(
    {
      keahlian_utama: {
        "Mobile Development": {
          teknologi: ["Flutter", "Kotlin"],
          deskripsi:
            "Membangun aplikasi Android & iOS yang performa tinggi, responsif, dan intuitif.",
        },
        "Web Development": {
          teknologi: ["Laravel", "PHP", "JavaScript"],
          deskripsi:
            "Menciptakan aplikasi web dan sistem backend yang skalabel, aman, dan mudah dikelola.",
        },
        "AI Integration": {
          teknologi: ["Chatbot AI", "Google AI"],
          deskripsi:
            "Mengotomatisasi proses bisnis dengan AI, seperti AI Akuntan dan chatbot cerdas.",
        },
      },
      keahlian_pendukung: [
        "ERP Systems Development",
        "Firebase (Backend as a Service)",
        "Real-time Systems (WebSockets, Push Notifications)",
        "Problem Solving & System Analysis",
        "Cloud Services (Deployment & Management)",
        "MySQL & Database Design",
      ],
    },
    null,
    2
  ),
  "contact.md": `# Info Kontak

Anda bisa menghubungi saya melalui kanal berikut. Saya siap untuk diskusi proyek atau kolaborasi.

- **Email**: ${siteConfig.email}
- **Telepon / WhatsApp**: ${siteConfig.phone}
- **LinkedIn**: ${siteConfig.social.linkedin.replace("https://www.", "")}

Gunakan perintah \`open whatsapp\`, \`open linkedin\`, atau \`open cv\` untuk akses cepat.
`,
  "services.txt": `=========================
Layanan yang Saya Tawarkan
=========================

1.  **Pengembangan Aplikasi Mobile Kustom**
    - Platform: Android & iOS (menggunakan Flutter & Kotlin).
    - Fokus: UI/UX yang intuitif, performa tinggi, dan fitur offline.

2.  **Pengembangan Aplikasi Web & Sistem ERP**
    - Backend: Laravel, PHP.
    - Fitur: Panel admin kustom, manajemen database, sistem yang skalabel.

3.  **Integrasi AI & Solusi Chatbot**
    - Contoh: AI Akuntan untuk input data otomatis, Chatbot WhatsApp untuk sales & CS.
    - Teknologi: Google AI Platform, API integrasi.
`,
  "projects/": {
    "ppdb-smakpa.txt": `Proyek: PPDB Online SMAKPA Padang
Peran: Full-Stack Developer
Teknologi: Laravel, JavaScript
Deskripsi: Membangun platform pendaftaran siswa baru dari nol untuk menggantikan proses manual.
Dampak:
- Mengotomatisasi 95% proses pendaftaran.
- Mengelola 1000+ pendaftar dengan lancar pada gelombang pertama.
- Mengurangi beban kerja tim administrasi secara signifikan.
Testimoni: "Sistem PPDB online yang dibangun oleh Ade Syofyan benar-benar mengubah cara kami bekerja... Sebuah solusi yang sangat kami butuhkan." - Drs. Nasir, Kepala Sekolah.
`,
    "ai-accountant.txt": `Proyek: AI Akuntan (Integrasi)
Peran: AI Integration Specialist
Teknologi: Google AI, Python, API
Deskripsi: Mengembangkan sistem AI untuk membaca dan menginterpretasi nota atau faktur, lalu secara otomatis menginput data ke dalam jurnal akuntansi.
Dampak:
- Mengurangi waktu input jurnal manual hingga 80%.
- Meningkatkan akurasi data keuangan secara drastis.
- Memungkinkan tim keuangan fokus pada analisis strategis.
Testimoni: "Implementasi AI Akuntan dari Ade adalah sebuah game-changer... Akurasi data pun meningkat drastis." - Rina Wijayanti, Finance Manager.
`,
    "propertikita-mobile.txt": `Proyek: Aplikasi Mobile "PropertiKita"
Peran: Lead Mobile Developer
Teknologi: Flutter, Firebase
Deskripsi: Memimpin pengembangan aplikasi mobile cross-platform untuk jual beli properti.
Fitur Unggulan:
- Pencarian properti dengan filter canggih.
- Notifikasi real-time untuk listing baru.
- Tur virtual 360 derajat terintegrasi.
Testimoni: "Aplikasi Flutter yang ia bangun tidak hanya cepat dan stabil di Android & iOS, tetapi juga memiliki desain yang sangat intuitif. Pengguna kami menyukainya!" - David Lee, Founder.
`,
  },
};

// --- Chatbot Data ---
const adeProfileContext = `
    Nama: ${siteConfig.name}
    Jabatan: ${siteConfig.jobTitle}
    Pengalaman: Lebih dari 7 tahun dalam pengembangan aplikasi web, mobile, dan ERP.
    Proses Kerja: Konsultasi & Perencanaan, Desain & Prototyping, Pengembangan & Pengujian, Deployment & Dukungan.
    Spesialisasi: Membangun solusi digital inovatif yang efisien dan berdampak positif. Ahli dalam integrasi AI (AI akuntan untuk input jurnal otomatis, chatbot WhatsApp AI untuk tim sales/CS).
    Tech Stack: Laravel, Flutter, Firebase, Kotlin, PHP, JavaScript, Sistem Real-time.
    Bidang Keahlian: Mobile Development, Web Development, AI Integration, ERP Systems, Firebase, Sistem Real-time, Problem Solving, Cloud Services.
    Tujuan: Memberikan solusi terbaik dengan pendekatan problem-solving yang kuat.
    Nomor WhatsApp: ${siteConfig.phoneDisplay}
    CV: ${siteConfig.cvUrl}
`;

const allQuickChatOptions = [
  "Ceritakan tentang pengalaman Flutter Anda.",
  "Proyek AI apa saja yang pernah dikerjakan?",
  "Bagaimana proses kerja Anda?",
  "Teknologi apa yang paling Anda kuasai?",
  "Bisakah Anda jelaskan lebih lanjut tentang integrasi AI akuntan?",
  "Apa saja layanan yang Anda tawarkan?",
  "Proyek web apa yang paling menantang?",
  "Bagaimana Anda memastikan kualitas kode?",
  "Apakah Anda tersedia untuk proyek freelance?",
  "Berapa lama biasanya Anda mengerjakan proyek mobile?",
];

const systemInstructionText = `Anda adalah Ade Syofyan, seorang Programmer Senior.
    Jawablah pertanyaan HANYA berdasarkan informasi profil saya yang terlampir.
    Fokus pada keahlian pengembangan aplikasi, teknologi yang saya kuasai, dan jenis proyek yang saya kerjakan.

    ATURAN KHUSUS:
    1. Jika pertanyaan TIDAK terkait dengan jasa program, keahlian teknis, atau pengalaman saya yang disebutkan di profil, jawablah dengan sopan bahwa Anda tidak memiliki informasi tersebut atau itu di luar cakupan pengetahuan Anda sebagai asisten AI di portofolio ini. Contoh: "Maaf, saya hanya dapat memberikan informasi seputar keahlian dan proyek yang saya kerjakan. Untuk pertanyaan di luar itu, saya tidak memiliki datanya."
    2. Jika ada pertanyaan mengenai HARGA atau TARIF jasa, atau jika pengguna menyatakan MINAT untuk PEMESANAN/KOLABORASI langsung, selalu arahkan mereka untuk menghubungi saya melalui WhatsApp. Respons harus mencakup tautan wa.me dengan pesan pre-filled yang merangkum pertanyaan/minat mereka. Format pesan pre-filled harus jelas dan merangkum minat pengguna. Contoh format: "Untuk informasi mengenai harga atau pemesanan/kolaborasi, mohon hubungi saya langsung melalui [WhatsApp](${siteConfig.social.whatsapp}?text=Halo%20Ade%2C%20saya%20tertarik%20dengan%20[Rangkuman%20minat%20atau%20pertanyaan%20pengguna%2C%20contoh%3A%20pengembangan%20aplikasi%20mobile%20Flutter]). Saya akan dengan senang hati membantu Anda di sana!" Pastikan [Rangkuman minat atau pertanyaan pengguna] diisi dengan ringkasan pertanyaan terakhir pengguna, di-encode URL agar sesuai untuk tautan WhatsApp.
    3. JANGAN mengarang jawaban atau memberikan informasi yang tidak ada dalam profil.
    4. Jaga nada bicara tetap profesional dan membantu.

    Informasi Profil Ade Syofyan:
    ${adeProfileContext}
`;

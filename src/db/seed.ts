import { db } from "./index";
import { users, suggestions, suggestionUpvotes, suggestionComments, events, eventRsvps, jobs, consularGuides, emergencyAlerts } from "./schema";
import bcrypt from "bcryptjs";
import { count } from "drizzle-orm";

export async function seedDatabase() {
  try {
    const userCount = await db.select({ value: count() }).from(users);
    if (userCount[0].value > 0) {
      console.log("Database already seeded.");
      return;
    }

    console.log("Seeding Duta Rantau database...");

    const hashedPassword = await bcrypt.hash("password123", 10);

    // 1. Seed Users
    const seededUsers = await db.insert(users).values([
      {
        name: "Budi Santoso",
        email: "budi.santoso@duta.org",
        passwordHash: hashedPassword,
        role: "community_lead",
        city: "Kuala Lumpur",
        country: "Malaysia",
        profession: "Senior IT Engineer & Relawan Rantau",
        bio: "Aktif di Komunitas Rantau KL sejak 2018. Senang membantu sesama WNI di perantauan.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        phone: "+60123456789",
        verified: true,
      },
      {
        name: "Siti Rahma Ayu",
        email: "siti.rahma@duta.org",
        passwordHash: hashedPassword,
        role: "member",
        city: "Kuala Lumpur",
        country: "Malaysia",
        profession: "Mahasiswi S2 Universiti Malaya (PPI Malaysia)",
        bio: "Ketiga tahun berkuliah di KL. Hobi berburu kuliner Indonesia & mengajar anak PMI.",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        phone: "+60189876543",
        verified: true,
      },
      {
        name: "Andi Wijaya, SH",
        email: "andi.wijaya@kbri.go.id",
        passwordHash: hashedPassword,
        role: "embassy_staff",
        city: "Kuala Lumpur",
        country: "Malaysia",
        profession: "Staf Layanan Konsuler KBRI KL",
        bio: "Petugas Pelayanan Paspor & Perlindungan WNI KBRI Kuala Lumpur.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        phone: "+60321421354",
        verified: true,
      },
      {
        name: "Dewi Kartika",
        email: "dewi.kartika@duta.org",
        passwordHash: hashedPassword,
        role: "member",
        city: "Penang",
        country: "Malaysia",
        profession: "Owner Warung Minang Penang",
        bio: "Pengusaha kuliner Nusantara di Georgetown, Penang. Menyediakan makanan halal dan rindu kampung.",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        phone: "+60145558899",
        verified: true,
      },
      {
        name: "Reza Pratama",
        email: "reza.pratama@duta.org",
        passwordHash: hashedPassword,
        role: "member",
        city: "Singapore",
        country: "Singapore",
        profession: "Fintech Product Manager",
        bio: "Diaspora Indonesia di SG. Sering bikin kumpul santai weekend bareng diaspora Asia Tenggara.",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        phone: "+6591234567",
        verified: true,
      },
    ]);

    const [budi, siti, andi, dewi, reza] = seededUsers;

    // 2. Seed Suggestions ("Suggest" Feature)
    const seededSuggestions = await db.insert(suggestions).values([
      {
        title: "Layanan Paspor Akhir Pekan (Weekend Passport Drive) untuk Pekerja Shift",
        description: "Banyak pekerja migran dan mahasiswa yang kesulitan datang ke KBRI pada hari kerja biasa (Senin-Jumat) karena terikat jam kerja ketat. Diusulkan agar KBRI/KJRI membuka layanan paspor khusus di Sabtu minggu ke-2 setiap bulan dengan sistem booking online.",
        category: "Legal & Consular",
        targetCity: "Kuala Lumpur",
        status: "under_review",
        officialResponse: "Tanggapan KBRI KL: Usulan ini sangat konstruktif. Pihak Imigrasi KBRI KL sedang mengevaluasi alokasi personel untuk uji coba Layanan Sabtu Mulai Bulan Mei 2025.",
        upvotesCount: 84,
        viewsCount: 420,
        authorId: budi.id,
      },
      {
        title: "Peta Pemasok & Warung Kuliner Otentik Nusantara Se-Malaysia",
        description: "Mari kita buat direktori interaktif warung makan, katering, dan toko kelontong yang menjual bumbu dapur khas Indonesia (terasi, daun jeruk, rempah asli) di seluruh negeri jiar agar mempermudah diaspora dan UMKM Indonesia.",
        category: "Culinary & Culture",
        targetCity: "All Cities",
        status: "planned",
        officialResponse: "Admin Komunitas: Tim Duta Rantau telah menyetujui usulan ini. Fitur Map Direktori Kuliner sedang dikembangkan!",
        upvotesCount: 65,
        viewsCount: 310,
        authorId: dewi.id,
      },
      {
        title: "Sistem Verifikasi & Rekomendasi Tempat Tinggal / Roommate Aman WNI",
        description: "Sering terjadi penipuan sewa rumah atau deposit hilang di kalangan mahasiswa & pekerja baru tiba. Diusulkan ada fitur ulasan & checklist keamanan kontrak rumah khusus sesama diaspora.",
        category: "Housing & Living",
        targetCity: "Kuala Lumpur",
        status: "open",
        officialResponse: null,
        upvotesCount: 42,
        viewsCount: 195,
        authorId: siti.id,
      },
      {
        title: "Klinik Hukum & Konsultasi Kontrak Kerja Bebas Biaya (Pro-Bono Legal Clinic)",
        description: "Membuat sesi konsultasi hukum online rutin bulanan yang dipimpin oleh advokat alumni Indonesia di Malaysia untuk konsultasi permit kerja, hak pesangon, dan perlindungan TKA.",
        category: "Legal & Consular",
        targetCity: "All Cities",
        status: "implemented",
        officialResponse: "Telah Dilaksanakan: Sesi Klinik Hukum perdana diselenggarakan setiap hari Sabtu pertama via Zoom dan live streaming Duta Rantau.",
        upvotesCount: 112,
        viewsCount: 680,
        authorId: andi.id,
      },
      {
        title: "Program Mentorship Mahasiswa Baru & Bimbingan Karier Diaspora",
        description: "Program di mana senior diaspora yang sudah bekerja di perusahaan ternama membimbing adik-adik mahasiswa Rantau terkait internship, CV ATS, dan visa kerja setelah lulus.",
        category: "Jobs & Work",
        targetCity: "All Cities",
        status: "open",
        officialResponse: null,
        upvotesCount: 38,
        viewsCount: 220,
        authorId: reza.id,
      },
    ]);

    // Seed Suggestion Upvotes
    await db.insert(suggestionUpvotes).values([
      { suggestionId: seededSuggestions[0].id, userId: siti.id },
      { suggestionId: seededSuggestions[0].id, userId: dewi.id },
      { suggestionId: seededSuggestions[0].id, userId: reza.id },
      { suggestionId: seededSuggestions[1].id, userId: budi.id },
      { suggestionId: seededSuggestions[1].id, userId: siti.id },
      { suggestionId: seededSuggestions[2].id, userId: budi.id },
    ]);

    // Seed Suggestion Comments
    await db.insert(suggestionComments).values([
      {
        suggestionId: seededSuggestions[0].id,
        authorId: siti.id,
        content: "Sangat setuju! Teman-teman di pabrik Selangor susah sekali ambil cuti weekday hanya untuk foto paspor.",
      },
      {
        suggestionId: seededSuggestions[0].id,
        authorId: andi.id,
        content: "Terima kasih mas Budi dan mba Siti. Usulan ini sudah kami sampaikan ke Koordinator Fungsi Konsuler KBRI KL.",
      },
      {
        suggestionId: seededSuggestions[1].id,
        authorId: budi.id,
        content: "Mantap bu Dewi! Saya butuh info seller yang jual Bumbu Rawon asli di sekitar Ampang nih.",
      },
    ]);

    // 3. Seed Events
    await db.insert(events).values([
      {
        title: "Halal Bihalal & Silaturahmi Akrab Diaspora Indonesia 2025",
        description: "Acara tahunan mempererat tali silaturahmi antar perantau Indonesia. Dilengkapi pertunjukan seni budaya, bazaar makanan Nusantara, dan ramah tamah bersama jajaran KBRI.",
        category: "Social Gathering",
        date: "2025-04-20",
        time: "10:00 - 16:00 MYT",
        location: "Aula Tun Abdul Razak / Halaman KBRI Kuala Lumpur",
        city: "Kuala Lumpur",
        capacity: 300,
        attendeesCount: 142,
        imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80",
        organizerId: budi.id,
      },
      {
        title: "Bazaar & Pasar Kangen Nusantara Penang",
        description: "Nikmati aneka kuliner otentik Indonesia: Rendang Minang, Pempek Palembang, Bakso Solo, Sate Madura, Es Teler, dan aneka jajanan pasar khas kampung halaman.",
        category: "Culinary & Pasaran",
        date: "2025-05-03",
        time: "11:00 - 20:00 MYT",
        location: "Georgetown Esplanade Promenade, Penang",
        city: "Penang",
        capacity: 500,
        attendeesCount: 210,
        imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
        organizerId: dewi.id,
      },
      {
        title: "Webinar: Pemutih Permit Kerja & Legalitas WNI di Malaysia",
        description: "Diskusi komprehensif bersama pakar hukum dan Staf Konsuler KBRI mengenai regulasi terbaru visa kerja, izin tinggal, dan tips terhindar dari calo ilegal.",
        category: "Webinar & Skill",
        date: "2025-04-12",
        time: "19:30 - 21:00 MYT",
        location: "Zoom Online & Duta Rantau Live",
        city: "Kuala Lumpur",
        capacity: 1000,
        attendeesCount: 430,
        imageUrl: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=600&auto=format&fit=crop&q=80",
        organizerId: andi.id,
      },
    ]);

    // 4. Seed Jobs
    await db.insert(jobs).values([
      {
        title: "Dicari Chef / Juru Masak Masakan Padang Otentik",
        type: "job",
        category: "Culinary / Hospitality",
        salaryOrPrice: "RM 3,200 - RM 4,000 / bulan",
        description: "Warung Minang Penang membutuhkan Chef berpengalaman mengolah masakan Sumatera Barat. Disediakan mess tempat tinggal dan perlindungan asuransi.",
        location: "Penang",
        contactInfo: "WhatsApp +60145558899 (Ibu Dewi)",
        verificationStatus: "active",
        postedByUserId: dewi.id,
        datePosted: new Date(),
      },
      {
        title: "Sewa Kamar Medium Room Fully Furnished dekat LRT KL Sentral",
        type: "housing",
        category: "Akomodasi / Kost",
        salaryOrPrice: "RM 650 / bulan (Inc. Utilities)",
        description: "Kamar bersih, AC, WiFi 100Mbps, mesin cuci, dapur lengkap. Khusus sesama mahasiswa atau pekerja WNI yang rapi dan komunikatif.",
        location: "Kuala Lumpur",
        contactInfo: "WhatsApp +60189876543 (Siti)",
        verificationStatus: "active",
        postedByUserId: siti.id,
        datePosted: new Date(),
      },
      {
        title: "Jasa Titip Bumbu Masak & Camilan Khas Indonesia (Jastip Surabaya - KL)",
        type: "service",
        category: "Jastip / Logistik",
        salaryOrPrice: "Sesuai berat barang (Start RM 15/kg)",
        description: "Rencana penerbangan Surabaya - KL tanggal 25 April. Menerima pesanan bumbu kering, sambal kemasan, kerupuk, atau dokumen ringan.",
        location: "Kuala Lumpur",
        contactInfo: "Telegram / WA +60123456789 (Budi)",
        verificationStatus: "active",
        postedByUserId: budi.id,
        datePosted: new Date(),
      },
    ]);

    // 5. Seed Consular Guides
    await db.insert(consularGuides).values([
      {
        title: "Panduan Lengkap Perpanjangan Paspor RI di KBRI Kuala Lumpur",
        category: "Paspor & Dokumen",
        content: `### Langkah Perpanjangan Paspor RI di KBRI Kuala Lumpur

1. **Pendaftaran Antrean Online**:
   - Buka aplikasi SIMPONI KBRI KL atau portal janjitemu.
   - Siapkan e-KTP, Paspor Lama, dan Surat Izin Kerja / Visa / Student Pass.

2. **Dokumen Persyaratan Lengkap**:
   - Paspor Asli Lama + Fotokopi Halaman Utama & Halaman Visa.
   - e-KTP Asli / Kartu Identitas Malaysia (i-Kad).
   - Surat Keterangan Bekerja / Surat Keterangan Belajar dari Kampus.
   - Biaya Paspor 48 Halaman: RM 110 (Pembayaran Non-Tunai / Debit / QR).

3. **Prosedur Hari-H**:
   - Datang tepat waktu sesuai jam antrean ke KBRI KL (No. 233 Jalan Tun Razak, KL).
   - Pengambilan Foto Biometrik & Wawancara Singkat.
   - Pengambilan paspor dapat dilakukan dalam 3-4 hari kerja atau dikirim via pos terdaftar.`,
        essentialLinks: JSON.stringify([
          { label: "Portal Janjitemu KBRI KL", url: "https://kbrikualalumpur.org" },
          { label: "Brosur Tarif Resmi Konsuler", url: "https://kemlu.go.id/kualalumpur" },
        ]),
        helplinePhone: "+60321421354",
      },
      {
        title: "Prosedur Rekalibrasi Tenaga Kerja & Izin Tinggal Sah",
        category: "Izin Tinggal & Kerja",
        content: `### Informasi Program Rekalibrasi & Perlindungan Pekerja Migran

Program Rekalibrasi Tenaga Kerja bertujuan melegalkan pekerja asing yang memenuhi syarat melalui majikan resmi di Malaysia.

**Syarat Utama**:
1. Memiliki dokumen identitas (Paspor/SPLP) yang masih berlaku.
2. Tidak terdaftar dalam daftar hitam imigrasi.
3. Memiliki majikan resmi terdaftar di Jabatan Tenaga Kerja (JTK) Malaysia.

**Imbauan Penting KBRI**:
Hati-hati terhadap agen/calo tidak resmi yang menjanjikan kelulusan instan. Semua proses legalitas wajib melalui saluran resmi Jabatan Imigresen Malaysia & Satgas Perlindungan KBRI.`,
        essentialLinks: JSON.stringify([
          { label: "Portal Imigresen Malaysia", url: "https://imi.gov.my" },
          { label: "Pengaduan Satgas Tenaga Kerja", url: "https://kemlu.go.id/kualalumpur" },
        ]),
        helplinePhone: "+60123456789",
      },
      {
        title: "Kontak Emergency & Nomor Darurat 24/7 Seluruh Region",
        category: "Darurat & Hotline",
        content: `### Daftar Nomor Penting & Bantuan Cepat WNI

Apabila Anda atau keluarga mengalami kondisi darurat (kecelakaan, kesehatan, hukum, atau musibah):

- **Hotline Emergency KBRI Kuala Lumpur**: +60111222333 (WhatsApp 24 Jam)
- **KJRI Penang**: +60124445556
- **KJRI Johor Bahru**: +60177778889
- **KJRI Kuching / Kota Kinabalu**: +60138889900
- **Ambulans / Polisi Malaysia**: Dial 999
- **Posko Relawan Duta Rantau Bantuan Darurat**: +60123456789`,
        essentialLinks: JSON.stringify([
          { label: "Portal Layanan Peduli WNI Kemlu", url: "https://peduliwni.kemlu.go.id" },
        ]),
        helplinePhone: "+60111222333",
      },
    ]);

    // 6. Seed Emergency Alerts
    await db.insert(emergencyAlerts).values([
      {
        userId: siti.id,
        title: "Bantuan Pendampingan Bahasa & Transportasi Rumah Sakit",
        type: "Kesehatan / Darurat",
        city: "Kuala Lumpur",
        location: "Hospital Serdang, Selangor",
        description: "Rekan sesama mahasiswa dirawat karena tifus dan butuh pendampingan bahasa saat komunikasi dengan staf rumah sakit serta pengurusan klaim asuransi kampus.",
        urgency: "urgent",
        status: "seeking_help",
        contactNumber: "+60189876543",
      },
      {
        userId: budi.id,
        title: "Dompet Hilang Berisi Paspor & i-Kad a.n Rian Hidayat",
        type: "Dokumen Hilang",
        city: "Kuala Lumpur",
        location: "Sekitar Stasiun LRT KL Sentral - Nu Sentral",
        description: "Dompet kulit cokelat hilang kemarin malam sekitar jam 20:00 MYT. Berisi Paspor RI, i-Kad, dan kartu Touch n Go. Mohon bagi yang menemukan dapat menghubungi kontak berikut.",
        urgency: "high",
        status: "assisted",
        contactNumber: "+60123456789",
      },
    ]);

    console.log("Database successfully seeded!");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}
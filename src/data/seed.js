export const FALLBACK_CAR_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='480' viewBox='0 0 640 480'><rect width='640' height='480' fill='%2306283d'/><path d='M140 280 L190 195 H445 L495 280 V325 H455 V300 H185 V325 H140 Z' fill='%230d9488' stroke='%23fcd34d' stroke-width='4'/><circle cx='210' cy='300' r='28' fill='%2306283d' stroke='%23fcd34d' stroke-width='4'/><circle cx='430' cy='300' r='28' fill='%2306283d' stroke='%23fcd34d' stroke-width='4'/><text x='320' y='125' fill='%23ffffff' font-family='sans-serif' font-size='22' font-weight='bold' text-anchor='middle'>AcehDrive Rental</text></svg>";

export const HERO_IMAGE_PATH = '/src/assets/images/hero_aceh_coastal_highway_1795588888476.jpg';

const IMG_MPV = '/src/assets/images/fleet_mpv_family_1795588888125.jpg';
const IMG_SUV = '/src/assets/images/fleet_suv_highlands_1795588888572.jpg';
const IMG_CITY = '/src/assets/images/fleet_city_hatchback_1795588889269.jpg';
const IMG_MINIBUS = '/src/assets/images/fleet_minibus_tour_1795588888606.jpg';
const IMG_VIP = '/src/assets/images/fleet_vip_luxury_1795588889842.jpg';

/**
 * @typedef {Object} FleetVehicle
 * @property {string} id
 * @property {string} nama
 * @property {string} kategori
 * @property {string} wilayah
 * @property {'Matic' | 'Manual'} transmisi
 * @property {number} kursi
 * @property {string} bagasi
 * @property {string} bbm
 * @property {number} tahun
 * @property {number} hargaLepasKunci
 * @property {number} hargaDenganSopir
 * @property {boolean} bisaLepasKunci
 * @property {string[]} fasilitas
 * @property {string[]} ruteCocok
 * @property {string} imageUrl
 * @property {string} mapsUrl
 * @property {string} kontak
 */

/**
 * @typedef {Object} TransferPackage
 * @property {string} id
 * @property {string} nama
 * @property {string} rute
 * @property {string} durasi
 * @property {string} armada
 * @property {number} harga
 * @property {string} inklusi
 * @property {string} imageUrl
 */

/** @type {{ armada: FleetVehicle[], antarjemput: TransferPackage[] }} */
export const DEFAULT_DATA = {
  armada: [
    {
      id: 'car-01',
      nama: 'Toyota Kijang Innova Reborn 2.4 V',
      kategori: 'MPV Keluarga',
      wilayah: 'Bandara SIM',
      transmisi: 'Matic',
      kursi: 7,
      bagasi: '3 Koper Besar',
      bbm: 'Diesel',
      tahun: 2023,
      hargaLepasKunci: 550000,
      hargaDenganSopir: 750000,
      bisaLepasKunci: true,
      fasilitas: ['AC Double Blower', 'USB Fast Charger', 'Kotak P3K', 'Kamera Mundur', 'Baby Seat Opsional'],
      ruteCocok: ['kota', 'gunung'],
      imageUrl: IMG_MPV,
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Bandara+Sultan+Iskandar+Muda+Aceh',
      kontak: '6281200001001'
    },
    {
      id: 'car-02',
      nama: 'Toyota Avanza Veloz 1.5 Q',
      kategori: 'MPV Keluarga',
      wilayah: 'Banda Aceh',
      transmisi: 'Matic',
      kursi: 7,
      bagasi: '2 Koper Besar',
      bbm: 'Bensin',
      tahun: 2023,
      hargaLepasKunci: 400000,
      hargaDenganSopir: 600000,
      bisaLepasKunci: true,
      fasilitas: ['AC Double Blower', 'Apple CarPlay / Android Auto', 'Car Charger', 'Kotak P3K'],
      ruteCocok: ['kota'],
      imageUrl: IMG_MPV,
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Banda+Aceh',
      kontak: '6281200001002'
    },
    {
      id: 'car-03',
      nama: 'Toyota HiAce Commuter 14 Seat',
      kategori: 'Minibus / Rombongan',
      wilayah: 'Banda Aceh',
      transmisi: 'Manual',
      kursi: 14,
      bagasi: '6 Koper Besar',
      bbm: 'Diesel',
      tahun: 2022,
      hargaLepasKunci: 1100000,
      hargaDenganSopir: 1300000,
      bisaLepasKunci: false,
      fasilitas: ['AC Plafon Per Baris', 'Audio Karaoke & Mic', 'Reclining Seat', 'Bagasi Luas', 'Kotak P3K'],
      ruteCocok: ['kota', 'gunung', 'rombongan'],
      imageUrl: IMG_MINIBUS,
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pelabuhan+Ulee+Lheue+Banda+Aceh',
      kontak: '6281200001003'
    },
    {
      id: 'car-04',
      nama: 'Toyota Fortuner 2.8 VRZ 4x2',
      kategori: 'SUV / Medan Berat',
      wilayah: 'Takengon',
      transmisi: 'Matic',
      kursi: 7,
      bagasi: '3 Koper Besar',
      bbm: 'Diesel',
      tahun: 2023,
      hargaLepasKunci: 950000,
      hargaDenganSopir: 1150000,
      bisaLepasKunci: true,
      fasilitas: ['Suspensi Tangguh Pegunungan Gayo', 'AC Dual Zone', 'Cruise Control', 'Kotak P3K'],
      ruteCocok: ['kota', 'gunung'],
      imageUrl: IMG_SUV,
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Takengon+Aceh+Tengah',
      kontak: '6281200001004'
    },
    {
      id: 'car-05',
      nama: 'Mitsubishi Pajero Sport Dakar',
      kategori: 'SUV / Medan Berat',
      wilayah: 'Bandara SIM',
      transmisi: 'Matic',
      kursi: 7,
      bagasi: '3 Koper Besar',
      bbm: 'Diesel',
      tahun: 2023,
      hargaLepasKunci: 950000,
      hargaDenganSopir: 1150000,
      bisaLepasKunci: true,
      fasilitas: ['Torsi Tinggi Tanjakan Gayo', 'Sunroof', 'AC Double Blower', 'Car Charger'],
      ruteCocok: ['kota', 'gunung'],
      imageUrl: IMG_SUV,
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Bandara+Sultan+Iskandar+Muda+Aceh',
      kontak: '6281200001005'
    },
    {
      id: 'car-06',
      nama: 'Honda Brio Satya E CVT',
      kategori: 'City Car / Hatchback',
      wilayah: 'Sabang',
      transmisi: 'Matic',
      kursi: 5,
      bagasi: '1 Koper Sedang',
      bbm: 'Bensin',
      tahun: 2023,
      hargaLepasKunci: 300000,
      hargaDenganSopir: 500000,
      bisaLepasKunci: true,
      fasilitas: ['Hemat BBM', 'Lincah Jalan Pulau Weh', 'AC Dingin', 'Bluetooth Audio'],
      ruteCocok: ['kota'],
      imageUrl: IMG_CITY,
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pelabuhan+Balohan+Sabang',
      kontak: '6281200001006'
    },
    {
      id: 'car-07',
      nama: 'Mitsubishi Xpander Cross Premium',
      kategori: 'MPV Keluarga',
      wilayah: 'Aceh Besar',
      transmisi: 'Matic',
      kursi: 7,
      bagasi: '2 Koper Besar',
      bbm: 'Bensin',
      tahun: 2023,
      hargaLepasKunci: 450000,
      hargaDenganSopir: 650000,
      bisaLepasKunci: true,
      fasilitas: ['Ground Clearance Tinggi', 'AC Digital', 'Car Charger', 'Baby Seat Opsional'],
      ruteCocok: ['kota', 'gunung'],
      imageUrl: IMG_MPV,
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Lhoknga+Aceh+Besar',
      kontak: '6281200001007'
    },
    {
      id: 'car-08',
      nama: 'Toyota Alphard 2.5 G VIP',
      kategori: 'Luxury / VIP',
      wilayah: 'Bandara SIM',
      transmisi: 'Matic',
      kursi: 6,
      bagasi: '3 Koper Besar',
      bbm: 'Bensin',
      tahun: 2022,
      hargaLepasKunci: 2200000,
      hargaDenganSopir: 2400000,
      bisaLepasKunci: false,
      fasilitas: ['Captain Seat Ottoman', 'Dual Sunroof', 'Kabin Kedap Suara', 'Air Purifier'],
      ruteCocok: ['kota'],
      imageUrl: IMG_VIP,
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Bandara+Sultan+Iskandar+Muda+Aceh',
      kontak: '6281200001008'
    },
    {
      id: 'car-09',
      nama: 'Isuzu Elf Long Giga 17 Seat',
      kategori: 'Minibus / Rombongan',
      wilayah: 'Lhokseumawe',
      transmisi: 'Manual',
      kursi: 17,
      bagasi: '7 Koper Besar',
      bbm: 'Diesel',
      tahun: 2022,
      hargaLepasKunci: 1250000,
      hargaDenganSopir: 1450000,
      bisaLepasKunci: false,
      fasilitas: ['Kapasitas 17 Penumpang', 'AC Ducting Dingin', 'LED TV & Audio', 'Bagasi Belakang'],
      ruteCocok: ['kota', 'gunung', 'rombongan'],
      imageUrl: IMG_MINIBUS,
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kota+Lhokseumawe+Aceh',
      kontak: '6281200001009'
    },
    {
      id: 'car-10',
      nama: 'Toyota Agya 1.2 G GR Sport',
      kategori: 'City Car / Hatchback',
      wilayah: 'Banda Aceh',
      transmisi: 'Manual',
      kursi: 5,
      bagasi: '1 Koper Sedang',
      bbm: 'Bensin',
      tahun: 2023,
      hargaLepasKunci: 275000,
      hargaDenganSopir: 475000,
      bisaLepasKunci: true,
      fasilitas: ['Sangat Irit BBM', 'AC Sejuk', 'USB Charger', 'Kotak P3K'],
      ruteCocok: ['kota'],
      imageUrl: IMG_CITY,
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Banda+Aceh',
      kontak: '6281200001010'
    }
  ],
  antarjemput: [
    {
      id: 'trf-01',
      nama: 'Airport Transfer: Bandara SIM ⇄ Kota Banda Aceh',
      rute: 'Bandara Sultan Iskandar Muda - Hotel Pusat Kota / Pelabuhan Ulee Lheue',
      durasi: '± 30–45 Menit',
      armada: 'Avanza Veloz / Innova Reborn',
      harga: 180000,
      inklusi: 'Mobil + Sopir + BBM + Parkir Bandara (Simulasi)',
      imageUrl: IMG_MPV
    },
    {
      id: 'trf-02',
      nama: 'Shuttle Wisata Pulau Weh: Pelabuhan Balohan ⇄ Pantai Iboih',
      rute: 'Pelabuhan Balohan Sabang - Pantai Iboih / Tugu Kilometer Nol',
      durasi: '± 45–60 Menit',
      armada: 'MPV Keluarga / City Car',
      harga: 250000,
      inklusi: 'Mobil + Sopir Lokal Sabang + BBM (Simulasi)',
      imageUrl: IMG_CITY
    },
    {
      id: 'trf-03',
      nama: 'Overland Gayo: Banda Aceh ⇄ Takengon (Aceh Tengah)',
      rute: 'Banda Aceh / Bandara SIM - Bireuen - Takengon (Danau Laut Tawar)',
      durasi: '± 6–7 Jam Perjalanan',
      armada: 'Innova Reborn Diesel / Fortuner',
      harga: 1350000,
      inklusi: 'Mobil + Sopir Berpengalaman Medan Pegunungan + BBM (Simulasi)',
      imageUrl: IMG_SUV
    },
    {
      id: 'trf-04',
      nama: 'Transfer Pantai Timur: Bandara SIM ⇄ Kota Lhokseumawe',
      rute: 'Banda Aceh - Pidie - Bireuen - Lhokseumawe',
      durasi: '± 5–6 Jam Perjalanan',
      armada: 'Innova Reborn / Xpander Cross',
      harga: 1150000,
      inklusi: 'Mobil + Sopir + BBM (Simulasi)',
      imageUrl: IMG_MPV
    }
  ]
};

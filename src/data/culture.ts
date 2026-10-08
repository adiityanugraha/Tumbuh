import type { RegionId } from "@/lib/types";

export interface CultureItem {
  icon: string;
  kind: string;
  name: string;
  /** Asal atau arti singkat. */
  note: string;
}

// VERIFY: fakta budaya per wilayah disusun dari pengetahuan umum, wajib dicek manusia sebelum lomba.
export const CULTURE: Record<RegionId, CultureItem[]> = {
  sumatra: [
    { icon: "🏠", kind: "Rumah adat", name: "Rumah Gadang", note: "Sumatra Barat, atapnya runcing seperti tanduk kerbau" },
    { icon: "💃", kind: "Tarian", name: "Tari Saman", note: "Aceh, ditarikan berbaris dengan gerakan tangan yang cepat" },
    { icon: "🍛", kind: "Makanan khas", name: "Rendang", note: "Sumatra Barat, daging dimasak lama dengan santan dan rempah" },
    { icon: "👋", kind: "Ungkapan daerah", name: "Horas!", note: "Salam dari Batak, Sumatra Utara" },
  ],
  jawa: [
    { icon: "🏠", kind: "Rumah adat", name: "Joglo", note: "Jawa Tengah, atapnya tinggi di bagian tengah" },
    { icon: "💃", kind: "Tarian", name: "Tari Jaipong", note: "Jawa Barat, gerakannya lincah diiringi kendang" },
    { icon: "🍛", kind: "Makanan khas", name: "Gudeg", note: "Yogyakarta, dibuat dari nangka muda yang manis" },
    { icon: "👋", kind: "Ungkapan daerah", name: "Sugeng enjing", note: "Bahasa Jawa, artinya selamat pagi" },
  ],
  kalimantan: [
    { icon: "🏠", kind: "Rumah adat", name: "Rumah Betang", note: "Suku Dayak, rumah panjang yang dihuni banyak keluarga" },
    { icon: "💃", kind: "Tarian", name: "Tari Gantar", note: "Kalimantan Timur, menggambarkan kegiatan menanam padi" },
    { icon: "🍛", kind: "Makanan khas", name: "Soto Banjar", note: "Kalimantan Selatan, soto ayam berkuah rempah" },
    { icon: "👋", kind: "Ungkapan daerah", name: "Adil ka' talino", note: "Semboyan Dayak, artinya adil kepada sesama manusia" },
  ],
  sulawesi: [
    { icon: "🏠", kind: "Rumah adat", name: "Tongkonan", note: "Toraja, Sulawesi Selatan, atapnya melengkung seperti perahu" },
    { icon: "💃", kind: "Tarian", name: "Tari Pakarena", note: "Sulawesi Selatan, gerakannya lembut dan anggun" },
    { icon: "🍛", kind: "Makanan khas", name: "Coto Makassar", note: "Sulawesi Selatan, sup daging berbumbu kacang" },
    { icon: "👋", kind: "Ungkapan daerah", name: "Tabe'", note: "Bugis-Makassar, ucapan permisi yang sopan" },
  ],
  "bali-nusra": [
    { icon: "🏠", kind: "Rumah adat", name: "Mbaru Niang", note: "Flores, NTT, rumah kerucut beratap ilalang" },
    { icon: "💃", kind: "Tarian", name: "Tari Kecak", note: "Bali, penarinya duduk melingkar sambil berseru \"cak\"" },
    { icon: "🍛", kind: "Makanan khas", name: "Ayam Taliwang", note: "Lombok, NTB, ayam bakar berbumbu pedas" },
    { icon: "👋", kind: "Ungkapan daerah", name: "Om Swastiastu", note: "Salam dari Bali" },
  ],
  "maluku-papua": [
    { icon: "🏠", kind: "Rumah adat", name: "Honai", note: "Papua, rumah bulat beratap jerami yang hangat" },
    { icon: "💃", kind: "Tarian", name: "Tari Cakalele", note: "Maluku, tarian perang dengan pedang dan perisai" },
    { icon: "🍛", kind: "Makanan khas", name: "Papeda", note: "Maluku dan Papua, bubur sagu yang kenyal" },
    { icon: "👋", kind: "Ungkapan daerah", name: "Ale rasa beta rasa", note: "Semboyan Maluku, artinya kamu rasa aku juga rasa" },
  ],
};

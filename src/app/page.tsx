// PLACEHOLDER: halaman awal Fase 0 untuk memeriksa token desain dan font. Diganti onboarding di Fase 2.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <span className="rounded-full bg-daun-100 px-4 py-1 text-sm font-bold text-daun-800">
        Untuk anak SD kelas 1-6
      </span>
      <h1 className="font-display text-4xl font-semibold text-daun-800">
        Tumbuh
      </h1>
      <p className="text-lg text-tinta-redup">
        Belajar sedikit setiap hari, kebunmu tumbuh, dan Nusantara terbuka satu per satu.
      </p>
      <div className="flex gap-3" aria-hidden="true">
        <span className="size-10 rounded-full bg-daun-500" />
        <span className="size-10 rounded-full bg-tanah-500" />
        <span className="size-10 rounded-full bg-kunyit-400" />
        <span className="size-10 rounded-full bg-langit-500" />
      </div>
      <button
        type="button"
        className="min-h-touch rounded-blob bg-daun-600 px-8 font-display text-xl text-white shadow-daun transition hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
      >
        Ayo Belajar!
      </button>
    </main>
  );
}

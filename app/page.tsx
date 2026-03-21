'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-dvh px-5 py-10" style={{ background: '#0f0a1e' }}>
      {/* Title */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="text-8xl mb-5">🕵️</div>
        <h1 className="text-6xl font-black text-purple-300 mb-2">ئیمپۆستەر</h1>
        <p className="text-xl text-white/50 mb-12">کێیە ئیمپۆستەرەکە؟</p>

        {/* How to play */}
        <div
          className="w-full max-w-sm rounded-2xl p-5 text-right mb-10"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
        >
          <h2 className="text-base font-bold text-purple-300 mb-3">⚙️ چۆنیەتی یاری</h2>
          <ul className="space-y-2 text-white/60 text-sm leading-relaxed">
            <li>🔹 هەموو یاریزانان یەک پەیامیان دەبینن</li>
            <li>🔹 ئیمپۆستەر تەنیا بەکتی پەیامەکەی دەبینێت</li>
            <li>🔹 لە باسکردندا هەوڵ بدە ئیمپۆستەرەکە بناسیتەوە</li>
            <li>🔹 دەنگدان دەکرێت — کەسی زیاتر دەنگی بۆ بدرێت دەردەچێت</li>
            <li>🔹 ئەگەر ئیمپۆستەرەکە دەردەکەوێت — هاوشارەکان دەبەن</li>
            <li>🔹 ئەگەر ئیمپۆستەر بمێنێتەوە — ئیمپۆستەر دەبات</li>
          </ul>
        </div>
      </div>

      {/* Start button pinned to bottom */}
      <div>
        <button
          onClick={() => router.push('/lobby')}
          className="w-full text-white font-black text-2xl py-6 rounded-2xl active:scale-95 transition-all shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          🎮 دەستپێکردنی یاری
        </button>
        <p className="mt-4 text-center text-white/25 text-sm">٣ - ١٠ یاریزان</p>
      </div>
    </div>
  );
}

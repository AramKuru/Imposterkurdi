'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { clearGame } from '@/lib/gameStore';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    clearGame();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-10">
      {/* Title */}
      <div className="text-center mb-10">
        <div className="text-7xl mb-4">🕵️</div>
        <h1 className="text-5xl font-black text-purple-300 mb-2">ئیمپۆستەر</h1>
        <p className="text-xl text-white/60">کێیە ئیمپۆستەرەکە؟</p>
      </div>

      {/* How to play */}
      <div
        className="w-full max-w-md rounded-2xl p-5 mb-8 text-right"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <h2 className="text-lg font-bold text-purple-300 mb-3">⚙️ چۆنیەتی یاری</h2>
        <ul className="space-y-2 text-white/70 text-sm leading-relaxed">
          <li>🔹 هەموو یاریزانان یەک پەیامیان دەبینن</li>
          <li>🔹 ئیمپۆستەر تەنیا بەکتی پەیامەکەی دەبینێت</li>
          <li>🔹 لە باسکردندا هەوڵ بدە ئیمپۆستەرەکە بناسیتەوە</li>
          <li>🔹 ئیمپۆستەر هەوڵ دەدات خۆی بشارێتەوە</li>
          <li>🔹 دەنگدان دەکرێت بۆ دەرکردنی کەسێک</li>
          <li>🔹 ئەگەر ئیمپۆستەرەکە دەردەکەوێت — هاوشارەکان دەبەن</li>
          <li>🔹 ئەگەر ئیمپۆستەر بمێنێتەوە — ئیمپۆستەر دەبات</li>
        </ul>
      </div>

      {/* Start button */}
      <button
        onClick={() => router.push('/lobby')}
        className="w-full max-w-md text-white font-black text-2xl py-5 rounded-2xl transition-all duration-150 active:scale-95 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
      >
        🎮 دەستپێکردنی یاری
      </button>

      <p className="mt-6 text-white/30 text-sm">٣ - ١٠ یاریزان</p>
    </main>
  );
}

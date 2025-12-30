'use client';

import { useState } from "react";

export default function SafeImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="relative aspect-video bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 flex items-center justify-center">
        <div className="text-center text-gray-400 text-sm space-y-2">
          <p>სურათი ვერ ჩაიტვირთა</p>
          {src && (
            <a href={src} target="_blank" rel="noreferrer" className="text-blue-400 underline">
              გახსნა ბმული
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
    />
  );
}

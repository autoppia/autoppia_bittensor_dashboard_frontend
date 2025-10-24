"use client";

import { ValidatorImageFill } from "@/app/shared/validator-image";
import Image from "next/image";

export default function TestImagesPage() {
  const testImages = [
    { name: "Autoppia", src: "/validators/Autoppia.png" },
    { name: "Kraken", src: "/validators/Kraken.png" },
    { name: "tao5", src: "/validators/tao5.png" },
    { name: "RoundTable21", src: "/validators/RoundTable21.png" },
    { name: "Yuma", src: "/validators/Yuma.png" },
    { name: "Other", src: "/validators/Other.png" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Validator Images Test</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {testImages.map((image) => (
          <div key={image.name} className="border p-4 rounded-lg">
            <h3 className="font-semibold mb-2">{image.name}</h3>
            
            {/* Test 1: ValidatorImageFill Component */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">ValidatorImageFill:</p>
              <div className="w-16 h-16 border border-gray-300 rounded-full overflow-hidden">
                <ValidatorImageFill
                  src={image.src}
                  alt={image.name}
                  className="w-full h-full"
                  showErrorState={true}
                />
              </div>
            </div>

            {/* Test 2: Direct Next.js Image */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Next.js Image (unoptimized):</p>
              <div className="w-16 h-16 border border-gray-300 rounded-full overflow-hidden">
                <Image
                  src={image.src}
                  alt={image.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                  unoptimized={true}
                />
              </div>
            </div>

            {/* Test 3: Regular img tag */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Regular img tag:</p>
              <div className="w-16 h-16 border border-gray-300 rounded-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={image.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">URL: {image.src}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="font-semibold mb-2">Debug Info:</h2>
        <p className="text-sm">Check browser console for any errors</p>
        <p className="text-sm">Check Network tab for failed requests</p>
        <p className="text-sm">All images should be accessible at: http://localhost:3000{testImages[0].src}</p>
      </div>
    </div>
  );
}

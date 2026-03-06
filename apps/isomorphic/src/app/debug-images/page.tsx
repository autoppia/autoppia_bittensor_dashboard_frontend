"use client";

import { ValidatorImageFill } from "@/app/shared/validator-image";
import Image from "next/image";

export default function DebugImagesPage() {
  const testImage = "/validators/Autoppia.png";

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Validator Image Debug</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Test 1: ValidatorImageFill Component */}
        <div className="border p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">ValidatorImageFill Component</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Small (48x48):</p>
              <div className="w-12 h-12 border border-gray-300 rounded-full overflow-hidden bg-gray-100">
                <ValidatorImageFill
                  src={testImage}
                  alt="Autoppia"
                  className="w-full h-full"
                  showErrorState={true}
                />
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Medium (96x96):</p>
              <div className="w-24 h-24 border border-gray-300 rounded-full overflow-hidden bg-gray-100">
                <ValidatorImageFill
                  src={testImage}
                  alt="Autoppia"
                  className="w-full h-full"
                  showErrorState={true}
                />
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Large (192x192):</p>
              <div className="w-48 h-48 border border-gray-300 rounded-full overflow-hidden bg-gray-100">
                <ValidatorImageFill
                  src={testImage}
                  alt="Autoppia"
                  className="w-full h-full"
                  showErrorState={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Test 2: Direct Next.js Image */}
        <div className="border p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Next.js Image Component</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Small (48x48):</p>
              <div className="w-12 h-12 border border-gray-300 rounded-full overflow-hidden bg-gray-100">
                <Image
                  src={testImage}
                  alt="Autoppia"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                  unoptimized={true}
                />
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Medium (96x96):</p>
              <div className="w-24 h-24 border border-gray-300 rounded-full overflow-hidden bg-gray-100">
                <Image
                  src={testImage}
                  alt="Autoppia"
                  width={96}
                  height={96}
                  className="w-full h-full object-contain"
                  unoptimized={true}
                />
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Large (192x192):</p>
              <div className="w-48 h-48 border border-gray-300 rounded-full overflow-hidden bg-gray-100">
                <Image
                  src={testImage}
                  alt="Autoppia"
                  width={192}
                  height={192}
                  className="w-full h-full object-contain"
                  unoptimized={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Test 3: Regular img tag */}
        <div className="border p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Regular img Tag</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Small (48x48):</p>
              <div className="w-12 h-12 border border-gray-300 rounded-full overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={testImage}
                  alt="Autoppia"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Medium (96x96):</p>
              <div className="w-24 h-24 border border-gray-300 rounded-full overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={testImage}
                  alt="Autoppia"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Large (192x192):</p>
              <div className="w-48 h-48 border border-gray-300 rounded-full overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={testImage}
                  alt="Autoppia"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Test 4: All Validators */}
        <div className="border p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">All Validators</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "Autoppia", src: "/validators/Autoppia.png" },
              { name: "Kraken", src: "/validators/Kraken.png" },
              { name: "tao5", src: "/validators/tao5.png" },
              { name: "RoundTable21", src: "/validators/roundtable.jpg" },
              { name: "Yuma", src: "/validators/Yuma.png" },
              { name: "Other", src: "/validators/Other.png" },
            ].map((validator) => (
              <div key={validator.name} className="text-center">
                <div className="w-16 h-16 border border-gray-300 rounded-full overflow-hidden bg-gray-100 mx-auto mb-2">
                  <ValidatorImageFill
                    src={validator.src}
                    alt={validator.name}
                    className="w-full h-full"
                    showErrorState={true}
                  />
                </div>
                <p className="text-sm font-medium">{validator.name}</p>
                <p className="text-xs text-gray-500">{validator.src}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
        <ul className="text-sm space-y-1">
          <li>• Test URL: <code className="bg-gray-100 px-1 rounded">http://localhost:3000{testImage}</code></li>
          <li>• Check browser Network tab for failed requests</li>
          <li>• Check browser Console for JavaScript errors</li>
          <li>• If images show &quot;Failed to load&quot;, there&apos;s a network issue</li>
          <li>• If images show loading spinner, there&apos;s a component issue</li>
          <li>• If images show but are blank, there&apos;s a CSS issue</li>
        </ul>
      </div>
    </div>
  );
}

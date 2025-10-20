"use client";

import Image from "next/image";
import {
  PiClockDuotone,
  PiArrowSquareOutDuotone,
  PiGithubLogoDuotone,
} from "react-icons/pi";

export default function TaskPersonas() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Round Card */}
      <div className="bg-gradient-to-br from-amber-500/15 via-yellow-500/15 to-orange-500/15 border-2 border-amber-500/40 rounded-2xl p-5 hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
        <div className="text-center h-full flex flex-col justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl mb-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 mx-auto">
            <PiClockDuotone className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <h3 className="text-sm font-medium text-amber-300 mb-2">ROUND</h3>
          <div className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">#11</div>
          <div className="text-xs text-amber-200 mt-2">Current evaluation round</div>
        </div>
      </div>

      {/* Validator Card */}
      <div className="bg-gradient-to-br from-purple-500/15 via-pink-500/15 to-purple-600/15 border-2 border-purple-500/40 rounded-2xl p-5 hover:border-purple-400/60 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
        <div className="flex items-center space-x-4 h-20 mb-4">
          <div className="relative">
            <Image
              alt="Autoppia"
              width={56}
              height={56}
              className="rounded-xl group-hover:scale-105 transition-transform"
              src="/validators/Autoppia.png"
            />
            <a
              href="https://taostats.io/validators/5K3mR7pqX2NfHgL9QzVb8aEj6WcKt4Mp7"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
              title="View on TaoStats"
            >
              <PiArrowSquareOutDuotone className="w-3 h-3 text-white" />
            </a>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-purple-300 mb-1">VALIDATOR</h3>
            <p className="text-xl font-bold text-white mb-1">Autoppia</p>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">Running</span>
              <span className="text-xs text-purple-200">v7.2.1</span>
            </div>
          </div>
        </div>
        <div className="bg-purple-500/20 rounded-lg p-3">
          <div className="text-xs text-purple-200 mb-1">Validator Hotkey</div>
          <div className="font-mono text-sm text-white">5K3mR7pqX2NfHgL9QzVb...</div>
        </div>
      </div>

      {/* Agent Card */}
      <div className="bg-gradient-to-br from-blue-500/15 via-cyan-500/15 to-blue-600/15 border-2 border-blue-500/40 rounded-2xl p-5 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
        <div className="flex items-center space-x-4 h-20 mb-4">
          <div className="relative">
            <Image
              alt="Miner 1"
              width={56}
              height={56}
              className="rounded-xl group-hover:scale-105 transition-transform"
              src="/miners/1.svg"
            />
            <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-xs font-bold text-white shadow-lg">#1</div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-300 mb-1">AGENT</h3>
            <p className="text-xl font-bold text-white mb-1">Miner 1</p>
            <p className="text-xs text-blue-200">UID: 001</p>
          </div>
          <a
            href="https://github.com/miner1-agent"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-blue-500/30 rounded-lg hover:bg-blue-500/50 transition-all group-hover:scale-110"
          >
            <PiGithubLogoDuotone className="w-5 h-5 text-blue-300" />
          </a>
        </div>
        <div className="bg-blue-500/20 rounded-lg p-3">
          <div className="text-xs text-blue-200 mb-1">Bittensor Hotkey</div>
          <div className="font-mono text-sm text-white">5GHrA5gqhWVm1Cp92jXa...</div>
        </div>
      </div>
    </div>
  );
}

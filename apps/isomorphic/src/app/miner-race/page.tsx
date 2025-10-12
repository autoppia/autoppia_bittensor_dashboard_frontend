"use client";

import { useState, useEffect, useRef } from "react";
import WidgetCard from "@core/components/cards/widget-card";
import ButtonGroupAction from "@core/components/charts/button-group-action";
import cn from "@core/utils/class-names";
import { 
  FaPlay, 
  FaPause, 
  FaRedo, 
  FaStepForward, 
  FaStepBackward,
  FaTrophy,
  FaMedal,
  FaCrown,
  FaArrowUp,
  FaArrowDown,
  FaMinus
} from "react-icons/fa";
import { Title, Text } from 'rizzui/typography';
import PageHeader from "@/app/shared/page-header";

// Mock data for top 5 miners over 25 days
const generateMockData = () => {
  const miners = [
    { 
      id: 1, 
      name: "QuantumMiner", 
      color: "#10b981",
      avatar: "🤖",
      image: "/icons/quantum-miner.png",
      carIcon: "🚗"
    },
    { 
      id: 2, 
      name: "NeuralNet", 
      color: "#3b82f6",
      avatar: "🧠",
      image: "/icons/neural-net.png",
      carIcon: "🏎️"
    },
    { 
      id: 3, 
      name: "CryptoForge", 
      color: "#f59e0b",
      avatar: "⚡",
      image: "/icons/crypto-forge.png",
      carIcon: "🚙"
    },
    { 
      id: 4, 
      name: "BlockChain", 
      color: "#ef4444",
      avatar: "🔗",
      image: "/icons/blockchain.png",
      carIcon: "🚕"
    },
    { 
      id: 5, 
      name: "DataMiner", 
      color: "#8b5cf6",
      avatar: "💎",
      image: "/icons/data-miner.png",
      carIcon: "🚓"
    },
  ];

  const days = 25; // More rounds for smoother animation
  const data: DayData[] = [];

  // Generate initial scores with more variation (60-100 range)
  let scores = miners.map(() => 60 + Math.random() * 40);

  for (let day = 0; day < days; day++) {
    const dayData = {
      day: day + 1,
      date: new Date(Date.now() - (days - day - 1) * 24 * 60 * 60 * 1000),
      miners: miners.map((miner, index) => {
        // Add more variation to scores each day for better separation
        const variation = (Math.random() - 0.5) * 8; // ±4 points
        scores[index] = Math.max(50, Math.min(100, scores[index] + variation));
        
        return {
          ...miner,
          score: Math.round(scores[index] * 10) / 10, // Round to 1 decimal
          rank: 0, // Will be set later
          previousRank: day > 0 ? data[day - 1].miners[index].rank : index + 1,
          rankChange: 0, // Will be calculated later
        };
      }),
    };

    // Sort by score and assign ranks
    dayData.miners.sort((a, b) => b.score - a.score);
    dayData.miners.forEach((miner, index) => {
      const newRank = index + 1;
      miner.rankChange = miner.previousRank - newRank; // positive = moved up
      miner.rank = newRank;
    });

    data.push(dayData);
  }

  return data;
};

interface MinerData {
  id: number;
  name: string;
  color: string;
  avatar: string;
  image: string;
  carIcon: string;
  score: number;
  rank: number;
  previousRank: number;
  rankChange: number; // positive = moved up, negative = moved down, 0 = no change
}

interface DayData {
  day: number;
  date: Date;
  miners: MinerData[];
}

export default function MinerRacePage() {
  const [data, setData] = useState<DayData[]>([]);
  const [currentDay, setCurrentDay] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(100); // milliseconds per frame for smoother animation
  const [animatingMiners, setAnimatingMiners] = useState<Set<number>>(new Set());
  const [previousMiners, setPreviousMiners] = useState<MinerData[]>([]);
  const [interpolatedProgress, setInterpolatedProgress] = useState(0); // For smooth movement
  const [isClient, setIsClient] = useState(false);

  // Initialize data on client side only to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
    setData(generateMockData());
  }, []);

  // Animation controls with smooth interpolation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentDay < data.length - 1) {
      interval = setInterval(() => {
        setInterpolatedProgress(prev => {
          const newProgress = prev + (100 / (speed / 10)); // Smooth interpolation
          if (newProgress >= 100) {
            setCurrentDay(day => Math.min(day + 1, data.length - 1));
            return 0;
          }
          return newProgress;
        });
      }, 10); // 10ms for very smooth animation
    } else if (currentDay >= data.length - 1) {
      setIsPlaying(false);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentDay, data.length, speed]);

  // Handle position change animations
  useEffect(() => {
    if (currentDay > 0 && data[currentDay]) {
      const currentMiners = data[currentDay].miners;
      const minersWithChanges = currentMiners.filter(miner => miner.rankChange !== 0);
      
      if (minersWithChanges.length > 0) {
        // Start animation for miners with rank changes
        setAnimatingMiners(new Set(minersWithChanges.map(m => m.id)));
        
        // Clear animation after 2 seconds
        setTimeout(() => {
          setAnimatingMiners(new Set());
        }, 2000);
      }
    }
    
    // Update previous miners for next comparison
    if (data[currentDay]) {
      setPreviousMiners(data[currentDay].miners);
    }
  }, [currentDay, data]);

  const handlePlay = () => {
    if (currentDay >= data.length - 1) {
      setCurrentDay(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentDay(0);
    setInterpolatedProgress(0);
  };

  const handleNext = () => {
    if (currentDay < data.length - 1) {
      setCurrentDay(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentDay > 0) {
      setCurrentDay(prev => prev - 1);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  // Don't render until client-side data is ready
  if (!isClient || data.length === 0) {
    return (
      <>
        <PageHeader title="Miner Race" />
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-gray-600">Loading race data...</div>
        </div>
      </>
    );
  }

  const currentData = data[currentDay];
  const topMiner = currentData.miners[0]; // Current #1 miner

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <FaCrown className="h-4 w-4 text-yellow-500" />;
      case 2: return <FaMedal className="h-4 w-4 text-gray-400" />;
      case 3: return <FaMedal className="h-4 w-4 text-amber-600" />;
      default: return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankChangeIcon = (rankChange: number) => {
    if (rankChange > 0) {
      return <FaArrowUp className="h-3 w-3 text-green-500" />;
    } else if (rankChange < 0) {
      return <FaArrowDown className="h-3 w-3 text-red-500" />;
    }
    return <FaMinus className="h-3 w-3 text-gray-400" />;
  };

  const getRankChangeText = (rankChange: number) => {
    if (rankChange > 0) {
      return `+${rankChange}`;
    } else if (rankChange < 0) {
      return `${rankChange}`;
    }
    return "0";
  };

  const getRankChangeColor = (rankChange: number) => {
    if (rankChange > 0) return "text-green-600";
    if (rankChange < 0) return "text-red-600";
    return "text-gray-500";
  };

  return (
    <>
      <PageHeader title="Miner Race" />
      
      {/* Line Graph Race - Chess ELO Style */}
      <div className="relative bg-black min-h-screen">
        {/* Top Left - Current #1 Miner Info */}
        <div className="absolute top-6 left-6 z-20">
          <div className="text-white">
            <div className="text-sm text-gray-400 mb-2">The history of the top miners over time</div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl">
                {topMiner.avatar}
              </div>
              <div>
                <div className="text-lg font-bold text-white">{topMiner.name}</div>
                <div className="text-sm text-gray-300">UID: {topMiner.id}</div>
                <div className="text-sm text-white">#{topMiner.rank} miner ({topMiner.score}%)</div>
                <div className="text-xs text-gray-400">for {Math.floor((topMiner.id * 3) % 12) + 1} months</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Right - Current Round */}
        <div className="absolute top-6 right-6 z-20 text-right">
          <div className="text-3xl font-bold text-white">Round {currentData.day}</div>
          <div className="text-sm text-gray-400">Top miners by score</div>
        </div>

        {/* Main Chart Area */}
        <div className="relative h-screen pt-24 pb-20">
          {/* Grid Lines */}
          <div className="absolute inset-0 opacity-20">
            {/* Horizontal Grid Lines */}
            {[50, 60, 70, 80, 90, 100].map((score) => (
              <div
                key={score}
                className="absolute w-full h-px bg-gray-600"
                style={{ top: `${((100 - score) / 50) * 100}%` }}
              />
            ))}
            {/* Vertical Grid Lines */}
            {Array.from({ length: data.length }, (_, i) => (
              <div
                key={i}
                className="absolute h-full w-px bg-gray-600"
                style={{ left: `${(i / (data.length - 1)) * 100}%` }}
              />
            ))}
          </div>

          {/* Y-Axis Labels */}
          <div className="absolute left-4 top-24 bottom-20 flex flex-col justify-between text-white text-sm">
            {[100, 90, 80, 70, 60, 50].map((score) => (
              <div key={score}>{score}%</div>
            ))}
          </div>

          {/* X-Axis Labels */}
          <div className="absolute bottom-20 left-0 right-0 flex justify-between text-white text-sm px-8">
            {Array.from({ length: Math.min(6, data.length) }, (_, i) => {
              const index = Math.floor((i / 5) * (data.length - 1));
              return (
                <div key={i}>Round {data[index]?.day || i + 1}</div>
              );
            })}
          </div>

          {/* Line Graphs */}
          <svg className="absolute inset-0 w-full h-full" style={{ top: '6rem', bottom: '5rem' }}>
            {currentData.miners.map((miner, index) => {
              const points = data.slice(0, currentDay + 1).map((dayData, dayIndex) => {
                const minerData = dayData.miners.find(m => m.id === miner.id);
                if (!minerData) return null;
                
                const x = (dayIndex / (data.length - 1)) * 100;
                const y = ((100 - minerData.score) / 50) * 100; // Convert to percentage
                return `${x},${y}`;
              }).filter(Boolean).join(' ');

              return (
                <g key={miner.id}>
                  {/* Line Path */}
                  <polyline
                    points={points}
                    fill="none"
                    stroke={miner.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Current Position Dot */}
                  {currentDay >= 0 && (
                    <circle
                      cx={(currentDay / (data.length - 1)) * 100}
                      cy={((100 - miner.score) / 50) * 100}
                      r="6"
                      fill={miner.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                  )}
                  
                  {/* Miner Name at End of Line */}
                  <text
                    x={(currentDay / (data.length - 1)) * 100 + 10}
                    y={((100 - miner.score) / 50) * 100 + 5}
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {miner.name} ({miner.score}%)
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend - Right Side */}
        <div className="absolute top-24 right-6 w-64 space-y-2">
          {currentData.miners.map((miner, index) => (
            <div key={miner.id} className="flex items-center gap-3 text-white text-sm">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: miner.color }}
              />
              <div className="flex-1">
                <div className="font-semibold">{miner.name}</div>
                <div className="text-xs text-gray-400">UID: {miner.id}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{miner.score}%</div>
                <div className="text-xs text-gray-400">#{miner.rank}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Animation Controls - Bottom */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-900/80 backdrop-blur-sm rounded-lg px-6 py-3">
          <button
            onClick={handlePlay}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
              isPlaying 
                ? "bg-red-500 text-white hover:bg-red-600" 
                : "bg-green-500 text-white hover:bg-green-600"
            )}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FaRedo />
          </button>
          
          <div className="flex items-center gap-2 text-white">
            <span className="text-sm">Speed:</span>
            <ButtonGroupAction
              options={["0.5x", "1x", "2x", "4x"]}
              onChange={(option) => {
                switch (option) {
                  case "0.5x": setSpeed(2000); break;
                  case "1x": setSpeed(1000); break;
                  case "2x": setSpeed(500); break;
                  case "4x": setSpeed(250); break;
                }
              }}
            />
          </div>
          
          <div className="text-white text-sm">
            {currentDay + 1} / {data.length}
          </div>
        </div>
      </div>
    </>
  );
}
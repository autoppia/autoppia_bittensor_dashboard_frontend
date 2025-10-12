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

// Mock data for top 5 miners over 7 days
const generateMockData = () => {
  const miners = [
    { 
      id: 1, 
      name: "QuantumMiner", 
      color: "#10b981",
      avatar: "🤖"
    },
    { 
      id: 2, 
      name: "NeuralNet", 
      color: "#3b82f6",
      avatar: "🧠"
    },
    { 
      id: 3, 
      name: "CryptoForge", 
      color: "#f59e0b",
      avatar: "⚡"
    },
    { 
      id: 4, 
      name: "BlockChain", 
      color: "#ef4444",
      avatar: "🔗"
    },
    { 
      id: 5, 
      name: "DataMiner", 
      color: "#8b5cf6",
      avatar: "💎"
    },
  ];

  const days = 7;
  const data: DayData[] = [];

  // Generate initial scores (around 80-95 range)
  let scores = miners.map(() => 80 + Math.random() * 15);

  for (let day = 0; day < days; day++) {
    const dayData = {
      day: day + 1,
      date: new Date(Date.now() - (days - day - 1) * 24 * 60 * 60 * 1000),
      miners: miners.map((miner, index) => {
        // Add some variation to scores each day
        const variation = (Math.random() - 0.5) * 4; // ±2 points
        scores[index] = Math.max(70, Math.min(100, scores[index] + variation));
        
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
  const [data] = useState<DayData[]>(generateMockData());
  const [currentDay, setCurrentDay] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // milliseconds per frame
  const [animatingMiners, setAnimatingMiners] = useState<Set<number>>(new Set());
  const [previousMiners, setPreviousMiners] = useState<MinerData[]>([]);

  // Animation controls
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentDay < data.length - 1) {
      interval = setInterval(() => {
        setCurrentDay(prev => Math.min(prev + 1, data.length - 1));
      }, speed);
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

  const currentData = data[currentDay];

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
      
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <FaTrophy className="h-8 w-8 text-yellow-500" />
            <Title as="h1" className="text-3xl font-bold text-gray-900">
              Top 5 Miners Ranking Race
            </Title>
            <FaTrophy className="h-8 w-8 text-yellow-500" />
          </div>
          <Text className="text-gray-600">
            Watch the competition unfold as miners compete for the top spot
          </Text>
        </div>

        {/* Controls */}
        <WidgetCard
          title="Animation Controls"
          action={
            <ButtonGroupAction
              options={["Slow", "Normal", "Fast"]}
              onChange={(option) => {
                switch (option) {
                  case "Slow": setSpeed(2000); break;
                  case "Normal": setSpeed(1000); break;
                  case "Fast": setSpeed(500); break;
                }
              }}
            />
          }
          headerClassName="flex-row items-start space-between"
          rounded="xl"
        >
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handlePrevious}
              disabled={currentDay === 0}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaStepBackward className="h-4 w-4" />
            </button>
            
            <button
              onClick={handlePlay}
              className={`px-6 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                isPlaying 
                  ? "bg-red-600 text-white hover:bg-red-700" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isPlaying ? <FaPause className="h-4 w-4" /> : <FaPlay className="h-4 w-4" />}
              {isPlaying ? "Pause" : "Play"}
            </button>
            
            <button
              onClick={handleNext}
              disabled={currentDay >= data.length - 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaStepForward className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleReset}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2"
            >
              <FaRedo className="h-4 w-4" />
              Reset
            </button>
          </div>
        </WidgetCard>


        {/* Live Ranking Chart */}
        <WidgetCard
          title=""
          rounded="xl"
          className="relative"
        >
          {/* Round Info - Top Left */}
          <div className="absolute top-4 left-6 z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border">
              <div className="text-sm font-semibold text-gray-700">
                Round {currentData.day}
              </div>
              <div className="text-xs text-gray-500">
                {currentData.date.toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Live Ranking Chart Title - Top Right */}
          <div className="absolute top-4 right-6 z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border">
              <div className="text-sm font-semibold text-gray-700">
                Live Ranking Chart
              </div>
              <div className="text-xs text-gray-500">
                {currentDay + 1} of {data.length}
              </div>
            </div>
          </div>
          <div className="space-y-3 pt-16">
            {currentData.miners.map((miner, index) => (
              <div 
                key={miner.id} 
                className={cn(
                  "relative transition-all duration-500",
                  animatingMiners.has(miner.id) && "transform scale-105"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold transition-all duration-500",
                      animatingMiners.has(miner.id) && "animate-pulse"
                    )}
                         style={{ 
                           backgroundColor: miner.color,
                           boxShadow: animatingMiners.has(miner.id) ? `0 0 15px ${miner.color}60` : "none"
                         }}>
                      {miner.rank}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{miner.name}</span>
                      {currentDay > 0 && miner.rankChange !== 0 && (
                        <div className={cn(
                          "flex items-center gap-1 text-xs font-bold transition-all duration-300",
                          getRankChangeColor(miner.rankChange),
                          animatingMiners.has(miner.id) && "animate-bounce"
                        )}>
                          {getRankChangeIcon(miner.rankChange)}
                          <span>{getRankChangeText(miner.rankChange)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-gray-700">{miner.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden relative">
                  <div
                    className={cn(
                      "h-full rounded-full flex items-center justify-end pr-3 transition-all duration-1000 ease-out relative",
                      animatingMiners.has(miner.id) && "animate-pulse"
                    )}
                    style={{ 
                      backgroundColor: miner.color,
                      width: `${miner.score}%`,
                      boxShadow: animatingMiners.has(miner.id) ? `0 0 10px ${miner.color}40` : "none"
                    }}
                  >
                    <span className="text-white text-sm font-medium">
                      {miner.score}%
                    </span>
                    
                    {/* Animated shine effect for rank changes */}
                    {animatingMiners.has(miner.id) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </WidgetCard>



      </div>
    </>
  );
}
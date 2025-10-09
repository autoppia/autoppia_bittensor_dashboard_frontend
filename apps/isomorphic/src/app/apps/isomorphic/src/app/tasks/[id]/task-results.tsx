"use client";

import { Text } from "rizzui";
import {
  PiArrowRight,
  PiClock,
  PiKeyboard,
  PiCursorClick,
  PiScroll,
} from "react-icons/pi";

const actions = [
  {
    icon: <PiArrowRight />,
    content:
      "NavigateAction(url='http://localhost:8000/', selector=null, go_forward=false, go_back=false)",
  },
  {
    icon: <PiClock />,
    content: "WaitAction(selector=null, time_seconds=5, timeout_seconds=5.0)",
  },
  {
    icon: <PiKeyboard />,
    content:
      "TypeAction(selector='//html/body/main/div/div[2]/div[2]/div[1]', text='Sample Text')",
  },
  {
    icon: <PiCursorClick />,
    content:
      "ClickAction(selector='//html/body/main/div/div[2]/div[2]/div[1]')",
  },
  {
    icon: <PiScroll />,
    content: "ScrollAction(value=null, up=false, down=true)",
  },
];

export default function TaskResults() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side - Actions */}
      <div className="border border-muted rounded-lg p-4 bg-gray-50 hover:border-emerald-500">
        <Text className="text-white text-lg font-medium mb-4">Actions</Text>
        <div className="space-y-2 border border-muted rounded-lg h-[350px] p-4 overflow-y-auto custom-scrollbar scroll-auto">
          {actions.map((action, index) => (
            <div
              key={`action-item-${index}`}
              className="w-full flex items-center bg-gray-100 rounded-lg px-3 py-2 italic text-gray-800"
            >
              {action.icon}
              <Text className="ms-2 font-medium w-full truncate">
                {action.content}
              </Text>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Generated GIF */}
      <div className="border border-muted rounded-lg p-4 bg-gray-50 hover:border-emerald-500">
        <Text className="text-white text-lg font-medium mb-4">
          Generated GIF
        </Text>
        <div className="flex justify-center items-center w-full h-[350px] bg-gray-900 border border-muted rounded-lg">
          <div className="text-3xl font-bold text-gray-100">Coming Soon</div>
        </div>
      </div>
    </div>
  );
}

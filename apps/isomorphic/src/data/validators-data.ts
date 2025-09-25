export type ValidatorDataType = {
  id: string;
  name: string;
  hotkey: string;
  icon: string;
  status: string;
  total_tasks: number;
  weight: number;
  updated: number;
  version: number;
};

export const validatorsData: ValidatorDataType[] = [
  {
    id: "autoppia",
    name: "Web Agents - Autoppia",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/Autoppia.png",
    status: "Online",
    total_tasks: 5787,
    weight: 1722467.28,
    updated: 556,
    version: 7,
  },
  {
    id: "tao5",
    name: "tao5",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/tao5.png",
    status: "Online",
    total_tasks: 2465,
    weight: 217234.77,
    updated: 262,
    version: 4,
  },
  {
    id: "roundtable21",
    name: "RoundTable21",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/RoundTable21.png",
    status: "Online",
    total_tasks: 3465,
    weight: 200261.91,
    updated: 1836,
    version: 5,
  },
  {
    id: "yuma",
    name: "Yuma, a DCG Company",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/Yuma.png",
    status: "Online",
    total_tasks: 2465,
    weight: 143629.17,
    updated: 203,
    version: 5,
  },
  {
    id: "kraken",
    name: "Kraken",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/Kraken.png",
    status: "Online",
    total_tasks: 12465,
    weight: 90782,
    updated: 193,
    version: 2,
  },
  {
    id: "other",
    name: "Other",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/Other.png",
    status: "Online",
    total_tasks: 2465,
    weight: 51105.44,
    updated: 77,
    version: 5,
  },
];

export const validatorsDataMap = validatorsData.reduce((acc, validator) => {
  acc[validator.id] = validator;
  return acc;
}, {} as Record<string, ValidatorDataType>);

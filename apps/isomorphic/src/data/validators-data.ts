export type ValidatorDataType = {
  uid: number;
  name: string;
  hotkey: string;
  icon: string;
  total_tasks: number;
  weight: number;
  updated: number;
  version: number;
};

export const validatorsData: ValidatorDataType[] = [
  {
    uid: 195,
    name: "Web Agents - Autoppia",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/Autoppia.png",
    total_tasks: 5787,
    weight: 1722467.28,
    updated: 556,
    version: 7,
  },
  {
    uid: 13,
    name: "tao5",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/tao5.png",
    total_tasks: 2465,
    weight: 217234.77,
    updated: 262,
    version: 4,
  },
  {
    uid: 3,
    name: "RoundTable21",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/RoundTable21.png",
    total_tasks: 3465,
    weight: 200261.91,
    updated: 1836,
    version: 5,
  },
  {
    uid: 71,
    name: "Yuma, a DCG Company",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/Yuma.png",
    total_tasks: 2465,
    weight: 143629.17,
    updated: 203,
    version: 5,
  },
  {
    uid: 46,
    name: "Kraken",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/Kraken.png",
    total_tasks: 12465,
    weight: 90782,
    updated: 193,
    version: 2,
  },
  {
    uid: 181,
    name: "Other",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/Other.png",
    total_tasks: 2465,
    weight: 51105.44,
    updated: 77,
    version: 5,
  },
];

export const validatorsDataMap = validatorsData.reduce((acc, validator) => {
  acc[validator.uid] = validator;
  return acc;
}, {} as Record<number, ValidatorDataType>);

export type ValidatorDataType = {
  id: string;
  name: string;
  hotkey: string;
  icon: string;
  currentTask: string;
  status: string;
  total_tasks: number;
  weight: number;
  trust: number;
  version: number;
};

export const validatorsData: ValidatorDataType[] = [
  {
    id: "autoppia",
    name: "Autoppia",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/Autoppia.png",
    currentTask: "Login for the following username:user<web_agent_id> and password:password123. Modify your profile to ensure that your favorite genres are NOT in the list 'Sci-Fi'.",
    status: "Sending Tasks",
    total_tasks: 5787,
    weight: 1722467.28,
    trust: 1,
    version: 7,
  },
  {
    id: "tao5",
    name: "tao5",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/tao5.png",
    currentTask: "Show details for a movie that was NOT released in the year '1990'",
    status: "Evaluating",
    total_tasks: 2465,
    weight: 217234.77,
    trust: 0.9687,
    version: 4,
  },
  {
    id: "roundtable21",
    name: "RoundTable21",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/RoundTable21.png",
    currentTask: "Fill out the contact form with a name equal to 'Linda', a message that does not contain 'Just a quick question', and an email that contains 'jane@doe.com'.",
    status: "Waiting",
    total_tasks: 3465,
    weight: 200261.91,
    trust: 0.9676 ,
    version: 5,
  },
  {
    id: "yuma",
    name: "Yuma",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/Yuma.png",
    currentTask: "Delete a film whose year is NOT in the list [2014, 1990, 1994] and whose name is NOT equal to 'The Matrix' with a rating equal to 4.6.",
    status: "Evaluating",
    total_tasks: 2465,
    weight: 143629.17,
    trust: 0.9665,
    version: 5,
  },
  {
    id: "kraken",
    name: "Kraken",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/Kraken.png",
    currentTask: "First, authenticate with username '<web_agent_id>' and password 'password123' to log in successfully.",
    status: "Sending Tasks",
    total_tasks: 12465,
    weight: 90782,
    trust: 0.9654,
    version: 2,
  },
  {
    id: "other",
    name: "Other",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/Other.png",
    currentTask: "Add a comment to a movie with a comment whose content contains 'kept me on the edge of my seat' and a commenter name equal to 'Rachel'",
    status: "Evaluating",
    total_tasks: 2465,
    weight: 51105.44,
    trust: 0.9643,
    version: 5,
  },
];

export const validatorsDataMap = validatorsData.reduce(
  (acc, validator) => {
    acc[validator.id] = validator;
    return acc;
  },
  {} as Record<string, ValidatorDataType>
);

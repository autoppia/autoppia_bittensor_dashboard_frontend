export type MinerDataType = {
  uid: number;
  hotkey: string;
  success: boolean;
  score: number;
  duration: number;
  ranking?: number;
};

export const minersData: MinerDataType[] = [
  {
    uid: 42,
    hotkey: "5GHrA5gqhWVm1Cp92jXaoH7caxtE7xsFHxJooL5h8aE9mdTe",
    success: true,
    score: 0.92,
    duration: 28,
  },
  {
    uid: 178,
    hotkey: "5C566yptkTiKzucfGfLAukFDhRAJzwyeUTaCz8sURJf9i8Ro",
    success: false,
    score: 0.0,
    duration: 45,
  },
  {
    uid: 89,
    hotkey: "5FRJ6wrpqJQateosCLawN7BYCaUNEWyZCAL6FJ23XLRNBxYU",
    success: true,
    score: 0.87,
    duration: 32,
  },
  {
    uid: 203,
    hotkey: "5HZHLmhQDUajftPpVkzKw5SyGVweYMxTX4XYWhLQAUkWfLbs",
    success: true,
    score: 0.95,
    duration: 24,
  },
  {
    uid: 156,
    hotkey: "5GKs7YTqZMa9XMPw7G36zgQjj6gUViWyz53CCrNr2mMvKFFj",
    success: false,
    score: 0.0,
    duration: 60,
  },
  {
    uid: 67,
    hotkey: "5HMvjiEyE2XCN4cZiBkQToSLbXym2ymAVUp5G1up3W5ACSiD",
    success: true,
    score: 0.78,
    duration: 38,
  },
  {
    uid: 234,
    hotkey: "5DZLS9jVKXBiatEb8A9YxGmq3hpi6ZVfP4sdZ7JSWU2Qn19o",
    success: true,
    score: 0.83,
    duration: 35,
  },
  {
    uid: 12,
    hotkey: "5GR9cwwWrQsLLQijWmiaTvCbNgrQ7FS2zEvazAZqgZLVw3ks",
    success: true,
    score: 0.71,
    duration: 42,
  },
  {
    uid: 145,
    hotkey: "5DnH8hXjKjQfGKRJHvr3nXBKzrH9P2mK8wL5vN3qT7xE2yF9",
    success: true,
    score: 0.89,
    duration: 29,
  },
  {
    uid: 98,
    hotkey: "5FhG7kL3mN9pQ2rS4tU6vW8xY1zA3bC5dE7fH9jK2lM4nO6p",
    success: false,
    score: 0.15,
    duration: 55,
  },
];

export const sortedMinersData: MinerDataType[] = minersData
  .sort((a, b) => b.score - a.score)
  .map((miner, index) => ({ ...miner, ranking: index + 1 }));

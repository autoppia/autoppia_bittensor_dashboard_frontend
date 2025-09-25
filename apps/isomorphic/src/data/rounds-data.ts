export type RoundType = {
  id: number;
  startBlock: number;
  endBlock: number;
  current: boolean;
};

export const roundsData: RoundType[] = [
  {
    id: 1,
    startBlock: 6507001,
    endBlock: 6508000,
    current: false,
  },
  {
    id: 2,
    startBlock: 6508001,
    endBlock: 6509000,
    current: false,
  },
  {
    id: 3,
    startBlock: 6509001,
    endBlock: 6510000,
    current: false,
  },
  {
    id: 4,
    startBlock: 6510001,
    endBlock: 6511000,
    current: false,
  },
  {
    id: 5,
    startBlock: 6511001,
    endBlock: 6512000,
    current: false,
  },
  {
    id: 6,
    startBlock: 6512001,
    endBlock: 6513000,
    current: false,
  },
  {
    id: 7,
    startBlock: 6513001,
    endBlock: 6514000,
    current: true,
  }
];

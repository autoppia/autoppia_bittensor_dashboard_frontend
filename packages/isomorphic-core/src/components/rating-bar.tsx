"use client";

import { Box, Flex, Text } from "rizzui";

type RatingProgressProps = {
  ratingCount: number;
};

const BAR_POSITIONS = [0, 1, 2, 3, 4] as const;

export default function RatingBar({
  ratingCount,
}: Readonly<RatingProgressProps>) {
  const { text, color } = getRatingStyles(ratingCount);
  return (
    <Box className="space-y-2">
      <Text>{text}</Text>
      <Flex gap="1">
        {BAR_POSITIONS.map((position) => (
          <Box
            key={position}
            className="h-2 w-8 rounded-full bg-gray-100"
            style={{
              backgroundColor: ratingCount <= position ? "" : color,
            }}
          />
        ))}
      </Flex>
    </Box>
  );
}

function getRatingStyles(v: number) {
  let text = "";
  let color = "";

  switch (v) {
    case 5:
      text = "Perfect";
      color = "#0DA000";
      break;
    case 4:
      text = "Very Good";
      color = "#29CCB1";
      break;
    case 3:
      text = "Good";
      color = "#29CCB1";
      break;
    case 2:
      text = "Bad";
      color = "#EE6D3D";
      break;
    default:
      text = "Very Bad";
      color = "#EE6D3D";
  }

  return { text, color };
}

'use client';

import { useEffect, useState } from 'react';

type CountdownType = {
  target: Date;
};

function format(value: number): string {
  if (value > 9) {
    return String(value);
  }

  return `0${value}`;
}

function calculateTimeRemaining(target: Date) {
  const now = Date.now();
  const timeRemaining = target.getTime() - now;

  if (timeRemaining <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const hours = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  return {
    hours,
    minutes,
    seconds,
  };
}

export function CountDown({ target }: Readonly<CountdownType>) {
  const [time, setTime] = useState(() => calculateTimeRemaining(target));

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTime(calculateTimeRemaining(target));
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [target]);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-gray-300/70 dark:text-gray-600">Ends In</span>
      <p className="text-gray-100 @5xl:text-xl dark:text-gray-900">
        {format(time.hours)}h {format(time.minutes)}m {format(time.seconds)}s
      </p>
    </div>
  );
}

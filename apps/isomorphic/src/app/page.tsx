import { metaObject } from '@/config/site.config';
import Leaderboard from './leaderboard';

export const metadata = {
  ...metaObject(),
};

export default function Page() {
  return (
    <Leaderboard />
  )
}

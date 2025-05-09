import Leaderboard from './leaderboard';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Leaderboard'),
};

export default function Page() {
  return (
    <Leaderboard />
  )
}

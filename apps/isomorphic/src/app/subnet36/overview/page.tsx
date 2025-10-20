import { metaObject } from '@/config/site.config';
import Overview from './overview';

export const metadata = {
  ...metaObject(),
};

export default function Page() {
  return (
    <Overview />
  )
}

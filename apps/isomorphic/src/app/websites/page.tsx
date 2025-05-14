import Websites from './websites';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Websites'),
};

export default function Page() {
  return (
    <Websites />
  )
}

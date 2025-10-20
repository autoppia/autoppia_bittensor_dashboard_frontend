import { metaObject } from '@/config/site.config';
import TestAgent from './test-agent';

export const metadata = {
  ...metaObject(),
};

export default function Page() {
  return <TestAgent />;
}

import { metaObject } from '@/config/site.config';
import ApiTest from '../overview/api-test';

export const metadata = {
  ...metaObject(),
};

export default function ApiTestPage() {
  return (
    <div className="container mx-auto py-8">
      <ApiTest />
    </div>
  );
}

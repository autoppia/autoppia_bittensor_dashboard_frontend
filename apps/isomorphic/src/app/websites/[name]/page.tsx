import { metaObject } from '@/config/site.config';
import WebsiteDetail from './website-detail';

export const metadata = {
  ...metaObject(),
};

export default function Page() {
  return <WebsiteDetail />;
}

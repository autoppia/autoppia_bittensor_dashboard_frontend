import { metaObject } from '@/config/site.config';
import Details from './agents';

export const metadata = {
    ...metaObject(),
};

export default function Page() {
    return (
        <Details />
    );
}
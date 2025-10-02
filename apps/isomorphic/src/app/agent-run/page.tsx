import { Suspense } from 'react';
import { metaObject } from '@/config/site.config';
import AgentRun from './agent-run';

export const metadata = {
    ...metaObject(),
};

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AgentRun />
        </Suspense>
    );
}
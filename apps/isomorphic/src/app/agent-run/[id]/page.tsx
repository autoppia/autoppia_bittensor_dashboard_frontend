import { metaObject } from '@/config/site.config';
import AgentRun from './agent-run';

export const metadata = {
    ...metaObject(),
};

export default function Page() {
    return (
        <AgentRun />
    );
}
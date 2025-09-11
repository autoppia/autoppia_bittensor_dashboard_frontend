import { metaObject } from '@/config/site.config';
import TaskDetails from './task-details';

export const metadata = {
    ...metaObject(),
};

export default function Page() {
    return (
        <TaskDetails />
    );
}
import PageHeader from "@/app/shared/page-header";
import TasksStat from "@/app/tasks/tasks-stat";
import { metaObject } from "@/config/site.config";
import OrderTable from '@/app/shared/tasks-table/table';

export const metadata = {
  ...metaObject(),
};

export default function FileListPage() {
  return (
    <>
      <PageHeader title="Tasks" className="mt-4" />
      <TasksStat className="mb-6 @5xl:mb-8 @7xl:mb-11" />
      <OrderTable variant="elegant" />
    </>
  );
}

/**
 * Evaluation details page - shows task details for a specific evaluation (task + miner combination)
 * Uses the same UI components as task details, but loads data for a specific evaluation_id
 */

import { metaObject } from "@/config/site.config";
import TaskDynamic from "../../tasks/[id]/task-dynamic";

export const metadata = {
  ...metaObject(),
};

export default function EvaluationPage() {
  // TaskDynamic will automatically detect if the id is an evaluation_id
  // and load the correct data through the repository
  return <TaskDynamic />;
}

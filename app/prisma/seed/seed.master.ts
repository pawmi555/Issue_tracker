import { seedUserRoles } from "./master/userRole.seed.js";
import { seedProjectRoles } from "./master/projectRole.seed.js";
import { seedIssueStatuses } from "./master/issueStatus.seed.js";
import { seedIssuePriorities } from "./master/issuePriority.seed.js";
import { seedHistoryAction } from "./master/historyAction.seed.js";

export const runMasterSeeds = async () => {
  await seedUserRoles();
  await seedProjectRoles();
  await seedIssueStatuses();
  await seedIssuePriorities();
  await seedHistoryAction();
};

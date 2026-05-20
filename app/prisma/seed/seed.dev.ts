import { seedUsers } from "./dev/user.seed.js";
import { seedProjects } from "./dev/project.seed.js";
import { seedProjectMembers } from "./dev/projectMember.seed.js";
import { seedIssues } from "./dev/issue.seed.js";

export const runDevSeeds = async () => {
  await seedUsers();
  await seedProjects();
  await seedProjectMembers();
  await seedIssues();
};

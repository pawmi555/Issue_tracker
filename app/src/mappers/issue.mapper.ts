export const mapIssueResponse = (issue: {
  id: number;
  title: string;
  description: string | null;
  dueDate: Date | null;
  updatedAt: Date;
  status: {
    id: number;
    name: string;
    label: string;
  };
  priority: {
    id: number;
    name: string;
    label: string;
  };
  assignee: {
    id: number;
    name: string;
  } | null;
}) => ({
  id: issue.id,
  title: issue.title,
  description: issue.description,
  dueDate: issue.dueDate,
  status: issue.status,
  priority: issue.priority,
  assignee: issue.assignee,
  updatedAt: issue.updatedAt,
});

export type IssueDto = {
  id: number;
  title: string;
  description: string | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;

  status?: {
    id: number;
    name: string;
    label: string;
  };

  priority?: {
    id: number;
    name: string;
    label: string;
  };

  project?: {
    id: number;
    name: string;
  };

  assignee?: {
    id: number;
    name: string;
  };

  reporter?: {
    id: number;
    name: string;
  };

  comments?: {
    id: number;
    content: string;
  }[];
};

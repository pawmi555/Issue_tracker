type SummaryUser = {
  id: number;
  name: string;
};

type SummaryProject = {
  id: number;
  name: string;
};

type SummaryComment = {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: SummaryUser;
};

export type IssueMapperInput = {
  id: number;

  title: string;

  description: string | null;

  dueDate: Date | null;

  createdAt: Date;

  updatedAt: Date;

  deletedAt?: Date | null;

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

  project?: SummaryProject | null;
  assignee?: SummaryUser | null;
  reporter?: SummaryUser | null;
  comments?: SummaryComment[];
};

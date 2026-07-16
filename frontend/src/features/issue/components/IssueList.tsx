import {
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";

import { useNavigate } from "react-router";

import { formatDateTime } from "../../../utils/formatDateTime";

import type { IssueSummary } from "../types/issue.types";

type IssueListProps = {
  issues: IssueSummary[];
};

export default function IssueList({ issues }: IssueListProps) {
  const navigate = useNavigate();

  if (issues.length === 0) {
    return (
      <Typography color="text.secondary">
        条件に一致するIssueはありません。
      </Typography>
    );
  }

  return (
    <Paper variant="outlined">
      <List disablePadding>
        {issues.map((issue) => (
          <ListItemButton
            key={issue.id}
            divider
            onClick={() => {
              navigate(`/issues/${issue.id}`);
            }}
          >
            <ListItemText
              primary={issue.title}
              secondary={[
                `担当者: ${issue.assignee?.name ?? "未割り当て"}`,
                `期限: ${
                  issue.dueDate ? formatDateTime(issue.dueDate) : "未設定"
                }`,
                `更新: ${formatDateTime(issue.updatedAt)}`,
              ].join(" / ")}
            />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}

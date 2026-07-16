import { MenuItem, Stack, TextField } from "@mui/material";

import { ISSUE_PRIORITIES, ISSUE_STATUSES } from "../constants/issue.constants";

type IssueFiltersProps = {
  keyword: string;
  statusId: number | "";
  priorityId: number | "";
  onKeywordChange: (value: string) => void;
  onStatusChange: (value: number | "") => void;
  onPriorityChange: (value: number | "") => void;
};

export default function IssueFilters({
  keyword,
  statusId,
  priorityId,
  onKeywordChange,
  onStatusChange,
  onPriorityChange,
}: IssueFiltersProps) {
  return (
    <Stack
      direction={{
        xs: "column",
        md: "row",
      }}
      spacing={2}
    >
      <TextField
        label="キーワード検索"
        value={keyword}
        onChange={(event) => {
          onKeywordChange(event.target.value);
        }}
        fullWidth
      />

      <TextField
        label="ステータス"
        select
        value={statusId}
        onChange={(event) => {
          const value = event.target.value;

          onStatusChange(value === "" ? "" : Number(value));
        }}
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="">すべて</MenuItem>

        {ISSUE_STATUSES.map((status) => (
          <MenuItem key={status.id} value={status.id}>
            {status.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="優先度"
        select
        value={priorityId}
        onChange={(event) => {
          const value = event.target.value;

          onPriorityChange(value === "" ? "" : Number(value));
        }}
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="">すべて</MenuItem>

        {ISSUE_PRIORITIES.map((priority) => (
          <MenuItem key={priority.id} value={priority.id}>
            {priority.label}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}

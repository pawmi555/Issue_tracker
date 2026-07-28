import { Chip, Divider, Stack, Typography } from "@mui/material";

import { formatDateTime } from "../../../utils/formatDateTime";

import type {
  History,
  HistoryAction,
  HistoryField,
  HistoryValue,
} from "../types/history.types";

type HistoryItemProps = {
  history: History;
};

const ACTION_LABELS: Record<HistoryAction, string> = {
  CREATE: "作成",
  UPDATE: "更新",
  DELETE: "削除",
  RESTORE: "復元",
};

const FIELD_LABELS: Record<HistoryField, string> = {
  name: "名前",
  email: "メールアドレス",
  role: "ロール",
  project: "Project名",
  description: "説明",
  title: "タイトル",
  status: "ステータス",
  priority: "優先度",
  assignee: "担当者",
  dueDate: "期限",
  deletedAt: "削除日時",
  content: "内容",
};

const formatHistoryValue = (
  value: HistoryValue,
  field: HistoryField,
): string => {
  if (value === null || value === "") {
    return "未設定";
  }

  if (
    (field === "dueDate" || field === "deletedAt") &&
    typeof value === "string"
  ) {
    return formatDateTime(value);
  }

  if (typeof value === "boolean") {
    return value ? "はい" : "いいえ";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

export default function HistoryItem({ history }: HistoryItemProps) {
  const actionLabel = ACTION_LABELS[history.action];
  const fieldLabel = FIELD_LABELS[history.field];

  return (
    <Stack spacing={1.5}>
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={1}
        sx={{
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Chip label={actionLabel} size="small" variant="outlined" />

          <Typography sx={{ fontWeight: 600 }}>{fieldLabel}</Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {formatDateTime(history.createdAt)}
        </Typography>
      </Stack>

      {history.action === "UPDATE" && (
        <Stack spacing={0.5}>
          <Typography
            variant="body2"
            sx={{
              overflowWrap: "anywhere",
            }}
          >
            変更前：
            {formatHistoryValue(history.oldValue, history.field)}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              overflowWrap: "anywhere",
            }}
          >
            変更後：
            {formatHistoryValue(history.newValue, history.field)}
          </Typography>
        </Stack>
      )}

      {history.action === "CREATE" && (
        <Typography
          variant="body2"
          sx={{
            overflowWrap: "anywhere",
          }}
        >
          作成時の値：
          {formatHistoryValue(history.newValue, history.field)}
        </Typography>
      )}

      {history.action === "DELETE" && (
        <Typography variant="body2">Issueが削除されました。</Typography>
      )}

      {history.action === "RESTORE" && (
        <Typography variant="body2">Issueが復元されました。</Typography>
      )}

      <Typography variant="body2" color="text.secondary">
        操作者：{history.changedBy.name}
      </Typography>

      <Divider />
    </Stack>
  );
}

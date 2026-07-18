import { useState } from "react";

import {
  Alert,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { getApiError } from "../../../utils/getApiError";

import { useIssueHistories } from "../hooks/useIssueHistories";

import HistoryItem from "./HistoryItem";

type IssueHistorySectionProps = {
  issueId: number;
};

const HISTORY_LIMIT = 10;

export default function IssueHistorySection({
  issueId,
}: IssueHistorySectionProps) {
  const [page, setPage] = useState(1);

  const historyQuery = useIssueHistories({
    issueId,
    page,
    limit: HISTORY_LIMIT,
  });

  if (historyQuery.isPending) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack
          spacing={2}
          sx={{
            alignItems: "center",
          }}
        >
          <CircularProgress size={28} />

          <Typography color="text.secondary">
            変更履歴を読み込んでいます。
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (historyQuery.isError) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5" component="h2">
            変更履歴
          </Typography>

          <Alert severity="error">
            {getApiError(historyQuery.error).message}
          </Alert>

          <Button
            variant="outlined"
            onClick={() => {
              void historyQuery.refetch();
            }}
            sx={{
              alignSelf: "flex-start",
            }}
          >
            再読み込み
          </Button>
        </Stack>
      </Paper>
    );
  }

  const histories = historyQuery.data.data;
  const meta = historyQuery.data.meta;

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h5" component="h2">
            変更履歴
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Issueに対して行われた変更を確認できます。
          </Typography>
        </Stack>

        {historyQuery.isFetching && (
          <Typography color="text.secondary" variant="body2">
            変更履歴を更新中...
          </Typography>
        )}

        {histories.length === 0 ? (
          <Typography color="text.secondary">変更履歴はありません。</Typography>
        ) : (
          <Stack spacing={2}>
            {histories.map((history, index) => (
              <HistoryItem
                key={[
                  history.createdAt,
                  history.changedBy.id,
                  history.field,
                  history.action,
                  index,
                ].join("-")}
                history={history}
              />
            ))}
          </Stack>
        )}

        {meta.totalPages > 1 && (
          <Stack
            direction="row"
            spacing={2}
            sx={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              variant="outlined"
              disabled={page <= 1 || historyQuery.isFetching}
              onClick={() => {
                setPage((currentPage) => Math.max(1, currentPage - 1));
              }}
            >
              前へ
            </Button>

            <Typography>
              {meta.page} / {meta.totalPages}
            </Typography>

            <Button
              variant="outlined"
              disabled={page >= meta.totalPages || historyQuery.isFetching}
              onClick={() => {
                setPage((currentPage) =>
                  Math.min(meta.totalPages, currentPage + 1),
                );
              }}
            >
              次へ
            </Button>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

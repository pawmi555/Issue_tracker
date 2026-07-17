import { useState } from "react";

import {
  Alert,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { useNavigate, useParams } from "react-router";

import FullScreenLoading from "../components/common/FullScreenLoading";

import { useDeleteIssue } from "../features/issue/hooks/useDeleteIssue";
import { useIssue } from "../features/issue/hooks/useIssue";
import { useProject } from "../features/project/hooks/useProject";
import CommentSection from "../features/comment/components/CommentSection";
import IssueHistorySection from "../features/history/components/IssueHistorySection";

import EditIssueDialog from "../features/issue/components/EditIssueDialog";

import {
  getProjectRole,
  hasProjectRole,
} from "../features/project/utils/projectPermissions";

import { useAuthStore } from "../stores/auth.store";
import { formatDateTime } from "../utils/formatDateTime";
import { getApiError } from "../utils/getApiError";

export default function IssueDetailPage() {
  const { issueId } = useParams();
  const navigate = useNavigate();

  const parsedIssueId = Number(issueId);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);

  const issueQuery = useIssue(parsedIssueId);

  const projectId = issueQuery.data?.project?.id ?? 0;

  const projectQuery = useProject(projectId);

  const deleteMutation = useDeleteIssue();

  if (!Number.isInteger(parsedIssueId) || parsedIssueId <= 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Issue IDが不正です。</Alert>
      </Container>
    );
  }

  if (issueQuery.isPending || (projectId > 0 && projectQuery.isPending)) {
    return <FullScreenLoading />;
  }

  if (issueQuery.isError || !issueQuery.data) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Issueの取得に失敗しました。</Alert>
      </Container>
    );
  }

  const issue = issueQuery.data;
  const project = projectQuery.data;

  if (!project) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Project情報の取得に失敗しました。</Alert>
      </Container>
    );
  }

  const currentRole = user ? getProjectRole(project, user.id) : null;

  const isAssignee = user?.id === issue.assignee?.id;

  const canUpdate = isAssignee || hasProjectRole(currentRole, "MANAGER");

  const canDelete = hasProjectRole(currentRole, "MANAGER");

  const canManageComments = hasProjectRole(currentRole, "MANAGER");

  const canCreateComment = hasProjectRole(currentRole, "MEMBER");

  const handleDelete = async () => {
    const confirmed = window.confirm(`「${issue.title}」を削除しますか？`);

    if (!confirmed) {
      return;
    }

    setDeleteError(null);

    try {
      await deleteMutation.mutateAsync({
        issueId: issue.id,
        projectId: project.id,
      });

      navigate(`/projects/${project.id}/issues`, {
        replace: true,
      });
    } catch (error) {
      setDeleteError(getApiError(error).message);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Button
          onClick={() => {
            navigate(`/projects/${project.id}/issues`);
          }}
          sx={{ alignSelf: "flex-start" }}
        >
          Issue一覧へ戻る
        </Button>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
          sx={{ justifyContent: "space-between" }}
        >
          <div>
            <Typography variant="h4" component="h1">
              {issue.title}
            </Typography>

            <Typography color="text.secondary">
              Project: {project.name}
            </Typography>
          </div>

          <Stack direction="row" spacing={2}>
            {canUpdate && (
              <Button
                variant="outlined"
                disabled={issue.status.name === "CLOSED"}
                onClick={() => {
                  setIsEditOpen(true);
                }}
              >
                編集
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outlined"
                color="error"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  void handleDelete();
                }}
              >
                削除
              </Button>
            )}
          </Stack>
        </Stack>

        {deleteError && <Alert severity="error">{deleteError}</Alert>}

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Chip
                label={issue.status.label}
                color={issue.status.name === "CLOSED" ? "default" : "primary"}
              />

              <Chip
                label={`優先度: ${issue.priority.label}`}
                variant="outlined"
              />
            </Stack>

            <Divider />

            <div>
              <Typography variant="h6" gutterBottom>
                説明
              </Typography>

              <Typography
                sx={{
                  whiteSpace: "pre-wrap",
                }}
              >
                {issue.description || "説明はありません。"}
              </Typography>
            </div>

            <Divider />

            <Typography>
              担当者: {issue.assignee?.name ?? "未割り当て"}
            </Typography>

            <Typography>報告者: {issue.reporter?.name ?? "不明"}</Typography>

            <Typography>
              期限: {issue.dueDate ? formatDateTime(issue.dueDate) : "未設定"}
            </Typography>

            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              作成日時: {formatDateTime(issue.createdAt)}
            </Typography>

            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              更新日時: {formatDateTime(issue.updatedAt)}
            </Typography>
          </Stack>
        </Paper>

        {user && (
          <CommentSection
            issueId={issue.id}
            currentUserId={user.id}
            canCreate={canCreateComment}
            canManageComments={canManageComments}
          />
        )}

        <IssueHistorySection issueId={issue.id} />
      </Stack>

      <EditIssueDialog
        issue={issue}
        members={project.members}
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
        }}
      />
    </Container>
  );
}

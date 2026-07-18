import { useState } from "react";

import {
  Alert,
  Button,
  Container,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";

import { useNavigate, useParams } from "react-router";

import FullScreenLoading from "../components/common/FullScreenLoading";

import CreateIssueDialog from "../features/issue/components/CreateIssueDialog";
import IssueFilters from "../features/issue/components/IssueFilters";
import IssueList from "../features/issue/components/IssueList";

import { useIssues } from "../features/issue/hooks/useIssues";
import { useProject } from "../features/project/hooks/useProject";

import { getApiError } from "../utils/getApiError";

const PAGE_LIMIT = 20;

export default function IssuesPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const parsedProjectId = Number(projectId);

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [statusId, setStatusId] = useState<number | "">("");
  const [priorityId, setPriorityId] = useState<number | "">("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const projectQuery = useProject(parsedProjectId);

  const issuesQuery = useIssues({
    projectId: parsedProjectId,
    page,
    limit: PAGE_LIMIT,
    keyword: keyword || undefined,
    statusId: statusId === "" ? undefined : statusId,
    priorityId: priorityId === "" ? undefined : priorityId,
    sort: "createdAt",
    order: "desc",
    include: "assignee,reporter",
  });

  if (!Number.isInteger(parsedProjectId) || parsedProjectId <= 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Project IDが不正です。</Alert>
      </Container>
    );
  }

  if (projectQuery.isPending || issuesQuery.isPending) {
    return <FullScreenLoading />;
  }

  const queryError = projectQuery.isError
    ? projectQuery.error
    : issuesQuery.isError
      ? issuesQuery.error
      : null;

  if (queryError) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{getApiError(queryError).message}</Alert>
      </Container>
    );
  }

  if (!projectQuery.data) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Project情報を取得できませんでした。</Alert>
      </Container>
    );
  }

  const project = projectQuery.data;
  const issues = issuesQuery.data?.data ?? [];
  const meta = issuesQuery.data?.meta;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}

          spacing={2}
          sx={{ justifyContent: "space-between" }}
        >
          <div>
            <Button
              onClick={() => {
                navigate(`/projects/${project.id}`);
              }}
            >
              Project詳細へ戻る
            </Button>

            <Typography variant="h4" component="h1">
              {project.name} / Issues
            </Typography>
          </div>

          <Button
            variant="contained"
            onClick={() => {
              setIsCreateOpen(true);
            }}
          >
            Issueを作成
          </Button>
        </Stack>

        <IssueFilters
          keyword={keyword}
          statusId={statusId}
          priorityId={priorityId}
          onKeywordChange={(value) => {
            setKeyword(value);
            setPage(1);
          }}
          onStatusChange={(value) => {
            setStatusId(value);
            setPage(1);
          }}
          onPriorityChange={(value) => {
            setPriorityId(value);
            setPage(1);
          }}
        />

        {issuesQuery.isFetching && (
          <Typography variant="body2" color="text.secondary">
            更新中...
          </Typography>
        )}

        <IssueList issues={issues} />

        {meta && meta.totalPages > 1 && (
          <Pagination
            count={meta.totalPages}
            page={meta.page}
            disabled={issuesQuery.isFetching}
            onChange={(_, nextPage) => {
              setPage(nextPage);
            }}
            sx={{
              alignSelf: "center",
            }}
          />
        )}
      </Stack>

      <CreateIssueDialog
        projectId={project.id}
        members={project.members}
        open={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
        }}
      />
    </Container>
  );
}

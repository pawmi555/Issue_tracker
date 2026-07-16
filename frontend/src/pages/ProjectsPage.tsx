import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Container,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";

import FullScreenLoading from "../components/common/FullScreenLoading";

import CreateProjectDialog from "../features/project/components/CreateProjectDialog";
import ProjectList from "../features/project/components/ProjectList";

import { useProjects } from "../features/project/hooks/useProjects";

const PAGE_LIMIT = 12;

export default function ProjectsPage() {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const projectsQuery = useProjects({
    page,
    limit: PAGE_LIMIT,
    sort: "createdAt",
    order: "desc",
  });

  if (projectsQuery.isPending && !projectsQuery.data) {
    return <FullScreenLoading />;
  }

  if (projectsQuery.isError) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Project一覧の取得に失敗しました。</Alert>
      </Container>
    );
  }

  const projects = projectsQuery.data?.data ?? [];

  const meta = projectsQuery.data?.meta;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
          sx={{
            alignItems: {
              xs: "stretch",
              sm: "center",
            },
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h4" component="h1">
              Projects
            </Typography>

            <Typography color="text.secondary">
              所属しているProjectを管理します。
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => {
              setIsCreateOpen(true);
            }}
          >
            Projectを作成
          </Button>
        </Stack>

        {projectsQuery.isFetching && (
          <Typography color="text.secondary" variant="body2">
            更新中...
          </Typography>
        )}

        <ProjectList projects={projects} />

        {meta && meta.totalPages > 1 && (
          <Pagination
            count={meta.totalPages}
            page={meta.page}
            onChange={(_, nextPage) => {
              setPage(nextPage);
            }}
            sx={{
              alignSelf: "center",
            }}
          />
        )}
      </Stack>

      <CreateProjectDialog
        open={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
        }}
      />
    </Container>
  );
}

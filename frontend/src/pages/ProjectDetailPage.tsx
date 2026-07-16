import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { useNavigate, useParams } from "react-router";

import FullScreenLoading from "../components/common/FullScreenLoading";

import EditProjectDialog from "../features/project/components/EditProjectDialog";

import { useDeleteProject } from "../features/project/hooks/useDeleteProject";
import { useProject } from "../features/project/hooks/useProject.js";

import {
  getProjectRole,
  hasProjectRole,
} from "../features/project/utils/projectPermissions";

import { useAuthStore } from "../stores/auth.store";
import { formatDateTime } from "../utils/formatDateTime";
import { getApiError } from "../utils/getApiError";

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [deleteError, setDeleteError] = useState<string | null>(null);

  const parsedProjectId = Number(projectId);

  const user = useAuthStore((state) => state.user);

  const projectQuery = useProject(parsedProjectId);

  const deleteMutation = useDeleteProject();

  if (!Number.isInteger(parsedProjectId) || parsedProjectId <= 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Project IDが不正です。</Alert>
      </Container>
    );
  }

  if (projectQuery.isPending) {
    return <FullScreenLoading />;
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Projectの取得に失敗しました。</Alert>
      </Container>
    );
  }

  const project = projectQuery.data;

  const currentRole = user ? getProjectRole(project, user.id) : null;

  const canUpdate = hasProjectRole(currentRole, "MANAGER");

  const canDelete = hasProjectRole(currentRole, "OWNER");

  const handleDelete = async () => {
    const confirmed = window.confirm(`「${project.name}」を削除しますか？`);

    if (!confirmed) {
      return;
    }

    setDeleteError(null);

    try {
      await deleteMutation.mutateAsync(project.id);

      navigate("/projects", {
        replace: true,
      });
    } catch (error) {
      setDeleteError(getApiError(error).message);
    }
  };

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
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Button
              onClick={() => {
                navigate("/projects");
              }}
              sx={{ mb: 1 }}
            >
              Project一覧へ戻る
            </Button>

            <Typography variant="h4" component="h1">
              {project.name}
            </Typography>

            <Typography color="text.secondary">
              Owner: {project.owner.name}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "flex-start",
            }}
          >
            <Button
              variant="contained"
              onClick={() => {
                navigate(`/projects/${project.id}/issues`);
              }}
            >
              Issuesを表示
            </Button>

            {canUpdate && (
              <Button
                variant="outlined"
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
                {deleteMutation.isPending ? "削除中..." : "削除"}
              </Button>
            )}
          </Stack>
        </Stack>

        {deleteError && <Alert severity="error">{deleteError}</Alert>}

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                説明
              </Typography>

              <Typography
                sx={{
                  whiteSpace: "pre-wrap",
                }}
              >
                {project.description || "説明はありません。"}
              </Typography>
            </Box>

            <Divider />

            <Stack direction="row" spacing={1}>
              <Chip label={`Issue ${project.counts.issues}`} />

              <Chip label={`Member ${project.counts.members}`} />

              {currentRole && (
                <Chip label={currentRole} color="primary" variant="outlined" />
              )}
            </Stack>

            <Typography variant="body2" color="text.secondary">
              作成日時: {formatDateTime(project.createdAt)}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              更新日時: {formatDateTime(project.updatedAt)}
            </Typography>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Members
          </Typography>

          <List disablePadding>
            {project.members.map((member) => (
              <ListItem
                key={member.id}
                divider
                secondaryAction={<Chip label={member.role.name} size="small" />}
              >
                <ListItemText
                  primary={member.user.name}
                  secondary={`User ID: ${member.user.id}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Stack>

      <EditProjectDialog
        project={project}
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
        }}
      />
    </Container>
  );
}

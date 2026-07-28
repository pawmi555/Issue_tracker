import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import { useNavigate } from "react-router";

import { formatDateTime } from "../../../utils/formatDateTime";

import type { ProjectSummary } from "../types/project.types";

type ProjectListProps = {
  projects: ProjectSummary[];
};

export default function ProjectList({ projects }: ProjectListProps) {
  const navigate = useNavigate();

  if (projects.length === 0) {
    return (
      <Typography color="text.secondary">Projectはまだありません。</Typography>
    );
  }

  return (
    <Grid container spacing={3}>
      {projects.map((project) => (
        <Grid
          key={project.id}
          size={{
            xs: 12,
            md: 6,
            lg: 4,
          }}
        >
          <Card variant="outlined">
            <CardActionArea
              onClick={() => {
                navigate(`/projects/${project.id}`);
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6" component="h2">
                    {project.name}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      minHeight: 48,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {project.description || "説明はありません"}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      justifyContent: "wrap",
                    }}
                  >
                    <Chip
                      label={`Issue ${project.counts.issues}`}
                      size="small"
                    />

                    <Chip
                      label={`Member ${project.counts.members}`}
                      size="small"
                    />
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    Owner: {project.owner.name}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    更新日時: {formatDateTime(project.updatedAt)}
                  </Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

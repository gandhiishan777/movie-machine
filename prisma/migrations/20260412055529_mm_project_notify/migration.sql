-- NOTIFY subscribers (e.g. project SSE LISTEN) when pipeline-related rows change.
-- IDs are TEXT (Prisma String @id), not uuid.

CREATE OR REPLACE FUNCTION mm_notify_project_change() RETURNS TRIGGER AS $$
DECLARE
  target_project_id text;
BEGIN
  IF TG_TABLE_NAME = 'projects' THEN
    target_project_id := COALESCE(NEW."id", OLD."id");
  ELSIF TG_TABLE_NAME = 'scenes' THEN
    target_project_id := COALESCE(NEW."project_id", OLD."project_id");
  ELSIF TG_TABLE_NAME = 'pipeline_runs' THEN
    target_project_id := COALESCE(NEW."project_id", OLD."project_id");
  ELSIF TG_TABLE_NAME = 'pipeline_steps' THEN
    SELECT pr."project_id" INTO target_project_id
    FROM "pipeline_runs" pr
    WHERE pr."id" = COALESCE(NEW."pipeline_run_id", OLD."pipeline_run_id");
  ELSIF TG_TABLE_NAME = 'assets' THEN
    SELECT pr."project_id" INTO target_project_id
    FROM "pipeline_steps" ps
    JOIN "pipeline_runs" pr ON pr."id" = ps."pipeline_run_id"
    WHERE ps."id" = COALESCE(NEW."pipeline_step_id", OLD."pipeline_step_id");
  END IF;

  IF target_project_id IS NOT NULL THEN
    PERFORM pg_notify(
      'mm_project_updates',
      json_build_object('projectId', target_project_id)::text
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mm_notify_projects
AFTER INSERT OR UPDATE OR DELETE ON "projects"
FOR EACH ROW
EXECUTE PROCEDURE mm_notify_project_change();

CREATE TRIGGER mm_notify_scenes
AFTER INSERT OR UPDATE OR DELETE ON "scenes"
FOR EACH ROW
EXECUTE PROCEDURE mm_notify_project_change();

CREATE TRIGGER mm_notify_pipeline_runs
AFTER INSERT OR UPDATE OR DELETE ON "pipeline_runs"
FOR EACH ROW
EXECUTE PROCEDURE mm_notify_project_change();

CREATE TRIGGER mm_notify_pipeline_steps
AFTER INSERT OR UPDATE OR DELETE ON "pipeline_steps"
FOR EACH ROW
EXECUTE PROCEDURE mm_notify_project_change();

CREATE TRIGGER mm_notify_assets
AFTER INSERT OR UPDATE OR DELETE ON "assets"
FOR EACH ROW
EXECUTE PROCEDURE mm_notify_project_change();

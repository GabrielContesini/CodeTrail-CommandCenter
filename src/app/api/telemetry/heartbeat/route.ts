import { NextResponse } from "next/server";
import { getCommandCenterEnv } from "@/lib/env";
import { heartbeatPayloadSchema } from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const env = getCommandCenterEnv();
  const admin = createSupabaseAdminClient();

  if (!env.hasAdmin || !env.hasTelemetryToken || !admin) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Command Center sem credenciais administrativas ou token de ingest configurado.",
      },
      { status: 503 },
    );
  }

  const bearer = request.headers.get("authorization")?.replace("Bearer ", "");
  const headerToken = request.headers.get("x-ingest-token");
  const providedToken = bearer || headerToken;

  if (providedToken !== env.telemetryIngestToken) {
    return NextResponse.json(
      { ok: false, message: "Token de ingest invalido." },
      { status: 401 },
    );
  }

  const payloadResult = heartbeatPayloadSchema.safeParse(await request.json());
  if (!payloadResult.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Payload invalido.",
        issues: payloadResult.error.flatten(),
      },
      { status: 400 },
    );
  }

  const payload = payloadResult.data;
  const now = new Date().toISOString();

  const { error: instanceError } = await admin.from("ops_app_instances").upsert(
    {
      external_id: payload.instanceId,
      profile_id: payload.profileId ?? null,
      platform: payload.platform,
      release_channel: payload.releaseChannel,
      app_version: payload.appVersion,
      device_label: payload.deviceLabel ?? null,
      machine_name: payload.machineName ?? null,
      environment: payload.environment,
      status: payload.status,
      last_seen_at: now,
      metadata: payload.metadata,
      updated_at: now,
    },
    {
      onConflict: "external_id",
    },
  );

  if (instanceError) {
    return NextResponse.json(
      {
        ok: false,
        message: "Falha ao atualizar a instancia monitorada.",
        detail: instanceError.message,
      },
      { status: 500 },
    );
  }

  const { data: instance, error: instanceLookupError } = await admin
    .from("ops_app_instances")
    .select("id")
    .eq("external_id", payload.instanceId)
    .single();

  if (instanceLookupError || !instance?.id) {
    return NextResponse.json(
      {
        ok: false,
        message: "Falha ao localizar a instancia apos o upsert.",
        detail: instanceLookupError?.message,
      },
      { status: 500 },
    );
  }

  const { error: heartbeatError } = await admin.from("ops_heartbeats").insert({
    instance_id: instance.id,
    sync_backlog: payload.syncBacklog,
    open_errors: payload.openErrors,
    cpu_percent: payload.cpuPercent ?? null,
    memory_percent: payload.memoryPercent ?? null,
    disk_percent: payload.diskPercent ?? null,
    app_uptime_seconds: payload.appUptimeSeconds ?? null,
    os_uptime_seconds: payload.osUptimeSeconds ?? null,
    network_status: payload.networkStatus,
    payload: payload.payload,
    created_at: now,
  });

  if (heartbeatError) {
    return NextResponse.json(
      {
        ok: false,
        message: "Falha ao registrar o heartbeat.",
        detail: heartbeatError.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    instanceId: instance.id,
    receivedAt: now,
  });
}

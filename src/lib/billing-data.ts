import { getCommandCenterEnv } from "@/lib/env";
import { createProductSourceAdminClient } from "@/lib/supabase/server";
import type { BillingOverview, BillingRecentSubscriber } from "@/lib/types";
import { unstable_noStore as noStore } from "next/cache";

// ── Row types from the product DB ──────────────────────────────────────────

type SubscriptionRow = {
  id: string;
  user_id: string;
  plan_id: string;
  customer_id: string | null;
  status: string;
  billing_cycle: string;
  started_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  plans:
    | { code: string; name: string; price_cents: number; interval: string }
    | Array<{
        code: string;
        name: string;
        price_cents: number;
        interval: string;
      }>
    | null;
};

type PaymentRow = {
  id: string;
  subscription_id: string | null;
  amount_cents: number;
  currency: string;
  status: string;
  paid_at: string | null;
  created_at: string | null;
};

type ProfileLookupRow = {
  id: string;
  full_name: string | null;
  email: string | null;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function resolvePlan(row: SubscriptionRow) {
  if (!row.plans) return null;
  return Array.isArray(row.plans) ? (row.plans[0] ?? null) : row.plans;
}

function initials(name: string | null): string {
  if (!name) return "??";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// ── Main data function ────────────────────────────────────────────────────

export async function getBillingOverview(): Promise<BillingOverview> {
  noStore();
  const env = getCommandCenterEnv();
  const productAdmin = createProductSourceAdminClient();
  const generatedAt = new Date().toISOString();
  const now = new Date();

  const empty: BillingOverview = {
    generatedAt,
    hasProductSource: false,
    totalRevenueCents: 0,
    currentMonthCents: 0,
    revenue30dCents: 0,
    revenue7dCents: 0,
    mrr: 0,
    arr: 0,
    arpu: 0,
    activeSubs: 0,
    totalSubs: 0,
    newSubs30d: 0,
    canceledSubs30d: 0,
    churnRate30d: 0,
    failedPayments30d: 0,
    planBreakdown: [],
    monthlyRevenue: [],
    recentSubscriptions: [],
  };

  if (!env.hasProductSource || !productAdmin) {
    return empty;
  }

  // ── Fetch subscriptions (all, paginated) ───────────────────────────────

  const allSubs: SubscriptionRow[] = [];
  const pageSize = 500;

  for (let from = 0; from <= 10000; from += pageSize) {
    const { data, error } = await productAdmin
      .from("subscriptions")
      .select(
        "id, user_id, plan_id, customer_id, status, billing_cycle, started_at, current_period_start, current_period_end, cancel_at_period_end, canceled_at, created_at, updated_at, plans(code, name, price_cents, interval)",
      )
      .order("updated_at", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error || !data) break;

    allSubs.push(...(data as SubscriptionRow[]));
    if (data.length < pageSize) break;
  }

  // ── Fetch payments (try, may not exist) ────────────────────────────────

  let allPayments: PaymentRow[] = [];
  try {
    const { data, error } = await productAdmin
      .from("billing_payments")
      .select(
        "id, subscription_id, amount_cents, currency, status, paid_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(5000);

    if (!error && data) {
      allPayments = data as PaymentRow[];
    }
  } catch {
    // Table may not exist yet — graceful fallback
  }

  // ── Derive deduplicated latest sub per user ────────────────────────────

  const latestByUser = new Map<string, SubscriptionRow>();
  for (const sub of allSubs) {
    if (!sub.user_id) continue;
    if (!latestByUser.has(sub.user_id)) {
      latestByUser.set(sub.user_id, sub);
    }
  }

  // ── Compute metrics ────────────────────────────────────────────────────

  const activeSubs = [...latestByUser.values()].filter(
    (s) => s.status === "active" || s.status === "trialing",
  );
  const activeSubsCount = activeSubs.length;
  const totalSubsCount = latestByUser.size;

  const thirtyDaysAgo = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const sevenDaysAgo = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const currentMonthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();

  // New subs in last 30d
  const newSubs30d = allSubs.filter(
    (s) => s.created_at && s.created_at >= thirtyDaysAgo,
  ).length;

  // Canceled in last 30d
  const canceledSubs30d = [...latestByUser.values()].filter(
    (s) =>
      (s.status === "canceled" || s.status === "expired") &&
      s.canceled_at &&
      s.canceled_at >= thirtyDaysAgo,
  ).length;

  // Churn rate
  const churnBase = activeSubsCount + canceledSubs30d;
  const churnRate30d = churnBase > 0 ? (canceledSubs30d / churnBase) * 100 : 0;

  // MRR from active subscriptions
  let mrrCents = 0;
  for (const sub of activeSubs) {
    const plan = resolvePlan(sub);
    if (!plan) continue;
    if (plan.interval === "year" || plan.interval === "yearly") {
      mrrCents += Math.round(plan.price_cents / 12);
    } else {
      mrrCents += plan.price_cents;
    }
  }

  const arrCents = mrrCents * 12;
  const arpuCents =
    activeSubsCount > 0 ? Math.round(mrrCents / activeSubsCount) : 0;

  // ── Revenue from payments ──────────────────────────────────────────────

  const paidPayments = allPayments.filter(
    (p) => p.status === "paid" && p.paid_at,
  );
  const totalRevenueCents = paidPayments.reduce(
    (sum, p) => sum + p.amount_cents,
    0,
  );
  const revenue30dCents = paidPayments
    .filter((p) => p.paid_at! >= thirtyDaysAgo)
    .reduce((sum, p) => sum + p.amount_cents, 0);
  const revenue7dCents = paidPayments
    .filter((p) => p.paid_at! >= sevenDaysAgo)
    .reduce((sum, p) => sum + p.amount_cents, 0);
  const currentMonthCents = paidPayments
    .filter((p) => p.paid_at! >= currentMonthStart)
    .reduce((sum, p) => sum + p.amount_cents, 0);

  // Failed payments in 30d
  const failedPayments30d = allPayments.filter(
    (p) =>
      p.status === "failed" && p.created_at && p.created_at >= thirtyDaysAgo,
  ).length;

  // ── If no payments table, estimate revenue from subscriptions ──────────

  const revenueIsEstimated = allPayments.length === 0;
  let effTotalRevenue = totalRevenueCents;
  let effCurrentMonth = currentMonthCents;
  let effRevenue30d = revenue30dCents;
  let effRevenue7d = revenue7dCents;

  if (revenueIsEstimated) {
    // Rough estimate: each active sub contributes its plan price once per period
    effTotalRevenue = 0;
    effCurrentMonth = 0;
    effRevenue30d = 0;
    effRevenue7d = 0;

    for (const sub of allSubs) {
      const plan = resolvePlan(sub);
      if (!plan || sub.status === "canceled" || sub.status === "expired")
        continue;
      effTotalRevenue += plan.price_cents;
      if (sub.updated_at && sub.updated_at >= currentMonthStart) {
        effCurrentMonth += plan.price_cents;
      }
      if (sub.updated_at && sub.updated_at >= thirtyDaysAgo) {
        effRevenue30d += plan.price_cents;
      }
      if (sub.updated_at && sub.updated_at >= sevenDaysAgo) {
        effRevenue7d += plan.price_cents;
      }
    }
  }

  // ── Plan breakdown ─────────────────────────────────────────────────────

  const planBuckets = new Map<
    string,
    { code: string; name: string; count: number; mrrCents: number }
  >();
  for (const sub of activeSubs) {
    const plan = resolvePlan(sub);
    if (!plan) continue;
    const bucket = planBuckets.get(plan.code) ?? {
      code: plan.code,
      name: plan.name,
      count: 0,
      mrrCents: 0,
    };
    bucket.count += 1;
    bucket.mrrCents +=
      plan.interval === "year" || plan.interval === "yearly"
        ? Math.round(plan.price_cents / 12)
        : plan.price_cents;
    planBuckets.set(plan.code, bucket);
  }

  const planBreakdown = [...planBuckets.values()]
    .sort((a, b) => b.count - a.count)
    .map((b) => ({
      planCode: b.code,
      planName: b.name,
      activeCount: b.count,
      percentage:
        activeSubsCount > 0 ? Math.round((b.count / activeSubsCount) * 100) : 0,
      mrrCents: b.mrrCents,
    }));

  // ── Monthly revenue chart (last 6 months) ──────────────────────────────

  const currentMK = monthKey(now);
  const monthlyBuckets = new Map<string, number>();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyBuckets.set(monthKey(d), 0);
  }

  if (!revenueIsEstimated) {
    for (const p of paidPayments) {
      if (!p.paid_at) continue;
      const mk = monthKey(new Date(p.paid_at));
      if (monthlyBuckets.has(mk)) {
        monthlyBuckets.set(mk, (monthlyBuckets.get(mk) ?? 0) + p.amount_cents);
      }
    }
  } else {
    // Estimate from subscription updates
    for (const sub of allSubs) {
      const plan = resolvePlan(sub);
      if (!plan || !sub.updated_at) continue;
      if (sub.status === "canceled" || sub.status === "expired") continue;
      const mk = monthKey(new Date(sub.updated_at));
      if (monthlyBuckets.has(mk)) {
        monthlyBuckets.set(
          mk,
          (monthlyBuckets.get(mk) ?? 0) + plan.price_cents,
        );
      }
    }
  }

  const monthlyRevenue = [...monthlyBuckets.entries()].map(([m, cents]) => ({
    month: m,
    amountCents: cents,
    isCurrent: m === currentMK,
  }));

  // ── Recent subscribers ─────────────────────────────────────────────────

  const recentSubs = allSubs
    .filter((s) => s.status === "active" || s.status === "trialing")
    .slice(0, 20);

  const recentUserIds = [
    ...new Set(recentSubs.map((s) => s.user_id).filter(Boolean)),
  ];
  const profileMap = new Map<string, ProfileLookupRow>();

  if (recentUserIds.length > 0) {
    const { data: profiles } = await productAdmin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", recentUserIds.slice(0, 50));

    if (profiles) {
      for (const p of profiles as ProfileLookupRow[]) {
        profileMap.set(p.id, p);
      }
    }
  }

  const recentSubscriptions: BillingRecentSubscriber[] = recentSubs.map(
    (sub) => {
      const profile = profileMap.get(sub.user_id);
      const plan = resolvePlan(sub);
      const name = profile?.full_name ?? "Usuário";
      const email = profile?.email ?? "";

      return {
        userId: sub.user_id,
        userName: name,
        userEmail: email,
        userInitials: initials(name),
        planCode: plan?.code ?? "unknown",
        planName: plan?.name ?? "Desconhecido",
        priceCents: plan?.price_cents ?? 0,
        status: sub.status,
        startedAt: sub.started_at,
        updatedAt: sub.updated_at ?? sub.created_at ?? "",
      };
    },
  );

  return {
    generatedAt,
    hasProductSource: true,
    totalRevenueCents: effTotalRevenue,
    currentMonthCents: effCurrentMonth,
    revenue30dCents: effRevenue30d,
    revenue7dCents: effRevenue7d,
    mrr: mrrCents,
    arr: arrCents,
    arpu: arpuCents,
    activeSubs: activeSubsCount,
    totalSubs: totalSubsCount,
    newSubs30d,
    canceledSubs30d,
    churnRate30d,
    failedPayments30d,
    planBreakdown,
    monthlyRevenue,
    recentSubscriptions,
  };
}

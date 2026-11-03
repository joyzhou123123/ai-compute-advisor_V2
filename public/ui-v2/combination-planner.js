// Generated from src/calculator/combinationPlanner.ts; do not edit.
const MAX_NODES = 50000;
const MAX_PLANS = 30;
/** With no fleet counts, searches catalog combinations in increasing machine
 * count. With counts, searches placements within the supplied inventory. The
 * bounded search always reports its limit; failure after a cutoff is not proof
 * of infeasibility. Equivalent capacity states are pruned only within a type. */
export function planCombinations(demands, devices, inventory = false, budget = MAX_NODES) {
    const result = { status: "invalid", plans: [], visited: 0 };
    if (!demands.length ||
        !devices.length ||
        !Number.isInteger(budget) ||
        budget < 1 ||
        new Set(demands.map((d) => d.id)).size !== demands.length ||
        new Set(devices.map((d) => d.id)).size !== devices.length ||
        demands.some((d) => !d.id || d.need === null || !Number.isFinite(d.need) || d.need <= 0) ||
        devices.some((d) => !d.id ||
            !Number.isFinite(d.capacity) ||
            d.capacity <= 0 ||
            (inventory &&
                (!Number.isInteger(d.count) || d.count < 1 || d.count > 999))))
        return result;
    const sorted = [...demands].sort((a, b) => b.need - a.need || a.id.localeCompare(b.id));
    const types = [...devices].sort((a, b) => a.capacity - b.capacity || a.id.localeCompare(b.id));
    const maxCapacity = Math.max(...types.map((d) => d.capacity));
    result.status = "infeasible";
    if (sorted[0].need > maxCapacity)
        return result;
    const suffix = Array(sorted.length + 1).fill(0);
    for (let i = sorted.length - 1; i >= 0; i--)
        suffix[i] = suffix[i + 1] + sorted[i].need;
    const maxUnits = inventory
        ? Math.min(sorted.length, types.reduce((n, t) => n + t.count, 0))
        : sorted.length;
    const bins = [];
    const counts = new Map();
    let cutoff = false;
    const found = new Map();
    const rank = (a, b) => a.count - b.count ||
        a.remaining - b.remaining ||
        a.machines
            .map((m) => m.deviceId)
            .sort()
            .join(",")
            .localeCompare(b.machines
            .map((m) => m.deviceId)
            .sort()
            .join(","));
    function search(index, limit) {
        if (cutoff)
            return;
        if (++result.visited > budget) {
            cutoff = true;
            return;
        }
        if (index === sorted.length) {
            const key = bins
                .map((b) => b.deviceId)
                .sort()
                .join("|");
            if (!found.has(key)) {
                const capacity = bins.reduce((n, b) => n + b.capacity, 0);
                found.set(key, {
                    machines: bins.map((b) => ({ ...b, models: [...b.models] })),
                    count: bins.length,
                    capacity,
                    used: suffix[0],
                    remaining: capacity - suffix[0],
                });
                if (found.size > MAX_PLANS) {
                    const worst = [...found.entries()]
                        .sort((a, b) => rank(a[1], b[1]))
                        .at(-1);
                    found.delete(worst[0]);
                }
            }
            return;
        }
        if (bins.reduce((n, b) => n + b.capacity - b.used, 0) +
            (limit - bins.length) * maxCapacity <
            suffix[index])
            return;
        const d = sorted[index];
        const seen = new Set();
        for (const b of bins) {
            const key = `${b.deviceId}:${b.used}`;
            if (seen.has(key) || b.used + d.need > b.capacity)
                continue;
            seen.add(key);
            b.used += d.need;
            b.models.push(d.id);
            search(index + 1, limit);
            b.models.pop();
            b.used -= d.need;
        }
        if (bins.length >= limit)
            return;
        for (const t of types) {
            const count = counts.get(t.id) || 0;
            if (t.capacity < d.need || (inventory && count >= t.count))
                continue;
            counts.set(t.id, count + 1);
            bins.push({
                deviceId: t.id,
                unit: count + 1,
                capacity: t.capacity,
                used: d.need,
                models: [d.id],
            });
            search(index + 1, limit);
            bins.pop();
            counts.set(t.id, count);
        }
    }
    for (let limit = Math.max(1, Math.ceil(suffix[0] / maxCapacity)); limit <= maxUnits; limit++) {
        search(0, limit);
        if (found.size || cutoff)
            break;
    }
    result.plans = [...found.values()].sort(rank);
    result.status = cutoff
        ? "limited"
        : result.plans.length
            ? "fit"
            : "infeasible";
    return result;
}

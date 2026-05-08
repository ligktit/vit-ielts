import { useEffect, useState } from "react";

type AdminPermissions = {
    isFullAdmin: boolean;
    canDelete: boolean;
    canViewRevenue: boolean;
    canConfigurePayments: boolean;
};

const PESSIMISTIC: AdminPermissions = {
    isFullAdmin: false,
    canDelete: false,
    canViewRevenue: false,
    canConfigurePayments: false,
};

const OPTIMISTIC: AdminPermissions = {
    isFullAdmin: true,
    canDelete: true,
    canViewRevenue: true,
    canConfigurePayments: true,
};

// Module-level cache so multiple components share a single fetch.
let cachedPerms: AdminPermissions | null = null;
let inflight: Promise<AdminPermissions> | null = null;
const subscribers = new Set<(p: AdminPermissions) => void>();

async function fetchPerms(): Promise<AdminPermissions> {
    if (cachedPerms) return cachedPerms;
    if (inflight) return inflight;
    inflight = fetch("/api/admin/me")
        .then((r) => r.json())
        .then((j): AdminPermissions => {
            const next = j?.success
                ? {
                      isFullAdmin: Boolean(j.isFullAdmin),
                      canDelete: Boolean(j.canDelete),
                      canViewRevenue: Boolean(j.canViewRevenue),
                      canConfigurePayments: Boolean(j.canConfigurePayments),
                  }
                : PESSIMISTIC;
            cachedPerms = next;
            subscribers.forEach((cb) => cb(next));
            return next;
        })
        .catch(() => {
            cachedPerms = PESSIMISTIC;
            subscribers.forEach((cb) => cb(PESSIMISTIC));
            return PESSIMISTIC;
        })
        .finally(() => {
            inflight = null;
        });
    return inflight;
}

/**
 * Capability flags for the currently-logged-in admin. Until /api/admin/me
 * resolves we return optimistic permissions so a returning full admin
 * doesn't see UI flicker; editor accounts get downgraded once the fetch
 * completes. The backend enforces the same checks regardless of UI state.
 */
export function useAdminPermissions(): AdminPermissions {
    const [perms, setPerms] = useState<AdminPermissions>(
        () => cachedPerms ?? OPTIMISTIC
    );

    useEffect(() => {
        let mounted = true;
        const update = (next: AdminPermissions) => {
            if (mounted) setPerms(next);
        };
        subscribers.add(update);
        if (cachedPerms) {
            update(cachedPerms);
        } else {
            void fetchPerms();
        }
        return () => {
            mounted = false;
            subscribers.delete(update);
        };
    }, []);

    return perms;
}

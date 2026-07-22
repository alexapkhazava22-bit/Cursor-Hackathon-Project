import type { AuditRecord } from "@/lib/types";

const STORAGE_KEY = "accesschain.audits.v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function listAudits(): AuditRecord[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AuditRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getAudit(auditId: string): AuditRecord | null {
  return listAudits().find((a) => a.auditId === auditId) ?? null;
}

export function saveAudit(record: AuditRecord): void {
  if (!canUseStorage()) return;
  const all = listAudits().filter((a) => a.auditId !== record.auditId);
  all.unshift({ ...record, updatedAt: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0, 50)));
}

export function deleteAudit(auditId: string): void {
  if (!canUseStorage()) return;
  const all = listAudits().filter((a) => a.auditId !== auditId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function resetAllAudits(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(STORAGE_KEY);
}

export function upsertAudit(
  auditId: string,
  updater: (current: AuditRecord | null) => AuditRecord,
): AuditRecord {
  const current = getAudit(auditId);
  const next = updater(current);
  saveAudit(next);
  return next;
}

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Loader2,
  RefreshCw,
  UserPlus,
  Users,
} from "lucide-react";
import { useVoucherInit } from "@/features/cases/hooks/useVoucherInit";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import {
  fetchTelegramDirectory,
  upsertTelegramMapping,
} from "../services/discussionApi";
import type {
  TelegramDirectoryResponse,
} from "../types/discussion.types";

interface TelegramUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TelegramUsersDialog({
  open,
  onOpenChange,
}: TelegramUsersDialogProps) {
  const { data: voucherInit } = useVoucherInit();

  const [directory, setDirectory] = useState<TelegramDirectoryResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [department, setDepartment] = useState("");
  const [selectedStaffKey, setSelectedStaffKey] = useState("");

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [copiedBotLink, setCopiedBotLink] = useState(false);

  const loadDirectory = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const data = await fetchTelegramDirectory();
      setDirectory(data);
    } catch (err) {
      setFeedback({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Failed to load Telegram user directory.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      void loadDirectory();
    } else {
      setFeedback(null);
    }
  }, [open]);

  const staffOptions = useMemo(() => {
    const items: Array<{
      key: string;
      label: string;
      name: string;
      phoneNo: string;
      department: string;
    }> = [];
    const seen = new Set<string>();

    for (const dev of voucherInit?.developers ?? []) {
      const phone = dev.phoneNo?.trim() || "";
      const key = `DEV-${dev.id}`;
      const displayName = dev.fullName?.trim();
      if (!seen.has(key) && displayName) {
        seen.add(key);
        items.push({
          key,
          label: `${displayName} (Developer${phone ? ` • ${phone}` : ""})`,
          name: displayName,
          phoneNo: phone,
          department: "DEV",
        });
      }
    }

    for (const fc of voucherInit?.functionalConsultants ?? []) {
      const phone = fc.phoneNo?.trim() || "";
      const key = `FC-${fc.id}`;
      const displayName = fc.fullName?.trim();
      if (!seen.has(key) && displayName) {
        seen.add(key);
        items.push({
          key,
          label: `${displayName} (FC${phone ? ` • ${phone}` : ""})`,
          name: displayName,
          phoneNo: phone,
          department: "FC",
        });
      }
    }

    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [voucherInit]);

  const resetForm = () => {
    setName("");
    setPhoneNumber("");
    setTelegramId("");
    setDepartment("");
    setSelectedStaffKey("");
  };

  const handleSelectStaff = (key: string) => {
    setSelectedStaffKey(key);
    const chosen = staffOptions.find((item) => item.key === key);
    if (!chosen) {
      return;
    }
    setName(chosen.name);
    if (chosen.phoneNo) {
      setPhoneNumber(chosen.phoneNo);
    }
    if (!department.trim()) {
      setDepartment(chosen.department);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!name.trim() || !phoneNumber.trim() || !telegramId.trim()) {
      setFeedback({
        type: "error",
        text: "Name, phone number, and numeric Telegram ID are required.",
      });
      return;
    }

    setSaving(true);
    try {
      const updated = await upsertTelegramMapping({
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        telegramId: telegramId.trim(),
        department: department.trim() || null,
      });
      setDirectory(updated);
      setFeedback({
        type: "success",
        text: `Saved Telegram mapping for ${name.trim()} (${telegramId.trim()}). Active immediately without restart.`,
      });
      resetForm();
    } catch (err) {
      setFeedback({
        type: "error",
        text:
          err instanceof Error ? err.message : "Failed to save Telegram mapping.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyBotLink = async () => {
    if (!directory?.botUrl) return;
    try {
      await navigator.clipboard.writeText(directory.botUrl);
      setCopiedBotLink(true);
      setTimeout(() => setCopiedBotLink(false), 2000);
    } catch {
      // Clipboard API may be restricted in non-HTTPS contexts
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-8">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-sky-600" />
                Telegram User Mappings
              </DialogTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadDirectory()}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </DialogHeader>

        {directory?.botUrl && (
          <div className="mt-3 mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-xs text-sky-900">
            <div>
              <span className="font-semibold">Onboarding step:</span> Ask a new employee to open{" "}
              <span className="font-mono font-semibold">{directory.botUrl}</span>{" "}
              and tap <b>/start</b>. Their Telegram ID will appear below automatically.
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleCopyBotLink()}
              className="h-7 gap-1.5 bg-white text-xs"
            >
              {copiedBotLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Bot Link
                </>
              )}
            </Button>
          </div>
        )}

        {feedback && (
          <div
            className={`mt-3 rounded-xl border px-3.5 py-2.5 text-xs font-medium ${
              feedback.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Add / Edit Form */}
        <form
          onSubmit={(e) => void handleSave(e)}
          className="lg:col-span-5 space-y-3 rounded-xl border bg-slate-50 p-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <UserPlus className="h-4 w-4 text-sky-600" />
              Add or Update Mapping <span className="text-xs text-slate-500">(To Update, Enter The Same Phone Number and New Telegram ID)</span>
            </h3>
            {(name || phoneNumber || telegramId || department) && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Clear
              </button>
            )}
          </div>

          {staffOptions.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Quick-fill from ESM Staff (optional)
              </label>
              <select
                value={selectedStaffKey}
                onChange={(e) => handleSelectStaff(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-white px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">-- Select Developer / FC --</option>
                {staffOptions.map((staff) => (
                  <option key={staff.key} value={staff.key}>
                    {staff.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Employee Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Abebe Kebede"
              className="h-9 bg-white text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Phone Number *
            </label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 0912345678 or 912345678"
              className="h-9 bg-white text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Telegram User ID *
            </label>
            <Input
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value.replace(/\s+/g, ""))}
              placeholder="e.g. 5123456789"
              className="h-9 bg-white font-mono text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Department (optional)
            </label>
            <Input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. DEV, FC, PM"
              className="h-9 bg-white text-sm"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={saving}
            className="w-full bg-sky-600 hover:bg-sky-700"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Mapping"
            )}
          </Button>
        </form>
        
      </DialogContent>
    </Dialog>
  );
}
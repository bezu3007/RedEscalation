import React from "react";
import { createPortal } from "react-dom";
import { useCaseStore } from "../store/caseStore";
import type { ICellRendererParams } from "ag-grid-community";
import { useCaseTransition } from "../hooks/useCaseTransition";
import type { CaseStatus } from "../types";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, MoreVertical, LoaderCircle, PlusCircle, X, CheckCircle2,  RotateCcw, Clock3, Ban, PlayCircle, CheckCheck, Lock} from "lucide-react";

export function RowMenuCell(
  params: ICellRendererParams
) {
    const data = params.data;
    const { mutate: transitionCase } = useCaseTransition();
    const handleTransition = ( targetStatus: CaseStatus) => {
        if (!data) return;

        transitionCase({
            caseId: data.id,
            targetStatus,
        });

        setOpen(false);
    };

    const navigate = useNavigate();

    const {
        openEditModal,
        setSelectedParentCase,
        openCreateModal,
        openViewModal,
    } = useCaseStore();

    const [open, setOpen] = React.useState(false);
    const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);

    const btnRef = React.useRef<HTMLButtonElement>(null);

    if (!data) return null;

    const toggleMenu = () => {
        const rect = btnRef.current?.getBoundingClientRect();
        if (!rect) return;

        setPos({
        x: rect.left,
        y: rect.bottom,
        });

        setOpen((prev) => !prev);
    };

    return (
        <>
        {/* TRIGGER */}
        <div className="flex items-center justify-center h-full">
            <button
            ref={btnRef}
            onClick={toggleMenu}
            className="h-8 w-8 rounded-md hover:bg-slate-100 flex items-center justify-center"
            >
            <MoreVertical className="h-4 w-4" />
            </button>
        </div>

        {/* MENU */}
        {open &&
            pos &&
            createPortal(
            <>
                {/* BACKDROP */}
                <div
                className="fixed inset-0 z-[998]"
                onClick={() => setOpen(false)}
                />

                {/* PANEL */}
                <div
                className="fixed z-[9999] w-56 rounded-2xl border bg-white shadow-2xl overflow-hidden"
                style={{
                    top: pos.y + 6,
                    left: pos.x,
                }}
                >
                {/* HEADER */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
                    <p className="font-medium text-sm">{data.caseNumber}</p>

                    <button
                    onClick={() => setOpen(false)}
                    className="h-7 w-7 rounded-full hover:bg-slate-200 flex items-center justify-center"
                    >
                    <X className="h-4 w-4" />
                    </button>
                </div>

                {/* ACTIONS */}
                <div className="p-2 space-y-1">
                    {/* VIEW */}
                    <button
                    type="button"
                    onClick={() =>
                        navigate(`/cases/${data.id}`)
                    }
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100 text-sm"
                    >
                    <Eye className="h-4 w-4 text-cyan-500" />

                    VIEW
                    </button>

                    {/* EDIT */}
                    <button
                    type="button"
                    onClick={() => {
                        openEditModal(data);

                        setOpen(false);
                    }}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100 text-sm"
                    >
                    <Pencil className="h-4 w-4 text-blue-500" />

                    EDIT
                    </button>

                    <div className="my-2 border-t" />

                    {/* APPROVE */}
                    <button
                    type="button"
                    onClick={() =>
                        handleTransition("Approved")
                    }
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100 text-sm"
                    >
                    <CheckCircle2 className="h-4 w-4 text-green-600" />

                    APPROVE
                    </button>

                    {/* REJECT */}
                    <button
                    type="button"
                    onClick={() =>
                        handleTransition("Rejected")
                    }
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100 text-sm"
                    >
                    <Ban className="h-4 w-4 text-red-500" />

                    REJECT
                    </button>

                    {/* RETURN */}
                    <button
                    type="button"
                    onClick={() =>
                        handleTransition("Returned")
                    }
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100 text-sm"
                    >
                    <RotateCcw className="h-4 w-4 text-orange-500" />

                    RETURN
                    </button>

                    {/* DEADLINE */}
                    <button
                    type="button"
                    onClick={() => handleTransition("DeadlineExtension")}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100 text-sm"
                    >
                    <Clock3 className="h-4 w-4 text-violet-600" />

                    DEADLINE EXTENSION
                    </button>

                    <div className="my-2 border-t" />

                    {/* OPEN */}
                    <button
                    type="button"
                    onClick={() =>
                        handleTransition("Open")
                    }
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100 text-sm"
                    >
                    <RotateCcw className="h-4 w-4 text-slate-500" />

                    OPEN
                    </button>

                    {/* IN PROGRESS */}
                    <button
                    type="button"
                    onClick={() =>
                        handleTransition("InProgress")
                    }
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100 text-sm"
                    >
                    <PlayCircle className="h-4 w-4 text-blue-500" />

                    IN PROGRESS
                    </button>

                    {/* PENDING */}
                    <button
                    type="button"
                    onClick={() =>
                        handleTransition(
                        "PendingApproval"
                        )
                    }
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100 text-sm"
                    >
                    <LoaderCircle className="h-4 w-4 text-amber-500" />

                    PENDING APPROVAL
                    </button>

                    {/* RESOLVED */}
                    <button
                    type="button"
                    onClick={() =>
                        handleTransition("Resolved")
                    }
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100 text-sm"
                    >
                    <CheckCheck className="h-4 w-4 text-green-600" />

                    RESOLVED
                    </button>

                    {/* CLOSED */}
                    <button
                    type="button"
                    onClick={() =>
                        handleTransition("Closed")
                    }
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100 text-sm"
                    >
                    <Lock className="h-4 w-4 text-slate-600" />

                    CLOSED
                    </button>

                    <div className="my-2 border-t" />

                    {/* SUB CASE */}
                    <button
                    type="button"
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100 text-sm"
                    >
                    <PlusCircle className="h-4 w-4 text-green-600" />

                    CREATE SUB CASE
                    </button>
                </div>
                </div>
            </>,
            document.body
            )}
        </>
    );
}

import { useParams, useNavigate } from "react-router-dom";

import { useCase } from "../hooks/useCases";

import { CaseActionBar } from "../components/CaseActionBar";

import { DeveloperSuggester } from "../components/DeveloperSuggester";

import { AttachmentUploader } from "../components/AttachmentUploader";

import { StatusBadge } from "../components/StatusBadge";

import { CaseTypeBadge } from "../components/CaseTypeBadge";

import { CaseForm } from "../components/CaseForm";

import { useCaseStore } from "../store/caseStore";

import { Button } from "@/shared/components/ui/button";

import { Separator } from "@/shared/components/ui/separator";

import { Skeleton } from "@/shared/components/ui/skeleton";

import {

  Card,

  CardContent,

  CardHeader,

  CardTitle,

} from "@/shared/components/ui/card";

import { ArrowLeft, FileDown, Pencil } from "lucide-react";

import { formatDate } from "@/shared/utils/formatDate";

import { casesApi } from "../api/casesApi";



export default function CaseDetailPage() {

  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const caseId = id ? parseInt(id, 10) : null;

  const { data: caseItem, isLoading } = useCase(caseId);

  const { isEditModalOpen, editingCase, openEditModal, closeEditModal } =

    useCaseStore();



  const handleExportPdf = async () => {

    if (!caseId) return;

    const blob = await casesApi.exportToPdf(caseId);

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = `case-${caseId}.pdf`;

    a.click();

    URL.revokeObjectURL(url);

  };



  if (isLoading) {

    return (

      <div className="space-y-4">

        <Skeleton className="h-8 w-64" />

        <Skeleton className="h-48 w-full" />

        <Skeleton className="h-48 w-full" />

      </div>

    );

  }



  if (!caseItem) {

    return (

      <div className="text-center py-12 text-muted-foreground">

        Case not found.

      </div>

    );

  }



  return (

    <div className="space-y-6 max-w-4xl">

      <div className="flex items-center gap-4">

        <Button

          variant="ghost"

          size="sm"

          onClick={() => navigate("/cases")}

          className="gap-2"

        >

          <ArrowLeft className="h-4 w-4" />

          Back

        </Button>

        <div className="flex-1">

          <div className="flex items-center gap-2">

            <h1 className="text-xl font-bold">{caseItem.title}</h1>

            <StatusBadge status={caseItem.status} />

            <CaseTypeBadge type={caseItem.caseType} />

          </div>

          <p className="text-sm text-muted-foreground">

            {caseItem.caseNumber} · Created {formatDate(caseItem.createdAt)}

          </p>

        </div>

        <div className="flex gap-2">

          <Button variant="outline" size="sm" onClick={handleExportPdf} className="gap-2">

            <FileDown className="h-4 w-4" />

            Export PDF

          </Button>

          <Button

            variant="outline"

            size="sm"

            onClick={() => openEditModal(caseItem)}

            className="gap-2"

          >

            <Pencil className="h-4 w-4" />

            Edit

          </Button>

        </div>

      </div>



      <CaseActionBar caseItem={caseItem} />



      <div className="grid grid-cols-3 gap-6">

        <div className="col-span-2 space-y-4">

          <Card>

            <CardHeader>

              <CardTitle className="text-base">Description</CardTitle>

            </CardHeader>

            <CardContent>

              <p className="text-sm leading-relaxed whitespace-pre-wrap">

                {caseItem.description}

              </p>

            </CardContent>

          </Card>



          <Card>

            <CardHeader>

              <CardTitle className="text-base">Attachment</CardTitle>

            </CardHeader>

            <CardContent>

              <AttachmentUploader

                caseId={caseItem.id}

                existingUrl={caseItem.attachmentUrl}

              />

            </CardContent>

          </Card>



          <Card>

            <CardHeader>

              <CardTitle className="text-base">Developer Assignment</CardTitle>

            </CardHeader>

            <CardContent className="space-y-3">

              {caseItem.assignedDeveloper && (

                <p className="text-sm">

                  <span className="text-muted-foreground">Assigned to: </span>

                  <span className="font-medium">{caseItem.assignedDeveloper}</span>

                </p>

              )}

              <DeveloperSuggester caseId={caseItem.id} />

            </CardContent>

          </Card>

        </div>



        <div className="space-y-4">

          <Card>

            <CardHeader>

              <CardTitle className="text-base">Details</CardTitle>

            </CardHeader>

            <CardContent className="space-y-3 text-sm">

              {[

                { label: "Priority", value: caseItem.priority },

                { label: "Project", value: caseItem.projectName },

                { label: "Module", value: caseItem.moduleName },

                { label: "Department", value: caseItem.department },

                { label: "Reported By", value: caseItem.reportedBy },

                {

                  label: "Updated",

                  value: formatDate(caseItem.updatedAt),

                },

                {

                  label: "Resolved",

                  value: caseItem.resolvedAt

                    ? formatDate(caseItem.resolvedAt)

                    : "—",

                },

              ].map(({ label, value }) => (

                <div key={label} className="flex justify-between gap-2">

                  <span className="text-muted-foreground">{label}</span>

                  <span className="font-medium text-right">{value}</span>

                </div>

              ))}



              {caseItem.voucherNumber && (

                <>

                  <Separator />

                  <div className="flex justify-between gap-2">

                    <span className="text-muted-foreground">Voucher #</span>

                    <span className="font-medium font-mono">

                      {caseItem.voucherNumber}

                    </span>

                  </div>

                  {caseItem.paymentAmount !== null && (

                    <div className="flex justify-between gap-2">

                      <span className="text-muted-foreground">Amount</span>

                      <span className="font-medium">

                        {new Intl.NumberFormat("en-US", {

                          style: "currency",

                          currency: "USD",

                        }).format(caseItem.paymentAmount)}

                      </span>

                    </div>

                  )}

                  {caseItem.paymentStatus && (

                    <div className="flex justify-between gap-2">

                      <span className="text-muted-foreground">Payment</span>

                      <span className="font-medium">{caseItem.paymentStatus}</span>

                    </div>

                  )}

                </>

              )}

            </CardContent>

          </Card>

        </div>

      </div>



      {editingCase && (

        <CaseForm

          mode="edit"

          initialData={editingCase}

          open={isEditModalOpen}

          onClose={closeEditModal}

        />

      )}

    </div>

  );

}
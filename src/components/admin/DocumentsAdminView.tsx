"use client";

import { useState } from "react";
import { DocumentUploadForm } from "@/components/admin/DocumentUploadForm";
import { FormToggleButton } from "@/components/admin/FormToggleButton";
import { DocumentsList } from "@/components/DocumentsList";
import type { SharedDocument } from "@/types/database";

type Props = {
  documents: SharedDocument[];
};

export function DocumentsAdminView({ documents }: Props) {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <>
      <div className="mt-8">
        <FormToggleButton
          label="Anexar documento"
          openLabel="Cancelar anexo"
          isOpen={uploadOpen}
          onToggle={() => setUploadOpen((open) => !open)}
        />

        {uploadOpen ? (
          <div className="mt-4">
            <DocumentUploadForm onSuccess={() => setUploadOpen(false)} />
          </div>
        ) : null}
      </div>

      <section className="mt-10 border-t border-gold/20 pt-10">
        <h2 className="section-title text-2xl font-semibold text-royal-blue">
          Documentos publicados
        </h2>
        <div className="mt-6">
          <DocumentsList
            documents={documents}
            canManage
            viewerBasePath="/admin/documentos"
          />
        </div>
      </section>
    </>
  );
}

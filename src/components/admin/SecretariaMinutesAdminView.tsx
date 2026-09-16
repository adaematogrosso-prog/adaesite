"use client";

import { useState } from "react";
import { FormToggleButton } from "@/components/admin/FormToggleButton";
import { MeetingMinuteUploadForm } from "@/components/secretaria/MeetingMinuteUploadForm";
import { MeetingMinutesList } from "@/components/secretaria/MeetingMinutesList";
import type { MeetingMinute } from "@/types/database";

type Props = {
  minutes: MeetingMinute[];
};

export function SecretariaMinutesAdminView({ minutes }: Props) {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <>
      <div className="mt-8">
        <FormToggleButton
          label="Publicar ata"
          openLabel="Cancelar publicação"
          isOpen={uploadOpen}
          onToggle={() => setUploadOpen((open) => !open)}
        />

        {uploadOpen ? (
          <div className="mt-4">
            <MeetingMinuteUploadForm onSuccess={() => setUploadOpen(false)} />
          </div>
        ) : null}
      </div>

      <section className="mt-10 border-t border-gold/20 pt-10">
        <h2 className="section-title text-2xl font-semibold text-royal-blue">
          Atas publicadas
        </h2>
        <div className="mt-6">
          <MeetingMinutesList
            minutes={minutes}
            canManage
            viewerBasePath="/admin/secretaria/atas"
          />
        </div>
      </section>
    </>
  );
}

"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  removeSeniorPillarImage,
  updateSeniorPillarImage,
} from "@/actions/senior-pillars";
import type { SeniorPillar } from "@/types/database";

type Props = {
  pillar: SeniorPillar;
};

export function SeniorPillarEditor({ pillar }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(pillar.image_url);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRemoving, startRemoveTransition] = useTransition();

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    setMessage(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateSeniorPillarImage(formData);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      setMessage({ type: "success", text: "Imagem salva com sucesso!" });
      const fileInput = formRef.current?.querySelector<HTMLInputElement>(
        'input[type="file"]',
      );
      if (fileInput) fileInput.value = "";
    });
  }

  function handleRemoveImage() {
    setMessage(null);

    startRemoveTransition(async () => {
      const result = await removeSeniorPillarImage(pillar.id);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      setPreview(null);
      setMessage({ type: "success", text: "Imagem removida." });
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-gold/20 bg-white shadow-sm"
    >
      <input type="hidden" name="id" value={pillar.id} />
      <input type="hidden" name="key" value={pillar.key} />

      <div className="p-6">
        <h3 className="section-title text-lg font-semibold text-royal-blue">
          {pillar.title}
        </h3>
        <p className="mt-1 text-sm text-muted">{pillar.description}</p>
      </div>

      <div className="relative aspect-[4/3] w-full bg-royal-blue/5">
        {preview ? (
          <Image
            src={preview}
            alt={pillar.title}
            fill
            className="object-cover"
            sizes="400px"
            unoptimized={preview.startsWith("blob:")}
          />
        ) : (
          <div className="flex h-full min-h-48 items-center justify-center border-t border-dashed border-gold/20">
            <p className="text-sm italic text-muted">Nenhuma imagem</p>
          </div>
        )}
      </div>

      <div className="space-y-3 p-6">
        <label className="flex cursor-pointer items-center justify-center rounded-lg border border-gold/40 px-4 py-2.5 text-sm font-medium text-royal-blue transition hover:bg-gold/10">
          Escolher imagem
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </label>

        {preview && (
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={isRemoving}
            className="w-full text-sm text-crimson hover:underline disabled:opacity-50"
          >
            {isRemoving ? "Removendo..." : "Remover imagem"}
          </button>
        )}

        {message && (
          <p
            className={`text-sm ${
              message.type === "success" ? "text-green-700" : "text-crimson"
            }`}
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-royal-blue py-2.5 text-sm font-semibold text-white transition hover:bg-royal-blue-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Salvando..." : "Salvar imagem"}
        </button>
      </div>
    </form>
  );
}

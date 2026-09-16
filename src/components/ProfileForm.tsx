"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  removeMemberProfilePhoto,
  updateMemberProfile,
} from "@/actions/profile";
import { ProfilePasswordForm } from "@/components/ProfilePasswordForm";
import { MemberProfileExtraFields } from "@/components/MemberProfileExtraFields";
import { formatCep } from "@/lib/format";
import { isMasonToFormValue } from "@/lib/members/profile-fields";
import {
  formatCity,
  formatOrganizationName,
  formatPersonName,
  formatProfession,
} from "@/lib/members/profile-text";
import type { MemberProfile } from "@/types/database";

type Props = {
  profile: MemberProfile | null;
  userEmail: string;
  defaultFullName?: string;
  defaultMemberId?: string;
};

export function ProfileForm({
  profile,
  userEmail,
  defaultFullName = "",
  defaultMemberId = "",
}: Props) {
  const isNewProfile = !profile;
  const formRef = useRef<HTMLFormElement>(null);
  const [memberId, setMemberId] = useState(profile?.member_id ?? defaultMemberId);
  const [fullName, setFullName] = useState(profile?.full_name ?? defaultFullName);
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [birthDate, setBirthDate] = useState(profile?.birth_date ?? "");
  const [cep, setCep] = useState(formatCep(profile?.cep ?? ""));
  const [city, setCity] = useState(profile?.city ?? "");
  const [alumniCollege, setAlumniCollege] = useState(
    profile?.alumni_college ?? "",
  );
  const [chapterName, setChapterName] = useState(profile?.chapter_name ?? "");
  const [profession, setProfession] = useState(profile?.profession ?? "");
  const [educationLevel, setEducationLevel] = useState(
    profile?.education_level ?? "",
  );
  const [isMason, setIsMason] = useState(isMasonToFormValue(profile?.is_mason));
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(
    profile?.profile_photo_url ?? null,
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRemoving, startRemoveTransition] = useTransition();
  const router = useRouter();

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  async function handleCepChange(value: string) {
    const formatted = formatCep(value);
    setCep(formatted);
    setCepError(null);

    const digits = formatted.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setCepLoading(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = (await response.json()) as {
        erro?: boolean;
        localidade?: string;
        uf?: string;
      };

      if (data.erro || !data.localidade) {
        setCepError("CEP não encontrado.");
        return;
      }

      setCity(formatCity(`${data.localidade} - ${data.uf}`));
    } catch {
      setCepError("Não foi possível buscar o CEP.");
    } finally {
      setCepLoading(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const formattedFullName = formatPersonName(fullName);
    const formattedCity = city ? formatCity(city) : "";
    const formattedAlumniCollege = alumniCollege
      ? formatOrganizationName(alumniCollege)
      : "";
    const formattedChapterName = chapterName
      ? formatOrganizationName(chapterName)
      : "";
    const formattedProfession = profession ? formatProfession(profession) : "";

    setFullName(formattedFullName);
    setCity(formattedCity);
    setAlumniCollege(formattedAlumniCollege);
    setChapterName(formattedChapterName);
    setProfession(formattedProfession);

    const formData = new FormData(event.currentTarget);
    formData.set("fullName", formattedFullName);
    formData.set("city", formattedCity);
    formData.set("alumniCollege", formattedAlumniCollege);
    formData.set("chapterName", formattedChapterName);
    formData.set("profession", formattedProfession);

    startTransition(async () => {
      const result = await updateMemberProfile(formData);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      setMessage({
        type: "success",
        text: result.warning
          ? result.warning
          : isNewProfile
            ? "Cadastro criado com sucesso!"
            : "Perfil atualizado com sucesso!",
      });
      router.refresh();
      const fileInput = formRef.current?.querySelector<HTMLInputElement>(
        'input[type="file"]',
      );
      if (fileInput) fileInput.value = "";
    });
  }

  function handleRemovePhoto() {
    if (isNewProfile) {
      setPreview(null);
      return;
    }

    setMessage(null);

    startRemoveTransition(async () => {
      const result = await removeMemberProfilePhoto();

      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      setPreview(null);
      setMessage({ type: "success", text: "Foto de perfil removida." });
    });
  }

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gold/20 bg-white p-8 shadow-lg"
      >
        {isNewProfile ? (
          <p className="mb-6 rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-sm text-muted">
            Complete seu cadastro para usar foto, CEP, data de nascimento e
            demais dados no painel.
          </p>
        ) : null}

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-gold/30 bg-royal-blue/5">
              {preview ? (
                <Image
                  src={preview}
                  alt={fullName || "Foto de perfil"}
                  fill
                  className="object-cover"
                  sizes="128px"
                  unoptimized={preview.startsWith("blob:")}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="section-title text-2xl font-bold text-royal-blue/40">
                    {(fullName || userEmail).charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <label className="cursor-pointer rounded-full border border-gold/40 px-3 py-1.5 text-xs font-medium text-royal-blue transition hover:bg-gold/10">
              Alterar foto
              <input
                type="file"
                name="photo"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>

            {preview ? (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isRemoving}
                className="text-xs text-crimson hover:underline disabled:opacity-50"
              >
                {isRemoving ? "Removendo..." : "Remover foto"}
              </button>
            ) : null}
          </div>

          <div className="flex-1 space-y-4">
            {isNewProfile ? (
              <div>
                <label
                  htmlFor="profile-member-id"
                  className="block text-sm font-medium text-foreground"
                >
                  ID DeMolay
                </label>
                <input
                  id="profile-member-id"
                  name="memberId"
                  type="text"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 uppercase outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                  placeholder="Ex.: MT1234"
                />
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted">ID DeMolay</p>
                <p className="mt-1 font-semibold text-royal-blue">
                  {profile.member_id}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted">E-mail</p>
              <p className="mt-1 text-foreground">{profile?.email ?? userEmail}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="profile-name"
              className="block text-sm font-medium text-foreground"
            >
              Nome completo
            </label>
            <input
              id="profile-name"
              name="fullName"
              type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={() => setFullName((value) => formatPersonName(value))}
            className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="profile-phone"
                className="block text-sm font-medium text-foreground"
              >
                Telefone
              </label>
              <input
                id="profile-phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                placeholder="(65) 99999-9999"
              />
            </div>

            <div>
              <label
                htmlFor="profile-birth-date"
                className="block text-sm font-medium text-foreground"
              >
                Data de aniversário
              </label>
              <input
                id="profile-birth-date"
                name="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="profile-cep"
                className="block text-sm font-medium text-foreground"
              >
                CEP
              </label>
              <input
                id="profile-cep"
                name="cep"
                type="text"
                inputMode="numeric"
                value={cep}
                onChange={(e) => handleCepChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                placeholder="78000-000"
              />
              {cepLoading ? (
                <p className="mt-1 text-xs text-muted">Buscando cidade...</p>
              ) : null}
              {cepError ? (
                <p className="mt-1 text-xs text-crimson">{cepError}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="profile-city"
                className="block text-sm font-medium text-foreground"
              >
                Cidade
              </label>
              <input
                id="profile-city"
                name="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onBlur={() => setCity((value) => formatCity(value))}
                className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                placeholder="Preenchida automaticamente pelo CEP"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="profile-alumni-college"
                className="block text-sm font-medium text-foreground"
              >
                Colégio Alumni afiliado
              </label>
              <input
                id="profile-alumni-college"
                name="alumniCollege"
                type="text"
                value={alumniCollege}
                onChange={(e) => setAlumniCollege(e.target.value)}
                onBlur={() =>
                  setAlumniCollege((value) => formatOrganizationName(value))
                }
                className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                placeholder="Nome do colégio alumni"
              />
            </div>

            <div>
              <label
                htmlFor="profile-chapter"
                className="block text-sm font-medium text-foreground"
              >
                Capítulo
              </label>
              <input
                id="profile-chapter"
                name="chapterName"
                type="text"
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
                onBlur={() =>
                  setChapterName((value) => formatOrganizationName(value))
                }
                className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                placeholder="Nome do capítulo DeMolay"
              />
            </div>
          </div>

          <MemberProfileExtraFields
            profession={profession}
            educationLevel={educationLevel}
            isMason={isMason}
            onProfessionChange={setProfession}
            onEducationLevelChange={setEducationLevel}
            onIsMasonChange={setIsMason}
            onProfessionBlur={() =>
              setProfession((value) => formatProfession(value))
            }
          />
        </div>

        {message ? (
          <p
            className={`mt-4 text-sm ${
              message.type === "success" ? "text-green-700" : "text-crimson"
            }`}
          >
            {message.text}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 w-full rounded-full bg-royal-blue py-3 text-sm font-semibold text-white transition hover:bg-royal-blue-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Salvando..."
            : isNewProfile
              ? "Salvar cadastro"
              : "Salvar alterações"}
        </button>
      </form>

      <div className="mt-6">
        <ProfilePasswordForm />
      </div>
    </>
  );
}

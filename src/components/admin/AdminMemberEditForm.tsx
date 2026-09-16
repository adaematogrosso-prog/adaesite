"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  removeMemberPhotoByApprover,
  updateMemberByApprover,
} from "@/actions/member-admin";
import { formatCep } from "@/lib/format";
import { isMasonToFormValue } from "@/lib/members/profile-fields";
import {
  formatCity,
  formatOrganizationName,
  formatPersonName,
  formatProfession,
} from "@/lib/members/profile-text";
import { MemberProfileExtraFields } from "@/components/MemberProfileExtraFields";
import type { MemberProfile, MembershipStatus } from "@/types/database";

type Props = {
  profile: MemberProfile;
  canEditPassword: boolean;
};

const STATUS_LABELS: Record<MembershipStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Recusado",
};

export function AdminMemberEditForm({ profile, canEditPassword }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [memberId, setMemberId] = useState(profile.member_id);
  const [fullName, setFullName] = useState(profile.full_name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [birthDate, setBirthDate] = useState(profile.birth_date ?? "");
  const [status, setStatus] = useState<MembershipStatus>(profile.status);
  const [cep, setCep] = useState(formatCep(profile.cep ?? ""));
  const [city, setCity] = useState(profile.city ?? "");
  const [alumniCollege, setAlumniCollege] = useState(
    profile.alumni_college ?? "",
  );
  const [chapterName, setChapterName] = useState(profile.chapter_name ?? "");
  const [profession, setProfession] = useState(profile.profession ?? "");
  const [educationLevel, setEducationLevel] = useState(
    profile.education_level ?? "",
  );
  const [isMason, setIsMason] = useState(isMasonToFormValue(profile.is_mason));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(
    profile.profile_photo_url,
  );
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
    if (isPending) return;
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
    formData.set("status", status);

    startTransition(async () => {
      const result = await updateMemberByApprover(profile.user_id, formData);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setMessage({ type: "success", text: "Cadastro atualizado com sucesso!" });
      const fileInput = formRef.current?.querySelector<HTMLInputElement>(
        'input[type="file"]',
      );
      if (fileInput) fileInput.value = "";
    });
  }

  function handleRemovePhoto() {
    setMessage(null);

    startRemoveTransition(async () => {
      const result = await removeMemberPhotoByApprover(profile.user_id);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      setPreview(null);
      setMessage({ type: "success", text: "Foto de perfil removida." });
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-gold/30 bg-royal-blue/5">
            {preview ? (
              <Image
                src={preview}
                alt={fullName}
                fill
                className="object-cover"
                sizes="112px"
                unoptimized={preview.startsWith("blob:")}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="section-title text-2xl font-bold text-royal-blue/40">
                  {fullName.charAt(0)}
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

        <div className="flex-1 text-sm text-muted">
          <p>
            Status atual:{" "}
            <strong className="text-royal-blue">
              {STATUS_LABELS[profile.status]}
            </strong>
          </p>
          <p className="mt-1">
            Cadastro em{" "}
            {new Date(profile.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`member-id-${profile.user_id}`}
            className="block text-sm font-medium text-foreground"
          >
            ID DeMolay
          </label>
          <input
            id={`member-id-${profile.user_id}`}
            name="memberId"
            type="text"
            required
            value={memberId}
            onChange={(event) => setMemberId(event.target.value.toUpperCase())}
            className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>

        <div>
          <label
            htmlFor={`member-status-${profile.user_id}`}
            className="block text-sm font-medium text-foreground"
          >
            Status da adesão
          </label>
          <select
            id={`member-status-${profile.user_id}`}
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as MembershipStatus)
            }
            className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
          >
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="rejected">Recusado</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor={`member-name-${profile.user_id}`}
            className="block text-sm font-medium text-foreground"
          >
            Nome completo
          </label>
          <input
            id={`member-name-${profile.user_id}`}
            name="fullName"
            type="text"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            onBlur={() => setFullName((value) => formatPersonName(value))}
            className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor={`member-email-${profile.user_id}`}
            className="block text-sm font-medium text-foreground"
          >
            E-mail de login
          </label>
          <input
            id={`member-email-${profile.user_id}`}
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>

        {canEditPassword ? (
          <>
            <div>
              <label
                htmlFor={`member-password-${profile.user_id}`}
                className="block text-sm font-medium text-foreground"
              >
                Nova senha
              </label>
              <input
                id={`member-password-${profile.user_id}`}
                name="password"
                type="password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Deixe em branco para manter"
                className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div>
              <label
                htmlFor={`member-confirm-password-${profile.user_id}`}
                className="block text-sm font-medium text-foreground"
              >
                Confirmar nova senha
              </label>
              <input
                id={`member-confirm-password-${profile.user_id}`}
                name="confirmPassword"
                type="password"
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repita a nova senha"
                className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
          </>
        ) : (
          <div className="sm:col-span-2 rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-sm text-muted">
            A senha do administrador da plataforma só pode ser alterada pelo
            próprio admin.
          </div>
        )}

        <div>
          <label
            htmlFor={`member-phone-${profile.user_id}`}
            className="block text-sm font-medium text-foreground"
          >
            Telefone
          </label>
          <input
            id={`member-phone-${profile.user_id}`}
            name="phone"
            type="tel"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>

        <div>
          <label
            htmlFor={`member-birth-${profile.user_id}`}
            className="block text-sm font-medium text-foreground"
          >
            Data de aniversário
          </label>
          <input
            id={`member-birth-${profile.user_id}`}
            name="birthDate"
            type="date"
            required
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>

        <div>
          <label
            htmlFor={`member-cep-${profile.user_id}`}
            className="block text-sm font-medium text-foreground"
          >
            CEP
          </label>
          <input
            id={`member-cep-${profile.user_id}`}
            name="cep"
            type="text"
            inputMode="numeric"
            value={cep}
            onChange={(event) => handleCepChange(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
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
            htmlFor={`member-city-${profile.user_id}`}
            className="block text-sm font-medium text-foreground"
          >
            Cidade
          </label>
          <input
            id={`member-city-${profile.user_id}`}
            name="city"
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            onBlur={() => setCity((value) => formatCity(value))}
            className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>

        <div>
          <label
            htmlFor={`member-college-${profile.user_id}`}
            className="block text-sm font-medium text-foreground"
          >
            Colégio Alumni afiliado
          </label>
          <input
            id={`member-college-${profile.user_id}`}
            name="alumniCollege"
            type="text"
            value={alumniCollege}
            onChange={(event) => setAlumniCollege(event.target.value)}
            onBlur={() =>
              setAlumniCollege((value) => formatOrganizationName(value))
            }
            className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>

        <div>
          <label
            htmlFor={`member-chapter-${profile.user_id}`}
            className="block text-sm font-medium text-foreground"
          >
            Capítulo
          </label>
          <input
            id={`member-chapter-${profile.user_id}`}
            name="chapterName"
            type="text"
            value={chapterName}
            onChange={(event) => setChapterName(event.target.value)}
            onBlur={() =>
              setChapterName((value) => formatOrganizationName(value))
            }
            className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>

        <div className="sm:col-span-2">
          <MemberProfileExtraFields
            idPrefix={`member-${profile.user_id}`}
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
        className="mt-6 rounded-full bg-royal-blue px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-royal-blue-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Salvar cadastro"}
      </button>
    </form>
  );
}

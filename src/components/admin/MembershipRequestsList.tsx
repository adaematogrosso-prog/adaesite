"use client";



import { useMemo, useState, useTransition } from "react";

import {

  approveMembership,

  rejectMembership,

} from "@/actions/membership";

import { SearchBar } from "@/components/SearchBar";

import { matchesSearch } from "@/lib/search";
import {
  formatEducationLevel,
  formatIsMason,
} from "@/lib/members/profile-fields";

import type { ExecutiveLinkOption } from "@/types/admin";

import type { MemberProfile } from "@/types/database";



type Props = {

  requests: MemberProfile[];

  executiveOptions: ExecutiveLinkOption[];

};



function formatBirthDate(value: string | null) {

  if (!value) return "Não informado";



  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", {

    day: "2-digit",

    month: "long",

    year: "numeric",

  });

}



export function MembershipRequestsList({

  requests,

  executiveOptions,

}: Props) {

  const [message, setMessage] = useState<{

    type: "success" | "error";

    text: string;

  } | null>(null);

  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>(

    {},

  );

  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState("");

  const filteredRequests = useMemo(() => {
    if (!query.trim()) return requests;

    return requests.filter((request) =>
      matchesSearch(
        query,
        request.full_name,
        request.email,
        request.member_id,
        request.phone,
        request.city,
        request.alumni_college,
        request.profession,
        formatEducationLevel(request.education_level),
        formatIsMason(request.is_mason),
      ),
    );
  }, [requests, query]);



  function handleApprove(userId: string) {

    setMessage(null);

    const executiveId = selectedRoles[userId] || null;



    startTransition(async () => {

      const result = await approveMembership(userId, executiveId);



      if (result.error && !result.success) {

        setMessage({ type: "error", text: result.error });

        return;

      }



      if (result.error && result.success) {

        setMessage({ type: "error", text: result.error });

        return;

      }



      const successText = result.linkedRoleLabel

        ? `Adesão aprovada e irmão vinculado como ${result.linkedRoleLabel}.`

        : "Adesão aprovada com sucesso.";



      setMessage({ type: "success", text: successText });

    });

  }



  function handleReject(userId: string) {

    const reason = window.prompt("Motivo da recusa (opcional):") ?? "";

    setMessage(null);

    startTransition(async () => {

      const result = await rejectMembership(userId, reason);

      setMessage(

        result.error

          ? { type: "error", text: result.error }

          : { type: "success", text: "Adesão recusada." },

      );

    });

  }



  if (requests.length === 0) {

    return (

      <div className="mt-8 rounded-2xl border border-dashed border-gold/30 bg-white p-10 text-center">

        <p className="text-muted">Nenhuma solicitação de adesão pendente.</p>

        <p className="mt-3 text-sm text-muted">

          Para editar cadastros existentes, use a seção{" "}

          <a href="#cadastro" className="text-royal-blue hover:underline">

            Gerenciar cadastros

          </a>{" "}

          abaixo.

        </p>

      </div>

    );

  }



  return (

    <div className="mt-8 space-y-4">

      <SearchBar

        id="membership-requests-search"

        label="Pesquisar solicitações"

        placeholder="Buscar por nome, e-mail, ID DeMolay, telefone..."

        value={query}

        onChange={setQuery}

      />

      {message && (

        <div

          className={`rounded-lg px-4 py-3 text-sm ${

            message.type === "success"

              ? "border border-green-200 bg-green-50 text-green-800"

              : "border border-crimson/20 bg-crimson/5 text-crimson"

          }`}

        >

          {message.text}

        </div>

      )}



      {filteredRequests.length === 0 ? (

        <div className="rounded-2xl border border-dashed border-gold/30 bg-white p-10 text-center">

          <p className="text-muted">Nenhuma solicitação encontrada.</p>

        </div>

      ) : null}



      {filteredRequests.map((request) => (

        <article

          key={request.user_id}

          className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm"

        >

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

            <div>

              <h2 className="section-title text-lg font-semibold text-royal-blue">

                {request.full_name}

              </h2>

              <p className="mt-1 text-sm text-muted">{request.email}</p>

              <p className="mt-3 text-sm text-foreground">

                ID DeMolay:{" "}

                <strong className="text-royal-blue">{request.member_id}</strong>

              </p>

              <p className="mt-1 text-sm text-foreground">

                Telefone: <strong>{request.phone ?? "Não informado"}</strong>

              </p>

              <p className="mt-1 text-sm text-foreground">

                Aniversário:{" "}

                <strong>{formatBirthDate(request.birth_date)}</strong>

              </p>

              <p className="mt-1 text-sm text-foreground">

                Profissão:{" "}

                <strong>{request.profession?.trim() || "Não informado"}</strong>

              </p>

              <p className="mt-1 text-sm text-foreground">

                Escolaridade:{" "}

                <strong>{formatEducationLevel(request.education_level)}</strong>

              </p>

              <p className="mt-1 text-sm text-foreground">

                Já é maçon?{" "}

                <strong>{formatIsMason(request.is_mason)}</strong>

              </p>

              <p className="mt-1 text-xs text-muted">

                Solicitado em{" "}

                {new Date(request.created_at).toLocaleDateString("pt-BR", {

                  day: "2-digit",

                  month: "long",

                  year: "numeric",

                })}

              </p>

            </div>



            <div className="flex w-full shrink-0 flex-col gap-3 lg:max-w-xs">

              <div>

                <label

                  htmlFor={`role-${request.user_id}`}

                  className="block text-sm font-medium text-foreground"

                >

                  Cargo executivo (opcional)

                </label>

                <select

                  id={`role-${request.user_id}`}

                  value={selectedRoles[request.user_id] ?? ""}

                  disabled={isPending}

                  onChange={(event) =>

                    setSelectedRoles((current) => ({

                      ...current,

                      [request.user_id]: event.target.value,

                    }))

                  }

                  className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:opacity-60"

                >

                  <option value="">Aprovar sem cargo</option>

                  {executiveOptions.map((option) => (

                    <option key={option.id} value={option.id}>

                      {option.label}

                      {option.occupantName

                        ? ` (substitui ${option.occupantName})`

                        : ""}

                    </option>

                  ))}

                </select>

                <p className="mt-1 text-xs text-muted">

                  Nome e foto passam a vir do perfil do irmão após o vínculo.

                </p>

              </div>



              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">

                <button

                  type="button"

                  onClick={() => handleApprove(request.user_id)}

                  disabled={isPending}

                  className="rounded-full bg-royal-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-royal-blue-light disabled:opacity-60"

                >

                  {isPending ? "Processando..." : "Aprovar"}

                </button>

                <button

                  type="button"

                  onClick={() => handleReject(request.user_id)}

                  disabled={isPending}

                  className="rounded-full border border-crimson/30 px-5 py-2.5 text-sm font-semibold text-crimson transition hover:bg-crimson/5 disabled:opacity-60"

                >

                  Recusar

                </button>

              </div>

            </div>

          </div>

        </article>

      ))}

    </div>

  );

}


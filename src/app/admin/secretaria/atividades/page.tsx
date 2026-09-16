import Link from "next/link";
import { requireSecretariaAccess } from "@/lib/auth/admin";
import { getAllActivities, getPublishedActivities } from "@/lib/secretaria/activities";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ActivitiesFeedWithSearch } from "@/components/secretaria/ActivitiesFeedWithSearch";

export default async function AdminSecretariaActivitiesPage() {
  await requireSecretariaAccess();

  const [allActivities, publishedActivities] = await Promise.all([
    getAllActivities(),
    getPublishedActivities(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Atividades"
        subtitle="Publique atividades com banner, subtítulo e texto completo com formatação."
        actions={
          <Link
            href="/admin/secretaria/atividades/nova"
            className="inline-flex items-center justify-center rounded-full bg-royal-blue px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-royal-blue-light"
          >
            + Nova atividade
          </Link>
        }
      />

      <div className="mt-6 rounded-2xl border border-gold/15 bg-white/80 px-5 py-4 text-sm text-muted">
        <span className="font-semibold text-royal-blue">{publishedActivities.length}</span>{" "}
        publicadas ·{" "}
        <span className="font-semibold text-royal-blue">{allActivities.length}</span> no total
      </div>

      <div className="mt-8">
        <ActivitiesFeedWithSearch
          activities={allActivities}
          canManage
          viewerBasePath="/secretaria/atividades"
        />
      </div>
    </div>
  );
}

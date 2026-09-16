export function AdminSidebarBackground() {
  return (
    <div
      className="admin-sidebar-bg pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="admin-sidebar-bg-gradient" />
      <div className="admin-sidebar-bg-mesh" />
      <div className="admin-sidebar-bg-pattern" />
      <div className="admin-sidebar-bg-rays" />
      <div className="admin-sidebar-bg-shimmer" />
      <div className="admin-sidebar-bg-orb admin-sidebar-bg-orb-top" />
      <div className="admin-sidebar-bg-orb admin-sidebar-bg-orb-bottom" />
    </div>
  );
}

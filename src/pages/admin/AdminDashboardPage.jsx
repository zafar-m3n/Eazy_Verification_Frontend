import { useEffect, useState } from "react";

import API from "@/services";
import VerificationDetailsModal from "@/components/VerificationDetailsModal";
import Icon from "@/components/ui/Icon";
import Notification from "@/components/ui/Notification";
import Spinner from "@/components/ui/Spinner";
import Table from "@/components/ui/Table";

function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const recentColumns = [
    {
      key: "customer",
      label: "Customer",
    },
    {
      key: "contact",
      label: "Contact",
    },
    {
      key: "submitted_at",
      label: "Submitted",
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "actions",
      label: "",
    },
  ];

  useEffect(() => {
    fetchDashboardCounts();
  }, []);

  async function fetchDashboardCounts() {
    try {
      setLoading(true);

      const response = await API.private.getDashboardCounts();

      if (response?.data?.code === "OK") {
        setDashboardData(response.data.data);
        return;
      }

      Notification.error("Failed to load dashboard data.");
    } catch (error) {
      const errorMessage = error?.response?.data?.error || "Failed to load dashboard data.";
      Notification.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenDetails(submissionId) {
    setSelectedSubmissionId(submissionId);
    setDetailsModalOpen(true);
  }

  function handleCloseDetails() {
    setDetailsModalOpen(false);
    setSelectedSubmissionId(null);
  }

  function handleDetailsUpdated() {
    fetchDashboardCounts();
  }

  function getStatusClass(status) {
    if (status === "approved") {
      return "border-accent-1 bg-accent-1/15 text-accent-2";
    }

    if (status === "rejected") {
      return "border-accent-2 bg-accent-2/10 text-accent-2";
    }

    return "border-border bg-background text-text/70";
  }

  function getStatusIcon(status) {
    if (status === "approved") {
      return "solar:check-circle-bold";
    }

    if (status === "rejected") {
      return "solar:close-circle-bold";
    }

    return "solar:clock-circle-bold";
  }

  function formatStatus(status) {
    if (!status) {
      return "Pending";
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString();
  }

  function getFullName(user) {
    if (!user) {
      return "Unknown customer";
    }

    return [user.first_name, user.surname].filter(Boolean).join(" ") || "Unknown customer";
  }

  function renderStatusBadge(status) {
    return (
      <span
        className={[
          "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold",
          getStatusClass(status),
        ].join(" ")}
      >
        <Icon icon={getStatusIcon(status)} className="size-4" />
        {formatStatus(status)}
      </span>
    );
  }

  function renderMainCard({ title, value, icon }) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-text/55">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-text">{formatNumber(value)}</p>
          </div>

          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-1/15 text-accent-2">
            <Icon icon={icon} className="size-6" />
          </div>
        </div>
      </div>
    );
  }

  function renderSmallStatusCard({ title, value, status, icon }) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-text/55">{title}</p>
            <p className="mt-2 text-2xl font-bold text-text">{formatNumber(value)}</p>
          </div>

          <div
            className={[
              "flex size-10 shrink-0 items-center justify-center rounded-xl border",
              getStatusClass(status),
            ].join(" ")}
          >
            <Icon icon={icon} className="size-5" />
          </div>
        </div>
      </div>
    );
  }

  function renderRecentCell(row, column) {
    if (column.key === "customer") {
      return (
        <button type="button" onClick={() => handleOpenDetails(row.id)} className="block max-w-56 text-left">
          <span className="block truncate font-bold text-text">{getFullName(row.user)}</span>
          <span className="mt-1 block truncate text-xs text-text/55">
            {row.user?.country_of_residence || "No country available"}
          </span>
        </button>
      );
    }

    if (column.key === "contact") {
      return (
        <div className="max-w-60">
          <p className="truncate font-semibold text-text/75">{row.user?.email || "N/A"}</p>
          <p className="mt-1 truncate text-xs text-text/50">{row.user?.phone || "N/A"}</p>
        </div>
      );
    }

    if (column.key === "submitted_at") {
      return <span className="font-semibold text-text/70">{row.submitted_at || "N/A"}</span>;
    }

    if (column.key === "status") {
      return renderStatusBadge(row.status);
    }

    if (column.key === "actions") {
      return (
        <button
          type="button"
          onClick={() => handleOpenDetails(row.id)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-text transition hover:border-accent-1 hover:bg-background"
        >
          View
          <Icon icon="solar:alt-arrow-right-linear" className="size-4" />
        </button>
      );
    }

    return row[column.key] || "N/A";
  }

  function renderRecentSubmissions() {
    const recentSubmissions = dashboardData?.recent_submissions || [];

    return (
      <Table
        columns={recentColumns}
        data={recentSubmissions}
        renderCell={renderRecentCell}
        emptyMessage="No recent submissions found."
      />
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-105 items-center justify-center rounded-2xl border border-border bg-card">
        <Spinner />
      </div>
    );
  }

  const submissions = dashboardData?.submissions || {};
  const documents = dashboardData?.documents || {};
  const users = dashboardData?.users || {};

  return (
    <>
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {renderMainCard({
            title: "Total Submissions",
            value: submissions.total,
            icon: "solar:document-text-bold",
          })}

          {renderMainCard({
            title: "Submitted Today",
            value: submissions.today,
            icon: "solar:calendar-bold",
          })}

          {renderMainCard({
            title: "Total Users",
            value: users.total,
            icon: "solar:users-group-rounded-bold",
          })}

          {renderMainCard({
            title: "Documents",
            value: documents.total,
            icon: "solar:folder-with-files-bold",
          })}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {renderSmallStatusCard({
            title: "Pending",
            value: submissions.pending,
            status: "pending",
            icon: "solar:clock-circle-bold",
          })}

          {renderSmallStatusCard({
            title: "Approved",
            value: submissions.approved,
            status: "approved",
            icon: "solar:check-circle-bold",
          })}

          {renderSmallStatusCard({
            title: "Rejected",
            value: submissions.rejected,
            status: "rejected",
            icon: "solar:close-circle-bold",
          })}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-text">Recent Submissions</h2>
            <p className="mt-1 text-sm text-text/55">Latest customer verification requests.</p>
          </div>

          {renderRecentSubmissions()}
        </section>
      </div>

      <VerificationDetailsModal
        isOpen={detailsModalOpen}
        onClose={handleCloseDetails}
        submissionId={selectedSubmissionId}
        onUpdated={handleDetailsUpdated}
      />
    </>
  );
}

export default AdminDashboardPage;

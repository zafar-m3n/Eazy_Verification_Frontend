import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import API from "@/services";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import Icon from "@/components/ui/Icon";
import Notification from "@/components/ui/Notification";
import Spinner from "@/components/ui/Spinner";

function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchDashboardCounts() {
    try {
      setLoading(true);

      const response = await API.private.getDashboardCounts();

      if (response?.data?.code === "OK") {
        setDashboardData(response.data.data);
      } else {
        Notification.error("Failed to load dashboard data.");
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.error || "Failed to load dashboard data.";
      Notification.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardCounts();
  }, []);

  function getCountValue(value) {
    return Number(value || 0).toLocaleString();
  }

  function getCustomerName(user) {
    if (!user) {
      return "Unknown Customer";
    }

    return `${user.first_name || ""} ${user.surname || ""}`.trim() || "Unknown Customer";
  }

  function getStatusColor(status) {
    const colors = {
      pending: "pending",
      approved: "approved",
      rejected: "rejected",
    };

    return colors[status] || "default";
  }

  const submissionStats = [
    {
      label: "Total Submissions",
      value: dashboardData?.submissions?.total,
      icon: "solar:documents-bold",
      description: "All customer verification requests",
      path: "/admin/verifications",
    },
    {
      label: "Pending",
      value: dashboardData?.submissions?.pending,
      icon: "solar:clock-circle-bold",
      description: "Waiting for admin review",
      path: "/admin/verifications?status=pending",
    },
    {
      label: "Approved",
      value: dashboardData?.submissions?.approved,
      icon: "solar:check-circle-bold",
      description: "Successfully verified customers",
      path: "/admin/verifications?status=approved",
    },
    {
      label: "Rejected",
      value: dashboardData?.submissions?.rejected,
      icon: "solar:close-circle-bold",
      description: "Rejected verification requests",
      path: "/admin/verifications?status=rejected",
    },
  ];

  const summaryStats = [
    {
      label: "Submitted Today",
      value: dashboardData?.submissions?.today,
      icon: "solar:calendar-date-bold",
    },
    {
      label: "Total Users",
      value: dashboardData?.users?.total,
      icon: "solar:users-group-rounded-bold",
    },
    {
      label: "Total Documents",
      value: dashboardData?.documents?.total,
      icon: "solar:file-bold",
    },
  ];

  const documentStats = [
    {
      label: "Pending Documents",
      value: dashboardData?.documents?.pending,
      icon: "solar:clock-circle-bold",
    },
    {
      label: "Approved Documents",
      value: dashboardData?.documents?.approved,
      icon: "solar:check-circle-bold",
    },
    {
      label: "Rejected Documents",
      value: dashboardData?.documents?.rejected,
      icon: "solar:close-circle-bold",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-2xl border border-border bg-card">
        <Spinner message="Loading dashboard..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {submissionStats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.path}
            className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-accent-1 hover:bg-background"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text/60">{stat.label}</p>

                <p className="mt-3 text-3xl font-bold text-text">{getCountValue(stat.value)}</p>
              </div>

              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent-1/15 text-accent-2 transition group-hover:bg-accent-1 group-hover:text-card">
                <Icon icon={stat.icon} className="size-6" />
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-text/60">{stat.description}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text/60">{stat.label}</p>
                <p className="mt-3 text-2xl font-bold text-text">{getCountValue(stat.value)}</p>
              </div>

              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-background text-accent-2">
                <Icon icon={stat.icon} className="size-5" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <Heading as="h2" className="text-xl">
                Recent Submissions
              </Heading>

              <p className="mt-1 text-sm text-text/60">Latest customer verification requests.</p>
            </div>

            <Link to="/admin/verifications">
              <Button type="button" variant="secondary" icon="solar:arrow-right-up-bold" className="w-full sm:w-auto">
                View All
              </Button>
            </Link>
          </div>

          <div className="p-5 sm:p-6">
            {dashboardData?.recent_submissions?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recent_submissions.map((submission) => (
                  <Link
                    key={submission.id}
                    to={`/admin/verifications/${submission.id}`}
                    className="block rounded-2xl border border-border bg-background p-4 transition hover:border-accent-1 hover:bg-card"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-1/15 text-accent-2">
                          <Icon icon="solar:user-bold" className="size-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-text">{getCustomerName(submission.user)}</p>

                          <p className="mt-1 truncate text-sm text-text/60">
                            {submission.user?.email || "No email available"}
                          </p>

                          <p className="mt-1 text-xs text-text/50">Submitted: {submission.submitted_at || "N/A"}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 md:justify-end">
                        <Badge
                          text={submission.status || "pending"}
                          color={getStatusColor(submission.status)}
                          size="sm"
                        />

                        <Icon icon="solar:alt-arrow-right-linear" className="size-5 text-text/40" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-border bg-background p-6 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-card text-text/45">
                  <Icon icon="solar:documents-linear" className="size-8" />
                </div>

                <p className="mt-4 text-sm font-bold text-text">No recent submissions</p>

                <p className="mt-2 max-w-sm text-sm leading-6 text-text/60">
                  New customer verification requests will appear here once customers submit the verification form.
                </p>

                <Link to="/admin/verifications" className="mt-5">
                  <Button type="button" variant="secondary" icon="solar:document-text-bold">
                    Open Verifications
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <Heading as="h2" className="text-xl">
            Document Status
          </Heading>

          <p className="mt-1 text-sm text-text/60">Current document review breakdown.</p>

          <div className="mt-5 space-y-3">
            {documentStats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-accent-2">
                    <Icon icon={stat.icon} className="size-5" />
                  </div>

                  <p className="truncate text-sm font-semibold text-text/70">{stat.label}</p>
                </div>

                <p className="shrink-0 text-lg font-bold text-text">{getCountValue(stat.value)}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-accent-2">
                <Icon icon="solar:shield-check-bold" className="size-5" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-text">Review workflow</p>
                <p className="mt-1 text-sm leading-6 text-text/60">
                  Approving or rejecting a submission will update the linked document statuses automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;

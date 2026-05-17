import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import API from "@/services";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import Icon from "@/components/ui/Icon";
import Notification from "@/components/ui/Notification";
import Pagination from "@/components/ui/Pagination";
import Select from "@/components/form/Select";
import Spinner from "@/components/ui/Spinner";
import Table from "@/components/ui/Table";
import TextInput from "@/components/form/TextInput";

function VerificationListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilters = {
    status: searchParams.get("status") || "",
    search: searchParams.get("search") || "",
    date_from: searchParams.get("date_from") || "",
    date_to: searchParams.get("date_to") || "",
    limit: searchParams.get("limit") || "10",
  };

  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: Number(searchParams.get("page") || 1),
    limit: Number(searchParams.get("limit") || 10),
    total_pages: 1,
  });

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page") || 1));
  const [loading, setLoading] = useState(true);
  const [filtersVisible, setFiltersVisible] = useState(true);

  const statusOptions = [
    { label: "All statuses", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  const limitOptions = [
    { label: "10 per page", value: "10" },
    { label: "25 per page", value: "25" },
    { label: "50 per page", value: "50" },
    { label: "100 per page", value: "100" },
  ];

  const columns = [
    {
      key: "customer",
      label: "Customer",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "phone",
      label: "Phone",
    },
    {
      key: "country",
      label: "Country",
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
      key: "action",
      label: "Action",
    },
  ];

  async function fetchVerificationSubmissions() {
    try {
      setLoading(true);

      const params = buildRequestParams();
      updateUrlParams(params);

      const response = await API.private.getVerificationSubmissions(params);

      if (response?.data?.code === "OK") {
        const responseData = response.data.data;

        setSubmissions(responseData?.submissions || []);
        setPagination({
          total: responseData?.pagination?.total || 0,
          page: responseData?.pagination?.page || 1,
          limit: responseData?.pagination?.limit || Number(appliedFilters.limit || 10),
          total_pages: responseData?.pagination?.total_pages || 1,
        });
      } else {
        Notification.error("Failed to load verification submissions.");
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.error || "Failed to load verification submissions.";
      Notification.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVerificationSubmissions();
  }, [currentPage, appliedFilters]);

  function buildRequestParams() {
    const params = {
      page: currentPage,
      limit: appliedFilters.limit || "10",
    };

    if (appliedFilters.status) {
      params.status = appliedFilters.status;
    }

    if (appliedFilters.search.trim()) {
      params.search = appliedFilters.search.trim();
    }

    if (appliedFilters.date_from.trim()) {
      params.date_from = appliedFilters.date_from.trim();
    }

    if (appliedFilters.date_to.trim()) {
      params.date_to = appliedFilters.date_to.trim();
    }

    return params;
  }

  function updateUrlParams(params) {
    const nextSearchParams = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        nextSearchParams[key] = String(value);
      }
    });

    setSearchParams(nextSearchParams, { replace: true });
  }

  function handleFilterChange(name, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  }

  function handleApplyFilters(event) {
    event.preventDefault();

    setCurrentPage(1);
    setAppliedFilters({
      status: filters.status,
      search: filters.search,
      date_from: filters.date_from,
      date_to: filters.date_to,
      limit: filters.limit || "10",
    });
  }

  function handleResetFilters() {
    const resetFilters = {
      status: "",
      search: "",
      date_from: "",
      date_to: "",
      limit: "10",
    };

    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setCurrentPage(1);
    setSearchParams({}, { replace: true });
  }

  function handlePageChange(page) {
    setCurrentPage(page);
  }

  function handleViewDetails(id) {
    navigate(`/admin/verifications/${id}`);
  }

  function toggleFilters() {
    setFiltersVisible((currentValue) => !currentValue);
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

  function getShowingText() {
    if (!pagination.total) {
      return "No submissions found";
    }

    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.total);

    return `Showing ${start} - ${end} of ${pagination.total}`;
  }

  function hasActiveFilters() {
    return Boolean(
      appliedFilters.status ||
      appliedFilters.search.trim() ||
      appliedFilters.date_from.trim() ||
      appliedFilters.date_to.trim(),
    );
  }

  function renderCell(row, column) {
    if (column.key === "customer") {
      return (
        <div className="min-w-0">
          <p className="truncate font-semibold text-text">{getCustomerName(row.user)}</p>
          <p className="mt-1 truncate text-xs text-text/55">{row.user?.id_passport_number || "No ID / Passport"}</p>
        </div>
      );
    }

    if (column.key === "email") {
      return row.user?.email || "N/A";
    }

    if (column.key === "phone") {
      return row.user?.phone || "N/A";
    }

    if (column.key === "country") {
      return row.user?.country_of_residence || "N/A";
    }

    if (column.key === "submitted_at") {
      return row.submitted_at || "N/A";
    }

    if (column.key === "status") {
      return <Badge text={row.status || "pending"} color={getStatusColor(row.status)} size="sm" />;
    }

    if (column.key === "action") {
      return (
        <Button
          type="button"
          variant="secondary"
          icon="solar:eye-bold"
          onClick={() => handleViewDetails(row.id)}
          className="px-3 py-2 text-xs"
        >
          View
        </Button>
      );
    }

    return row[column.key] || "N/A";
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <Heading as="h2" className="text-xl">
              Filters
            </Heading>

            <p className="mt-1 hidden text-sm text-text/60 sm:block">
              Search and filter customer verification submissions.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            icon={filtersVisible ? "solar:eye-closed-bold" : "solar:eye-bold"}
            onClick={toggleFilters}
            className="shrink-0 px-4 py-2"
          >
            {filtersVisible ? "Hide" : "Show"}
          </Button>
        </div>

        {filtersVisible && (
          <form onSubmit={handleApplyFilters} className="px-5 py-4 sm:px-6">
            <div className="grid gap-4">
              <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
                <TextInput
                  label="Search customer"
                  placeholder="Name, email, phone, passport, or country"
                  value={filters.search}
                  onChange={(event) => handleFilterChange("search", event.target.value)}
                />

                <Select
                  label="Status"
                  options={statusOptions}
                  value={filters.status}
                  onChange={(value) => handleFilterChange("status", value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <TextInput
                  label="Date from"
                  placeholder="DD-MM-YYYY"
                  value={filters.date_from}
                  onChange={(event) => handleFilterChange("date_from", event.target.value)}
                />

                <TextInput
                  label="Date to"
                  placeholder="DD-MM-YYYY"
                  value={filters.date_to}
                  onChange={(event) => handleFilterChange("date_to", event.target.value)}
                />

                <Select
                  label="Rows per page"
                  options={limitOptions}
                  value={filters.limit}
                  onChange={(value) => handleFilterChange("limit", value || "10")}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-text/60">
                  {hasActiveFilters() ? "Filters are currently applied." : "Showing all verification submissions."}
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="secondary"
                    icon="solar:restart-bold"
                    onClick={handleResetFilters}
                    className="w-full sm:w-auto"
                  >
                    Reset
                  </Button>

                  <Button type="submit" icon="solar:filter-bold" className="w-full sm:w-auto">
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <Heading as="h2" className="text-xl">
              Verification Submissions
            </Heading>

            <p className="mt-1 text-sm text-text/60">{getShowingText()}</p>
          </div>

          <Button
            type="button"
            variant="secondary"
            icon="solar:refresh-bold"
            onClick={fetchVerificationSubmissions}
            className="w-full sm:w-auto"
          >
            Refresh
          </Button>
        </div>

        <div className="p-5 sm:p-6">
          {loading ? (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-border bg-background">
              <Spinner message="Loading submissions..." size="lg" />
            </div>
          ) : (
            <Table
              columns={columns}
              data={submissions}
              renderCell={renderCell}
              emptyMessage={
                hasActiveFilters()
                  ? "No verification submissions match the current filters."
                  : "No verification submissions found."
              }
            />
          )}
        </div>

        {!loading && pagination.total_pages > 1 && (
          <div className="border-t border-border px-5 py-5 sm:px-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.total_pages}
              onPageChange={handlePageChange}
              text
            />
          </div>
        )}
      </section>
    </div>
  );
}

export default VerificationListPage;

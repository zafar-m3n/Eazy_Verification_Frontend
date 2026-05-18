import { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import API from "@/services";
import VerificationDetailsModal from "@/components/VerificationDetailsModal";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Notification from "@/components/ui/Notification";
import Pagination from "@/components/ui/Pagination";
import Spinner from "@/components/ui/Spinner";
import Table from "@/components/ui/Table";
import Select from "@/components/form/Select";
import TextInput from "@/components/form/TextInput";

const statusOptions = [
  {
    label: "All Statuses",
    value: "",
  },
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Approved",
    value: "approved",
  },
  {
    label: "Rejected",
    value: "rejected",
  },
];

const limitOptions = [
  {
    label: "10 / page",
    value: 10,
  },
  {
    label: "25 / page",
    value: 25,
  },
  {
    label: "50 / page",
    value: 50,
  },
];

const minAllowedDate = new Date(2026, 0, 1);

function VerificationListPage() {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 1,
  });

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    date_from: "",
    date_to: "",
  });

  const [activeFilters, setActiveFilters] = useState({
    search: "",
    status: "",
    date_from: "",
    date_to: "",
  });

  const [openDatePicker, setOpenDatePicker] = useState("");

  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const columns = useMemo(
    () => [
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
        key: "reviewed_at",
        label: "Reviewed",
      },
      {
        key: "status",
        label: "Status",
      },
      {
        key: "actions",
        label: "",
      },
    ],
    [],
  );

  useEffect(() => {
    fetchSubmissions({
      page: pagination.page,
      limit: pagination.limit,
      ...activeFilters,
    });
  }, [pagination.page, pagination.limit, activeFilters]);

  async function fetchSubmissions(params = {}) {
    try {
      setLoading(true);

      const cleanParams = buildCleanParams(params);
      const response = await API.private.getVerificationSubmissions(cleanParams);

      if (response?.data?.code === "OK") {
        setSubmissions(response.data.data?.submissions || []);
        setPagination((currentPagination) => ({
          ...currentPagination,
          ...(response.data.data?.pagination || {}),
        }));
        return;
      }

      Notification.error("Failed to load verification submissions.");
    } catch (error) {
      const errorMessage = error?.response?.data?.error || "Failed to load verification submissions.";
      Notification.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function buildCleanParams(params) {
    return Object.entries(params).reduce((cleanParams, [key, value]) => {
      if (value !== "" && value !== null && typeof value !== "undefined") {
        cleanParams[key] = value;
      }

      return cleanParams;
    }, {});
  }

  function handleFilterChange(name, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  }

  function validateFilters() {
    const fromDate = parseCalendarDate(filters.date_from);
    const toDate = parseCalendarDate(filters.date_to);
    const today = getTodayDate();

    if (filters.date_from && !fromDate) {
      Notification.error("Please select a valid from date.");
      return false;
    }

    if (filters.date_to && !toDate) {
      Notification.error("Please select a valid to date.");
      return false;
    }

    if (fromDate && fromDate < minAllowedDate) {
      Notification.error("From date cannot be older than 01-01-2026.");
      return false;
    }

    if (toDate && toDate < minAllowedDate) {
      Notification.error("To date cannot be older than 01-01-2026.");
      return false;
    }

    if (fromDate && fromDate > today) {
      Notification.error("From date cannot be in the future.");
      return false;
    }

    if (toDate && toDate > today) {
      Notification.error("To date cannot be in the future.");
      return false;
    }

    if (fromDate && toDate && fromDate > toDate) {
      Notification.error("From date cannot be after the to date.");
      return false;
    }

    return true;
  }

  function handleApplyFilters(event) {
    event.preventDefault();

    if (!validateFilters()) {
      return;
    }

    setOpenDatePicker("");

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }));

    setActiveFilters({
      search: filters.search.trim(),
      status: filters.status,
      date_from: filters.date_from.trim(),
      date_to: filters.date_to.trim(),
    });
  }

  function handleClearFilters() {
    const emptyFilters = {
      search: "",
      status: "",
      date_from: "",
      date_to: "",
    };

    setFilters(emptyFilters);
    setActiveFilters(emptyFilters);
    setOpenDatePicker("");

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }));
  }

  function handlePageChange(nextPage) {
    if (nextPage < 1 || nextPage > pagination.total_pages || nextPage === pagination.page) {
      return;
    }

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: nextPage,
    }));
  }

  function handleLimitChange(value) {
    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
      limit: Number(value),
    }));
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
    fetchSubmissions({
      page: pagination.page,
      limit: pagination.limit,
      ...activeFilters,
    });
  }

  function getFullName(user) {
    if (!user) {
      return "Unknown customer";
    }

    return [user.first_name, user.surname].filter(Boolean).join(" ") || "Unknown customer";
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

  function renderFilters() {
    const today = getTodayDate();

    return (
      <form onSubmit={handleApplyFilters} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_auto] xl:items-end">
          <TextInput
            label="Search"
            value={filters.search}
            placeholder="Name, email, phone, ID, country..."
            onChange={(event) => handleFilterChange("search", event.target.value)}
          />

          <Select
            label="Status"
            value={filters.status}
            options={statusOptions}
            placeholder="All Statuses"
            isClearable
            onChange={(value) => handleFilterChange("status", value)}
          />

          <CalendarDateInput
            name="date_from"
            label="From"
            value={filters.date_from}
            placeholder="DD-MM-YYYY"
            minDate={minAllowedDate}
            maxDate={today}
            openDatePicker={openDatePicker}
            setOpenDatePicker={setOpenDatePicker}
            onChange={(value) => handleFilterChange("date_from", value)}
          />

          <CalendarDateInput
            name="date_to"
            label="To"
            value={filters.date_to}
            placeholder="DD-MM-YYYY"
            minDate={minAllowedDate}
            maxDate={today}
            openDatePicker={openDatePicker}
            setOpenDatePicker={setOpenDatePicker}
            onChange={(value) => handleFilterChange("date_to", value)}
          />

          <div className="flex gap-2">
            <Button type="submit" icon="solar:filter-bold" className="w-full xl:w-auto">
              Filter
            </Button>

            <Button
              type="button"
              variant="secondary"
              icon="solar:restart-bold"
              onClick={handleClearFilters}
              className="w-full xl:w-auto"
            >
              Clear
            </Button>
          </div>
        </div>
      </form>
    );
  }

  function renderCell(row, column) {
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
        <div className="max-w-64">
          <p className="truncate font-semibold text-text/75">{row.user?.email || "N/A"}</p>
          <p className="mt-1 truncate text-xs text-text/50">{row.user?.phone || "N/A"}</p>
        </div>
      );
    }

    if (column.key === "submitted_at") {
      return <span className="font-semibold text-text/70">{row.submitted_at || "N/A"}</span>;
    }

    if (column.key === "reviewed_at") {
      return <span className="font-semibold text-text/70">{row.reviewed_at || "N/A"}</span>;
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

  function renderPagination() {
    const totalPages = pagination.total_pages || 1;
    const currentPage = pagination.page || 1;
    const total = pagination.total || 0;
    const limit = pagination.limit || 10;

    const startItem = total === 0 ? 0 : (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, total);

    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-medium text-text/55">
          Showing <span className="font-bold text-text">{startItem}</span> to{" "}
          <span className="font-bold text-text">{endItem}</span> of <span className="font-bold text-text">{total}</span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-40">
            <Select value={pagination.limit} options={limitOptions} placeholder="Limit" onChange={handleLimitChange} />
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>
    );
  }

  function renderContent() {
    if (loading) {
      return (
        <div className="flex min-h-105 items-center justify-center rounded-2xl border border-border bg-card">
          <Spinner />
        </div>
      );
    }

    return (
      <>
        <Table
          columns={columns}
          data={submissions}
          renderCell={renderCell}
          emptyMessage="No verification submissions found."
        />

        {renderPagination()}
      </>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {renderFilters()}

        <div className="space-y-4">{renderContent()}</div>
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

function CalendarDateInput({
  name,
  label,
  value,
  placeholder = "DD-MM-YYYY",
  minDate,
  maxDate,
  openDatePicker,
  setOpenDatePicker,
  onChange,
}) {
  const isOpen = openDatePicker === name;

  function handleDateChange(date) {
    onChange(formatCalendarDate(date));
    setOpenDatePicker("");
  }

  function handleClear() {
    onChange("");
    setOpenDatePicker("");
  }

  function handleToggle() {
    setOpenDatePicker(isOpen ? "" : name);
  }

  return (
    <div className="relative">
      {label && <label className="mb-1.5 block text-sm font-semibold text-text">{label}</label>}

      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm font-semibold text-text outline-none transition placeholder:text-text/35 focus:border-accent-1 focus:ring-2 focus:ring-accent-1/20"
      >
        <span className={value ? "text-text" : "text-text/35"}>{value || placeholder}</span>
        <Icon icon="solar:calendar-bold" className="size-5 shrink-0 text-text/45" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-30 mt-2 rounded-xl border border-border bg-card p-3 shadow-xl">
          <Calendar value={parseCalendarDate(value)} minDate={minDate} maxDate={maxDate} onChange={handleDateChange} />

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg px-3 py-1.5 text-xs font-bold text-text/50 transition hover:bg-background hover:text-text"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatCalendarDate(date) {
  if (!date) {
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

function parseCalendarDate(value) {
  if (!value) {
    return null;
  }

  const [day, month, year] = value.split("-").map(Number);

  if (!day || !month || !year) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function getTodayDate() {
  const today = new Date();

  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

export default VerificationListPage;

import { useEffect, useMemo, useState } from "react";

import API from "@/services";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import Notification from "@/components/ui/Notification";
import Spinner from "@/components/ui/Spinner";

const complianceQuestionKeys = [
  "certify_age",
  "accept_terms_and_privacy",
  "fatca_reportable_person",
  "politically_exposed_person",
];

const tabs = [
  {
    id: "profile",
    label: "Profile",
  },
  {
    id: "answers",
    label: "Trader Profile",
  },
  {
    id: "documents",
    label: "Documents",
  },
  // {
  //   id: "notes",
  //   label: "Notes",
  // },
];

function VerificationDetailsModal({ isOpen, onClose, submissionId, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [internalNotes, setInternalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [downloadingDocumentId, setDownloadingDocumentId] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  const complianceAnswers = useMemo(
    () => getAnswersByKeys(submission?.answers || [], complianceQuestionKeys),
    [submission],
  );

  const financialAnswers = useMemo(
    () => groupAnswers((submission?.answers || []).filter((answer) => answer.section === "financial_information")),
    [submission],
  );

  useEffect(() => {
    if (!isOpen || !submissionId) {
      return;
    }

    fetchSubmissionDetails();
  }, [isOpen, submissionId]);

  async function fetchSubmissionDetails() {
    try {
      setLoading(true);
      setSubmission(null);
      setShowRejectBox(false);
      setRejectionReason("");
      setActiveTab("profile");

      const response = await API.private.getVerificationSubmissionById(submissionId);

      if (response?.data?.code === "OK") {
        const nextSubmission = response.data.data?.submission || null;
        setSubmission(nextSubmission);
        setInternalNotes(nextSubmission?.internal_notes || "");
        return;
      }

      Notification.error("Failed to load verification details.");
    } catch (error) {
      const errorMessage = error?.response?.data?.error || "Failed to load verification details.";
      Notification.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!submission?.id) {
      return;
    }

    try {
      setActionLoading("approve");

      const response = await API.private.approveVerificationSubmission(submission.id);

      if (response?.data?.code === "OK") {
        Notification.success(response.data.message || "Verification approved successfully.");
        await fetchSubmissionDetails();
        onUpdated?.();
        return;
      }

      Notification.error("Failed to approve verification.");
    } catch (error) {
      const errorMessage = error?.response?.data?.error || "Failed to approve verification.";
      Notification.error(errorMessage);
    } finally {
      setActionLoading("");
    }
  }

  async function handleReject() {
    if (!submission?.id) {
      return;
    }

    if (!showRejectBox) {
      setShowRejectBox(true);
      return;
    }

    if (!rejectionReason.trim()) {
      Notification.error("Please enter a rejection reason.");
      return;
    }

    try {
      setActionLoading("reject");

      const response = await API.private.rejectVerificationSubmission(submission.id, rejectionReason.trim());

      if (response?.data?.code === "OK") {
        Notification.success(response.data.message || "Verification rejected successfully.");
        await fetchSubmissionDetails();
        onUpdated?.();
        return;
      }

      Notification.error("Failed to reject verification.");
    } catch (error) {
      const errorMessage = error?.response?.data?.error || "Failed to reject verification.";
      Notification.error(errorMessage);
    } finally {
      setActionLoading("");
    }
  }

  async function handleSaveNotes() {
    if (!submission?.id) {
      return;
    }

    try {
      setActionLoading("notes");

      const response = await API.private.updateVerificationNotes(submission.id, internalNotes);

      if (response?.data?.code === "OK") {
        Notification.success(response.data.message || "Internal notes updated successfully.");
        await fetchSubmissionDetails();
        onUpdated?.();
        return;
      }

      Notification.error("Failed to update internal notes.");
    } catch (error) {
      const errorMessage = error?.response?.data?.error || "Failed to update internal notes.";
      Notification.error(errorMessage);
    } finally {
      setActionLoading("");
    }
  }

  async function handleDownloadDocument(document) {
    if (!submission?.id || !document?.id) {
      return;
    }

    try {
      setDownloadingDocumentId(document.id);

      const response = await API.private.downloadVerificationDocument(submission.id, document.id);
      const blob = new Blob([response.data], {
        type: document.mime_type || "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");

      link.href = url;
      link.download = document.original_file_name || document.saved_file_name || "verification-document";

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || "Failed to download document.";
      Notification.error(errorMessage);
    } finally {
      setDownloadingDocumentId(null);
    }
  }

  function handleModalClose() {
    if (actionLoading || downloadingDocumentId) {
      return;
    }

    setSubmission(null);
    setInternalNotes("");
    setRejectionReason("");
    setShowRejectBox(false);
    setActiveTab("profile");
    onClose?.();
  }

  function getCustomerName() {
    const user = submission?.user;

    return [user?.first_name, user?.surname].filter(Boolean).join(" ") || "Verification Review";
  }

  function getModalTitle() {
    const email = submission?.user?.email;

    if (!email) {
      return getCustomerName();
    }

    return (
      <span className="block min-w-0">
        <span className="block truncate text-lg font-bold leading-6 text-text">{getCustomerName()}</span>
        <span className="mt-0.5 block truncate text-xs font-semibold text-text/45">{email}</span>
      </span>
    );
  }

  function isFinalStatus() {
    return submission?.status === "approved" || submission?.status === "rejected";
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

  function renderInfoRow(label, value) {
    return (
      <div className="grid gap-1 border-b border-border py-3 last:border-b-0 sm:grid-cols-[150px_1fr] sm:gap-5">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-text/40">{label}</p>
        <p className="wrap-break-word text-sm font-semibold leading-6 text-text">{value || "N/A"}</p>
      </div>
    );
  }

  function findAnswerByText(keywords) {
    const normalizedKeywords = keywords.map((keyword) => keyword.toLowerCase());

    return financialAnswers.find((answer) => {
      const combinedText = `${answer.question_key || ""} ${answer.question_text || ""}`.toLowerCase();

      return normalizedKeywords.some((keyword) => combinedText.includes(keyword));
    });
  }

  function getFinancialValue(keywords, fallback = "Not provided") {
    const answer = findAnswerByText(keywords);

    return answer?.display_value || fallback;
  }

  function getComplianceValue(questionKey, fallback = "Not provided") {
    const answer = complianceAnswers.find((item) => item.question_key === questionKey);

    return answer?.display_value || fallback;
  }

  function getSuitabilityValue(label) {
    const valueMap = {
      experience: getFinancialValue(["experience", "trading experience", "years"]),
      knowledge: getFinancialValue(["knowledge", "understanding", "education"]),
      income: getFinancialValue(["income", "annual"]),
      worth: getFinancialValue(["net worth", "worth", "assets"]),
      funds: getFinancialValue(["source of funds", "funds", "source"]),
      purpose: getFinancialValue(["purpose", "objective", "goal"]),
      employment: getFinancialValue(["employment", "occupation", "job"]),
      risk: getFinancialValue(["risk", "risk appetite", "loss"]),
    };

    return valueMap[label] || "Not provided";
  }

  function getSuitabilityProfileItems() {
    return [
      {
        label: "Trading Experience",
        value: getSuitabilityValue("experience"),
        icon: "solar:chart-2-bold",
      },
      {
        label: "Investment Knowledge",
        value: getSuitabilityValue("knowledge"),
        icon: "solar:book-bold",
      },
      {
        label: "Annual Income",
        value: getSuitabilityValue("income"),
        icon: "solar:wallet-money-bold",
      },
      {
        label: "Net Worth",
        value: getSuitabilityValue("worth"),
        icon: "solar:banknote-bold",
      },
      {
        label: "Source of Funds",
        value: getSuitabilityValue("funds"),
        icon: "solar:safe-2-bold",
      },
      {
        label: "Trading Purpose",
        value: getSuitabilityValue("purpose"),
        icon: "solar:target-bold",
      },
      {
        label: "Employment Status",
        value: getSuitabilityValue("employment"),
        icon: "solar:case-round-bold",
      },
      {
        label: "Risk Appetite",
        value: getSuitabilityValue("risk"),
        icon: "solar:shield-warning-bold",
      },
    ];
  }

  function getComplianceItems() {
    return [
      {
        label: "Age Certified",
        value: getComplianceValue("certify_age"),
        icon: "solar:user-check-bold",
      },
      {
        label: "Terms Accepted",
        value: getComplianceValue("accept_terms_and_privacy"),
        icon: "solar:document-add-bold",
      },
      {
        label: "FATCA",
        value: getComplianceValue("fatca_reportable_person"),
        icon: "solar:global-bold",
      },
      {
        label: "PEP",
        value: getComplianceValue("politically_exposed_person"),
        icon: "solar:shield-user-bold",
      },
    ];
  }

  function getOtherFinancialAnswers() {
    const usedAnswers = new Set();

    [
      ["experience", "trading experience", "years"],
      ["knowledge", "understanding", "education"],
      ["income", "annual"],
      ["net worth", "worth", "assets"],
      ["source of funds", "funds", "source"],
      ["purpose", "objective", "goal"],
      ["employment", "occupation", "job"],
      ["risk", "risk appetite", "loss"],
    ].forEach((keywords) => {
      const answer = findAnswerByText(keywords);

      if (answer?.question_key) {
        usedAnswers.add(answer.question_key);
      }
    });

    return financialAnswers.filter((answer) => !usedAnswers.has(answer.question_key));
  }

  function renderTabs() {
    return (
      <div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "rounded-full px-4 py-2 text-sm font-bold transition",
                  isActive ? "bg-text text-card" : "bg-transparent text-text/45 hover:bg-background hover:text-text",
                ].join(" ")}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center">{renderStatusBadge(submission?.status)}</div>
      </div>
    );
  }

  function renderActionBar() {
    if (isFinalStatus()) {
      return null;
    }

    return (
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          icon="solar:close-circle-bold"
          onClick={handleReject}
          disabled={actionLoading === "reject"}
          className="w-full justify-center sm:w-auto"
        >
          {showRejectBox ? "Confirm Reject" : "Reject"}
        </Button>

        <Button
          type="button"
          variant="primary"
          icon={actionLoading === "approve" ? "solar:refresh-bold" : "solar:check-circle-bold"}
          onClick={handleApprove}
          disabled={actionLoading === "approve"}
          className="w-full justify-center sm:w-auto"
        >
          {actionLoading === "approve" ? "Approving..." : "Approve"}
        </Button>
      </div>
    );
  }

  function renderSectionShell(children) {
    return <section className="rounded-2xl border border-border bg-card p-5">{children}</section>;
  }

  function renderSectionTitle(title) {
    return (
      <div className="mb-4">
        <h3 className="text-base font-bold text-text">{title}</h3>
      </div>
    );
  }

  function renderProfileTab() {
    const user = submission?.user;

    return renderSectionShell(
      <>
        {renderSectionTitle("Profile")}

        <div className="rounded-2xl border border-border bg-background px-4">
          {renderInfoRow("Full Name", getCustomerName())}
          {renderInfoRow("Email", user?.email)}
          {renderInfoRow("Phone", user?.phone)}
          {renderInfoRow("ID / Passport", user?.id_passport_number)}
          {renderInfoRow("Date of Birth", user?.date_of_birth)}
          {renderInfoRow("Country", user?.country_of_residence)}
        </div>
      </>,
    );
  }

  function renderComplianceSnapshot() {
    const complianceItems = getComplianceItems();

    return (
      <section className="rounded-2xl border border-border bg-card p-5">
        {renderSectionTitle("Compliance")}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {complianceItems.map((item) => (
            <div key={item.label} className="rounded-2xl border border-border bg-background p-4">
              <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-card text-text/45">
                <Icon icon={item.icon} className="size-5" />
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.12em] text-text/40">{item.label}</p>
              <p className="mt-2 wrap-break-word text-sm font-bold leading-6 text-text">{item.value}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  function renderSuitabilityProfile() {
    const profileItems = getSuitabilityProfileItems();

    return (
      <section className="rounded-2xl border border-border bg-card p-5">
        {renderSectionTitle("Suitability")}

        <div className="grid gap-3 md:grid-cols-2">
          {profileItems.map((item) => (
            <div key={item.label} className="flex gap-4 rounded-2xl border border-border bg-background p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-text/45">
                <Icon icon={item.icon} className="size-5" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-text/40">{item.label}</p>
                <p className="mt-1 wrap-break-word text-sm font-bold leading-6 text-text">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  function renderAdditionalFinancialDetails() {
    const additionalAnswers = getOtherFinancialAnswers();

    if (!additionalAnswers.length) {
      return null;
    }

    return (
      <section className="rounded-2xl border border-border bg-card p-5">
        {renderSectionTitle("Additional Details")}

        <div className="divide-y divide-border rounded-2xl border border-border bg-background">
          {additionalAnswers.map((answer) => (
            <div key={answer.question_key} className="grid gap-2 px-4 py-3 lg:grid-cols-[1fr_0.75fr] lg:gap-6">
              <p className="text-sm font-semibold leading-6 text-text/60">{answer.question_text}</p>
              <p className="wrap-break-word text-sm font-bold leading-6 text-text lg:text-right">
                {answer.display_value || "N/A"}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  function renderAnswersTab() {
    return (
      <div className="space-y-4">
        {renderComplianceSnapshot()}
        {renderSuitabilityProfile()}
        {renderAdditionalFinancialDetails()}
      </div>
    );
  }

  function renderDocumentsTab() {
    const documents = submission?.documents || [];

    return renderSectionShell(
      <>
        {renderSectionTitle("Documents")}

        {!documents.length ? (
          renderEmptyState("No documents uploaded.")
        ) : (
          <div className="divide-y divide-border rounded-2xl border border-border bg-background">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="wrap-break-word text-sm font-bold text-text">
                    {document.document_label || document.document_type || "Document"}
                  </p>
                  <p className="mt-1 wrap-break-word text-xs text-text/45">
                    {document.original_file_name || document.saved_file_name || "Uploaded file"}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                  {document.file_url && (
                    <a
                      href={document.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-text transition hover:border-accent-1 hover:bg-background"
                    >
                      View
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDownloadDocument(document)}
                    disabled={downloadingDocumentId === document.id}
                    className="inline-flex items-center justify-center rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-text transition hover:border-accent-1 hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {downloadingDocumentId === document.id ? "Downloading" : "Download"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>,
    );
  }

  function renderNotesTab() {
    return renderSectionShell(
      <>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {renderSectionTitle("Internal Notes")}

          <Button
            type="button"
            variant="secondary"
            icon={actionLoading === "notes" ? "solar:refresh-bold" : "solar:diskette-bold"}
            onClick={handleSaveNotes}
            disabled={actionLoading === "notes"}
            className="w-full justify-center sm:w-auto"
          >
            {actionLoading === "notes" ? "Saving..." : "Save Notes"}
          </Button>
        </div>

        <textarea
          value={internalNotes}
          onChange={(event) => setInternalNotes(event.target.value)}
          rows={7}
          placeholder="Add internal notes..."
          className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 text-text outline-none transition placeholder:text-text/35 focus:border-accent-1 focus:ring-2 focus:ring-accent-1/20"
        />
      </>,
    );
  }

  function renderRejectBox() {
    if (isFinalStatus()) {
      return null;
    }

    return (
      <div className="rounded-2xl border border-accent-2 bg-accent-2/10 p-4">
        <p className="text-sm font-bold text-text">Reject verification</p>

        <textarea
          value={rejectionReason}
          onChange={(event) => setRejectionReason(event.target.value)}
          rows={3}
          placeholder="Rejection reason..."
          className="mt-4 w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-6 text-text outline-none transition placeholder:text-text/35 focus:border-accent-1 focus:ring-2 focus:ring-accent-1/20"
        />

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setShowRejectBox(false);
              setRejectionReason("");
            }}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            icon={actionLoading === "reject" ? "solar:refresh-bold" : "solar:close-circle-bold"}
            onClick={handleReject}
            disabled={actionLoading === "reject"}
            className="w-full sm:w-auto"
          >
            {actionLoading === "reject" ? "Rejecting..." : "Confirm Reject"}
          </Button>
        </div>
      </div>
    );
  }

  function renderRejectionReason() {
    if (!submission?.rejection_reason) {
      return null;
    }

    return (
      <div className="rounded-2xl border border-accent-2 bg-accent-2/10 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent-2">Rejection Reason</p>
        <p className="mt-2 text-sm leading-6 text-text">{submission.rejection_reason}</p>
      </div>
    );
  }

  function renderEmptyState(message) {
    return (
      <div className="rounded-2xl border border-border bg-background p-6 text-center">
        <Icon icon="solar:inbox-bold" className="mx-auto size-8 text-text/30" />
        <p className="mt-2 text-sm font-bold text-text/50">{message}</p>
      </div>
    );
  }

  function renderActiveTab() {
    if (activeTab === "profile") {
      return renderProfileTab();
    }

    if (activeTab === "answers") {
      return renderAnswersTab();
    }

    if (activeTab === "documents") {
      return renderDocumentsTab();
    }

    // if (activeTab === "notes") {
    //   return renderNotesTab();
    // }

    return renderProfileTab();
  }

  function renderContent() {
    if (loading) {
      return (
        <div className="flex min-h-96 items-center justify-center">
          <Spinner />
        </div>
      );
    }

    if (!submission) {
      return (
        <div className="flex min-h-96 flex-col items-center justify-center rounded-2xl border border-border bg-background p-6 text-center">
          <Icon icon="solar:document-text-bold" className="size-10 text-text/35" />
          <p className="mt-3 text-sm font-bold text-text/60">No verification details loaded.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {renderTabs()}
        {renderActionBar()}
        {renderRejectionReason()}
        {showRejectBox && renderRejectBox()}
        {renderActiveTab()}
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={getModalTitle()}
      size="5xl"
      modalClass="max-h-[92dvh]"
      bodyClass="bg-background"
      closeOnOverlayClick={!actionLoading && !downloadingDocumentId}
      disableEscapeClose={Boolean(actionLoading || downloadingDocumentId)}
    >
      {renderContent()}
    </Modal>
  );
}

function getAnswersByKeys(answers, keys) {
  return groupAnswers(answers.filter((answer) => keys.includes(answer.question_key)));
}

function groupAnswers(answers) {
  const questionMap = new Map();

  answers.forEach((answer) => {
    if (!questionMap.has(answer.question_key)) {
      questionMap.set(answer.question_key, {
        question_key: answer.question_key,
        question_text: answer.question_text,
        sort_order: answer.sort_order,
        values: [],
      });
    }

    const question = questionMap.get(answer.question_key);
    const displayValue = answer.other_value
      ? `${answer.answer_label || "Other"}: ${answer.other_value}`
      : answer.answer_label || answer.answer_value || "N/A";

    question.values.push(displayValue);
  });

  return Array.from(questionMap.values())
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((question) => ({
      ...question,
      display_value: question.values.join(", "),
    }));
}

export default VerificationDetailsModal;

import { useEffect, useMemo, useState } from "react";

import API from "@/services";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import Notification from "@/components/ui/Notification";
import Spinner from "@/components/ui/Spinner";

const complianceQuestionKeys = ["fatca_reportable_person", "politically_exposed_person"];

const goalQuestionKeys = ["short_term_financial_goals", "long_term_financial_goals"];

function VerificationDetailsModal({ isOpen, onClose, submissionId, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [downloadingDocumentId, setDownloadingDocumentId] = useState(null);

  const complianceAnswers = useMemo(
    () => getAnswersByKeys(submission?.answers || [], complianceQuestionKeys),
    [submission],
  );

  const professionalAnswers = useMemo(
    () =>
      groupAnswers((submission?.answers || []).filter((answer) => answer.section === "professional_work_experience")),
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

      const response = await API.private.getVerificationSubmissionById(submissionId);

      if (response?.data?.code === "OK") {
        const nextSubmission = response.data.data?.submission || null;
        setSubmission(nextSubmission);
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
    setRejectionReason("");
    setShowRejectBox(false);
    onClose?.();
  }

  function getCustomerName() {
    const user = submission?.user;

    return [user?.first_name, user?.surname].filter(Boolean).join(" ") || "Verification Review";
  }

  function getInitials() {
    const user = submission?.user;
    const first = user?.first_name || "";
    const last = user?.surname || "";

    if (first && last) {
      return `${first[0]}${last[0]}`.toUpperCase();
    }

    const name = getCustomerName();

    if (!name || name === "Verification Review") {
      return "VR";
    }

    return name.substring(0, 2).toUpperCase();
  }

  function isFinalStatus() {
    return submission?.status === "approved" || submission?.status === "rejected";
  }

  function formatStatus(status) {
    if (!status) {
      return "Pending";
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
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

  function renderStatusBadge(status) {
    return (
      <span
        className={[
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold",
          getStatusClass(status),
        ].join(" ")}
      >
        <Icon icon={getStatusIcon(status)} className="size-3.5" />
        {formatStatus(status)}
      </span>
    );
  }

  function findFinancialAnswerByKey(questionKey) {
    return financialAnswers.find((answer) => answer.question_key === questionKey);
  }

  function getFinancialValueByKey(questionKey, fallback = "Not provided") {
    const answer = findFinancialAnswerByKey(questionKey);

    return answer?.display_value || fallback;
  }

  function findAnswerByText(keywords) {
    const normalizedKeywords = keywords.map((keyword) => keyword.toLowerCase());

    return financialAnswers.find((answer) => {
      const combinedText = `${answer.question_key || ""} ${answer.question_text || ""}`.toLowerCase();

      return normalizedKeywords.some((keyword) => combinedText.includes(keyword));
    });
  }

  function findProfessionalAnswerByKey(questionKey) {
    return professionalAnswers.find((answer) => answer.question_key === questionKey);
  }

  function getProfessionalValue(questionKey, fallback = "Not provided") {
    const answer = findProfessionalAnswerByKey(questionKey);

    return answer?.display_value || fallback;
  }

  function getOptionalProfessionalValue(questionKey) {
    const answer = findProfessionalAnswerByKey(questionKey);

    return answer?.display_value || "";
  }

  function getWorkSummary() {
    const jobTitle = getOptionalProfessionalValue("current_job_title_designation");
    const industry = getOptionalProfessionalValue("industry_business_sector");
    const experience = getOptionalProfessionalValue("years_of_work_experience");

    if (!jobTitle && !industry && !experience) {
      return "Professional information not provided.";
    }

    if (jobTitle && industry && experience) {
      return `Worked as ${jobTitle} in ${industry} for ${experience}.`;
    }

    if (jobTitle && experience) {
      return `Worked as ${jobTitle} for ${experience}.`;
    }

    if (jobTitle && industry) {
      return `Worked as ${jobTitle} in ${industry}.`;
    }

    if (industry && experience) {
      return `Worked in ${industry} for ${experience}.`;
    }

    return jobTitle || industry || experience;
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
      experience: getFinancialValueByKey("trading_experience"),
      knowledge: getFinancialValueByKey("knowledge_of_cfds"),
      income: getFinancialValueByKey("annual_income"),
      worth: getFinancialValueByKey("savings_and_investments_value"),
      funds: getFinancialValueByKey("source_of_funds"),
      purpose: getFinancialValueByKey("main_purpose_for_investing_trading"),
      employment: getFinancialValueByKey("income_source"),
      risk: getFinancialValue(["risk", "risk appetite", "loss"]),
    };

    return valueMap[label] || "Not provided";
  }

  function getTraderProfileItems() {
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
        label: "Savings & Investments",
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
        label: "Income Source",
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
    const usedAnswers = new Set([
      "trading_experience",
      "knowledge_of_cfds",
      "annual_income",
      "savings_and_investments_value",
      "source_of_funds",
      "main_purpose_for_investing_trading",
      "income_source",
    ]);

    const normalAnswers = financialAnswers.filter(
      (answer) => !usedAnswers.has(answer.question_key) && !goalQuestionKeys.includes(answer.question_key),
    );

    const goalAnswers = goalQuestionKeys
      .map((questionKey) => financialAnswers.find((answer) => answer.question_key === questionKey))
      .filter(Boolean);

    return [...normalAnswers, ...goalAnswers];
  }

  function renderModalHeader({ close }) {
    return (
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-1/15 text-sm font-bold text-accent-2">
            {getInitials()}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="truncate text-lg font-bold text-text">{getCustomerName()}</h2>
              {submission && renderStatusBadge(submission.status)}
            </div>

            <p className="mt-0.5 truncate text-xs font-semibold text-text/45">
              {submission?.user?.email || "No email provided"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          {!isFinalStatus() && submission && (
            <>
              <Button
                type="button"
                variant="secondary"
                icon="solar:close-circle-bold"
                onClick={handleReject}
                disabled={actionLoading === "reject"}
                className="w-full justify-center px-4 py-2 text-sm sm:w-auto"
              >
                {showRejectBox ? "Confirm Reject" : "Reject"}
              </Button>

              <Button
                type="button"
                variant="primary"
                icon={actionLoading === "approve" ? "solar:refresh-bold" : "solar:check-circle-bold"}
                onClick={handleApprove}
                disabled={actionLoading === "approve"}
                className="w-full justify-center px-4 py-2 text-sm sm:w-auto"
              >
                {actionLoading === "approve" ? "Approving..." : "Approve"}
              </Button>
            </>
          )}

          <button
            type="button"
            onClick={close}
            disabled={Boolean(actionLoading || downloadingDocumentId)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-text/70 transition hover:bg-background hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <Icon icon="mdi:close" className="size-4.5" />
          </button>
        </div>
      </div>
    );
  }

  function renderCardHeading(title, icon) {
    return (
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-1/10 text-accent-2">
          <Icon icon={icon} className="size-4.5" />
        </div>

        <h3 className="text-sm font-bold text-text">{title}</h3>
      </div>
    );
  }

  function renderCard(children, className = "") {
    return (
      <section className={`rounded-[22px] border border-border bg-card p-4 shadow-sm ${className}`}>{children}</section>
    );
  }

  function renderDetailRow(icon, label, value) {
    return (
      <div className="flex items-start gap-2.5 border-b border-border py-3 last:border-b-0">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-text/45">
          <Icon icon={icon} className="size-4.5" />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-text/35">{label}</p>
          <p className="mt-0.5 wrap-break-word text-[13px] font-semibold leading-5 text-text">{value || "N/A"}</p>
        </div>
      </div>
    );
  }

  function renderWorkSummaryBlock() {
    const ownsBusiness = getOptionalProfessionalValue("own_business");
    const businessType = getOptionalProfessionalValue("business_type");

    return (
      <div className="mb-4 rounded-2xl border border-border bg-background p-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-card text-accent-2">
            <Icon icon="solar:case-round-bold" className="size-5" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-text/35">Work Profile</p>
            <p className="mt-1 text-[13px] font-bold leading-5 text-text">{getWorkSummary()}</p>

            {(ownsBusiness || businessType) && (
              <div className="mt-3 grid gap-2">
                {ownsBusiness && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-text/35">Business Owner</p>
                    <p className="text-[12px] font-bold text-text">{ownsBusiness}</p>
                  </div>
                )}

                {businessType && (
                  <div className="rounded-xl border border-border bg-card px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-text/35">Business Type</p>
                    <p className="mt-0.5 wrap-break-word text-[12px] font-bold leading-5 text-text">{businessType}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderClientCard() {
    const user = submission?.user;

    return renderCard(
      <>
        {renderCardHeading("Client Information", "solar:user-rounded-bold")}

        <div>
          {renderDetailRow("solar:phone-bold", "Phone", user?.phone)}
          {renderDetailRow("solar:passport-bold", "ID / Passport", user?.id_passport_number)}
          {renderDetailRow("solar:calendar-bold", "Date of Birth", user?.date_of_birth)}
          {renderDetailRow("solar:global-bold", "Country", user?.country_of_residence)}
        </div>
        {renderWorkSummaryBlock()}
      </>,
    );
  }

  function renderDocumentsCard() {
    const documents = submission?.documents || [];

    return renderCard(
      <>
        {renderCardHeading("Documents", "solar:documents-bold")}

        {!documents.length ? (
          <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-border bg-background px-3 py-3">
            <Icon icon="solar:inbox-bold" className="size-5 shrink-0 text-text/30" />
            <p className="text-[13px] font-semibold text-text/50">No documents uploaded.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {documents.map((document) => (
              <div key={document.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-text">
                    {document.document_label || document.document_type || "Document"}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] font-semibold text-text/45">
                    {document.original_file_name || document.saved_file_name || "Uploaded file"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {document.file_url && (
                    <a
                      href={document.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-text transition hover:border-accent-1 hover:shadow-[0_0_18px_rgba(163,230,53,0.2)]"
                      aria-label="View document"
                      title="View document"
                    >
                      <Icon icon="solar:eye-bold" className="size-4.5" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDownloadDocument(document)}
                    disabled={downloadingDocumentId === document.id}
                    className="inline-flex size-9 items-center justify-center rounded-lg bg-black text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Download document"
                    title="Download document"
                  >
                    <Icon
                      icon={
                        downloadingDocumentId === document.id
                          ? "solar:refresh-bold"
                          : "material-symbols:download-rounded"
                      }
                      className="size-5"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>,
    );
  }

  function renderLeftColumn() {
    return (
      <aside className="space-y-5">
        {renderClientCard()}
        {renderDocumentsCard()}
      </aside>
    );
  }

  function renderComplianceCard() {
    const complianceItems = getComplianceItems();

    return renderCard(
      <>
        {renderCardHeading("Compliance", "solar:shield-check-bold")}

        <div className="divide-y divide-border">
          {complianceItems.map((item) => (
            <div key={item.label} className="grid gap-2 py-2.5 first:pt-0 last:pb-0 sm:grid-cols-[160px_1fr]">
              <div className="flex items-center gap-2">
                <Icon icon={item.icon} className="size-4 shrink-0 text-text/40" />
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-text/40">{item.label}</p>
              </div>

              <p className="wrap-break-word text-[13px] font-semibold leading-5 text-text sm:text-right">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </>,
    );
  }

  function renderTraderProfileColumn(items) {
    return (
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-2.5 py-3 first:pt-0 last:pb-0">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-text/45">
              <Icon icon={item.icon} className="size-4.5" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-text/35">{item.label}</p>
              <p className="mt-0.5 wrap-break-word text-[13px] font-semibold leading-5 text-text/80">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderTraderProfileCard() {
    const profileItems = getTraderProfileItems();
    const leftItems = profileItems.slice(0, 4);
    const rightItems = profileItems.slice(4, 8);

    return renderCard(
      <>
        {renderCardHeading("Trader Profile", "solar:chart-2-bold")}

        <div className="grid gap-5 lg:grid-cols-2 lg:gap-8">
          {renderTraderProfileColumn(leftItems)}
          {renderTraderProfileColumn(rightItems)}
        </div>
      </>,
    );
  }

  function renderAdditionalFinancialDetailsCard() {
    const additionalAnswers = getOtherFinancialAnswers();

    if (!additionalAnswers.length) {
      return null;
    }

    return renderCard(
      <>
        {renderCardHeading("Additional Information", "solar:clipboard-list-bold")}

        <div className="divide-y divide-border">
          {additionalAnswers.map((answer) => (
            <div key={answer.question_key} className="py-3 first:pt-0 last:pb-0">
              <p className="text-left text-[13px] font-bold leading-5 text-text/70">{answer.question_text}</p>

              <p className="mt-1.5 wrap-break-word text-left text-[13px] font-semibold leading-5 text-text">
                {answer.display_value || "N/A"}
              </p>
            </div>
          ))}
        </div>
      </>,
    );
  }

  function renderRightColumn() {
    return (
      <div className="space-y-5">
        {renderRejectionReason()}
        {showRejectBox && renderRejectBox()}
        {renderComplianceCard()}
        {renderTraderProfileCard()}
        {renderAdditionalFinancialDetailsCard()}
      </div>
    );
  }

  function renderRejectBox() {
    if (isFinalStatus()) {
      return null;
    }

    return (
      <div className="rounded-xl border border-accent-2 bg-accent-2/10 p-3.5">
        <p className="text-[13px] font-bold text-text">Reject verification</p>

        <textarea
          value={rejectionReason}
          onChange={(event) => setRejectionReason(event.target.value)}
          rows={3}
          placeholder="Rejection reason..."
          className="mt-3 w-full resize-none rounded-xl border border-border bg-card px-3 py-2.5 text-[13px] leading-5 text-text outline-none transition placeholder:text-text/35 focus:border-accent-1 focus:ring-2 focus:ring-accent-1/20"
        />

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setShowRejectBox(false);
              setRejectionReason("");
            }}
            className="w-full px-4 py-2 text-sm sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            icon={actionLoading === "reject" ? "solar:refresh-bold" : "solar:close-circle-bold"}
            onClick={handleReject}
            disabled={actionLoading === "reject"}
            className="w-full px-4 py-2 text-sm sm:w-auto"
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
      <div className="rounded-xl border border-accent-2 bg-accent-2/10 p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent-2">Rejection Reason</p>
        <p className="mt-1.5 text-[13px] leading-5 text-text">{submission.rejection_reason}</p>
      </div>
    );
  }

  function renderContent() {
    if (loading) {
      return (
        <div className="flex min-h-80 items-center justify-center">
          <Spinner />
        </div>
      );
    }

    if (!submission) {
      return (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-border bg-background p-6 text-center">
          <Icon icon="solar:document-text-bold" className="size-9 text-text/35" />
          <p className="mt-2 text-sm font-bold text-text/60">No verification details loaded.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        {renderLeftColumn()}
        {renderRightColumn()}
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      size="xxl"
      centered
      closeButton={false}
      customHeader={renderModalHeader}
      modalClass="rounded-[24px]"
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

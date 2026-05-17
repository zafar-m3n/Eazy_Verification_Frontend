import instance from "@/lib/axios";

/* ========================== */
/* Public: Verification       */
/* ========================== */

async function submitVerification(formData) {
  return await instance.apiClient.post("/verification/submit", formData, {
    headers: instance.publicHeaders(null),
  });
}

/* ========================== */
/* Admin: Auth                */
/* ========================== */

async function loginAdmin(data) {
  return await instance.apiClient.post("/admin/auth/login", data, {
    headers: instance.publicHeaders(),
  });
}

async function getAdminProfile() {
  return await instance.apiClient.get("/admin/auth/profile", {
    headers: instance.defaultHeaders(),
  });
}

/* ========================== */
/* Admin: Dashboard           */
/* ========================== */

async function getDashboardCounts() {
  return await instance.apiClient.get("/admin/dashboard/counts", {
    headers: instance.defaultHeaders(),
  });
}

/* ========================== */
/* Admin: Verifications       */
/* ========================== */

async function getVerificationSubmissions(params = {}) {
  return await instance.apiClient.get("/admin/verifications", {
    headers: instance.defaultHeaders(),
    params,
  });
}

async function getVerificationSubmissionById(id) {
  return await instance.apiClient.get(`/admin/verifications/${id}`, {
    headers: instance.defaultHeaders(),
  });
}

async function approveVerificationSubmission(id) {
  return await instance.apiClient.patch(
    `/admin/verifications/${id}/approve`,
    {},
    {
      headers: instance.defaultHeaders(),
    },
  );
}

async function rejectVerificationSubmission(id, rejectionReason) {
  return await instance.apiClient.patch(
    `/admin/verifications/${id}/reject`,
    {
      rejection_reason: rejectionReason,
    },
    {
      headers: instance.defaultHeaders(),
    },
  );
}

async function updateVerificationNotes(id, internalNotes) {
  return await instance.apiClient.patch(
    `/admin/verifications/${id}/notes`,
    {
      internal_notes: internalNotes,
    },
    {
      headers: instance.defaultHeaders(),
    },
  );
}

async function getVerificationDocumentsForDownload(id) {
  return await instance.apiClient.get(`/admin/verifications/${id}/download-documents`, {
    headers: instance.defaultHeaders(),
  });
}

async function downloadVerificationDocument(id, documentId) {
  return await instance.apiClient.get(`/admin/verifications/${id}/documents/${documentId}/download`, {
    headers: instance.defaultHeaders(),
    responseType: "blob",
  });
}

/* ========================== */
/* Export API                 */
/* ========================== */

const privateAPI = {
  submitVerification,

  loginAdmin,
  getAdminProfile,

  getDashboardCounts,

  getVerificationSubmissions,
  getVerificationSubmissionById,
  approveVerificationSubmission,
  rejectVerificationSubmission,
  updateVerificationNotes,
  getVerificationDocumentsForDownload,
  downloadVerificationDocument,
};

export default privateAPI;

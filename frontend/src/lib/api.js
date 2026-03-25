// export const API_URL =
//   import.meta.env.VITE_API_URL || "https://trust.ezirimkingdom.com.ng/api";

// export const BASE_URL =
//   import.meta.env.VITE_BASE_URL || "https://trust.ezirimkingdom.com.ng";

// import { useAuthStore } from "@/store/useAuthStore";

// function authHeaders() {
//   const token = useAuthStore.getState().token;
//   return token ? { Authorization: `Bearer ${token}` } : {};
// }

// // ─── Internal fetch wrapper ────────────────────────────────────────────────────
// async function apiFetch(path, options = {}) {
//   const res = await fetch(`${API_URL}${path}`, {
//     ...options,
//     headers: {
//       ...options.headers,
//     },
//   });

//   // Try to parse JSON regardless of status
//   let data;

//   try {
//     data = await res.json();
//   } catch {
//     data = null;
//   }

//   if (!res.ok) {
//     const message =
//       data?.message || data?.error || `Request failed (${res.status})`;

//     throw new Error(message);
//   }

//   return data;
// }

// // ─── Campaigns ────────────────────────────────────────────────────────────────

// /**
//  * GET /campaigns/index.php
//  * Returns all campaigns for public listing.
//  */
// export async function getCampaigns() {
//   const data = await apiFetch("/campaigns/list.php");
//   // API returns { status, data: [...] } or just [...]
//   return Array.isArray(data) ? data : (data?.data ?? []);
// }

// /**
//  * Update Campaign Status
//  */
// export async function updateCampaignStatus(id, status) {
//   const data = await apiFetch(`/admin/campaigns/update-status.php`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       ...authHeaders(),
//     },
//     body: JSON.stringify({ id, status }),
//   });
//   return data;
// }

// /**
//  * GET /campaigns/show.php?id=:id
//  * Returns full details of a single campaign.
//  */
// export async function getCampaignDetails(id) {
//   const data = await apiFetch(`/campaigns/show.php?id=${id}`);
//   return data?.data ?? data;
// }

// /**
//  * GET /campaigns/progress.php?id=:id
//  * Returns funding progress for a campaign.
//  * { target_amount, raised_amount, remaining_amount, percentage, is_fully_funded }
//  */
// export async function getCampaignProgress(id) {
//   const data = await apiFetch(`/campaigns/progress.php?id=${id}`);
//   return data?.data ?? data;
// }

// /**
//  * POST /campaigns/create  (requires auth, multipart/form-data)
//  * @param {FormData} formData
//  */
// export async function createCampaign(formData) {
//   const res = await fetch(`${API_URL}/campaigns/create.php`, {
//     method: "POST",
//     headers: {
//       ...authHeaders(),
//       // Do NOT set Content-Type — browser sets it with boundary for FormData
//     },
//     credentials: "include",
//     body: formData,
//   });

//   let data;
//   try {
//     data = await res.json();
//   } catch {
//     data = null;
//   }

//   if (!res.ok) {
//     throw new Error(data?.message || "Failed to create campaign");
//   }

//   return data;
// }

// /**
//  * POST /hospitals/request  (form-data with file upload)
//  * @param {FormData} formData with hospital_name, hospital_address, contact_email, license_document
//  */
// export async function requestHospitalVerification(formData) {
//   const res = await fetch(`${API_URL}/hospitals/request.php`, {
//     method: "POST",
//     headers: {
//       ...authHeaders(),
//       // Do NOT set Content-Type — browser sets it with boundary for FormData
//     },
//     credentials: "include",
//     body: formData,
//   });

//   let data;
//   try {
//     data = await res.json();
//   } catch {
//     data = null;
//   }

//   if (!res.ok) {
//     throw new Error(
//       data?.message || "Failed to submit hospital verification request",
//     );
//   }

//   return data;
// }

// // ─── Hospitals ───────────────────────────────────────────────────────────────

// /**
//  * GET /hospitals/index.php
//  * Returns list of verified hospitals
//  */
// export async function getHospitals() {
//   const data = await apiFetch("/hospitals/index.php");
//   return Array.isArray(data) ? data : (data?.data ?? []);
// }

// /**
//  * GET /admin/hospital-requests.php
//  * Returns pending hospital verification requests (admin only)
//  */
// export async function getPendingHospitalRequests() {
//   const data = await apiFetch("/admin/hospital-requests.php", {
//     headers: {
//       ...authHeaders(),
//     },
//   });
//   return Array.isArray(data) ? data : (data?.data ?? []);
// }

// /**
//  * POST /admin/hospitals/approve.php
//  * Approve a hospital request and register payment account
//  * @param {Object} payload with request_id, hospital_name, hospital_address, bank_account, bank_code
//  */
// export async function approveHospital(payload) {
//   const res = await fetch(`${API_URL}/admin/hospitals/approve.php`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       ...authHeaders(),
//     },
//     credentials: "include",
//     body: JSON.stringify(payload),
//   });

//   let data;
//   try {
//     data = await res.json();
//   } catch {
//     data = null;
//   }

//   if (!res.ok) {
//     throw new Error(data?.message || "Failed to approve hospital");
//   }

//   return data;
// }

// // ─── Donations ────────────────────────────────────────────────────────────────

// /**
//  * POST /donations/initialize.php
//  * @param {{ campaign_id, donor_name, donor_email, amount }} payload
//  */
// export async function initializeDonation(payload) {
//   // Bypass apiFetch so we can log the raw response before any unwrapping
//   const res = await fetch(`${API_URL}/donations/initialize.php`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });

//   const text = await res.text();
//   console.log("initializeDonation raw response:", text);

//   let body;
//   try {
//     body = JSON.parse(text);
//   } catch {
//     throw new Error(
//       `Payment gateway returned invalid JSON: ${text.slice(0, 200)}`,
//     );
//   }

//   console.log("initializeDonation parsed body:", body);

//   if (!res.ok) {
//     throw new Error(
//       body?.message || body?.error || `Payment request failed (${res.status})`,
//     );
//   }

//   // API envelope: { status, message, data: { ... } }
//   // Return the inner data object if present, otherwise the full body
//   const result = body?.data ?? body;
//   console.log("initializeDonation result:", result);

//   if (!result) {
//     throw new Error("Empty response from payment gateway.");
//   }

//   return result;
// }

export const API_URL =
  import.meta.env.VITE_API_URL || "https://trust.ezirimkingdom.com.ng/api";

export const BASE_URL =
  import.meta.env.VITE_BASE_URL || "https://trust.ezirimkingdom.com.ng";

import { useAuthStore } from "@/store/useAuthStore";

function authHeaders() {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Internal fetch wrapper ────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
    },
  });

  // Try to parse JSON regardless of status
  let data;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      data?.message || data?.error || `Request failed (${res.status})`;

    throw new Error(message);
  }

  return data;
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

/**
 * GET /campaigns/index.php
 * Returns all campaigns for public listing.
 */
export async function getCampaigns() {
  const data = await apiFetch("/campaigns/list.php");
  // API returns { status, data: { page, campaigns: [...] } }
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.campaigns)) return data.data.campaigns;
  return [];
}

/**
 * Update Campaign Status
 */
export async function updateCampaignStatus(id, status) {
  const data = await apiFetch(`/admin/campaigns/update-status.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ id, status }),
  });
  return data;
}

/**
 * GET /campaigns/show.php?id=:id
 * Returns full details of a single campaign.
 */
export async function getCampaignDetails(id) {
  const data = await apiFetch(`/campaigns/show.php?id=${id}`);
  return data?.data ?? data;
}

/**
 * GET /campaigns/progress.php?id=:id
 * Returns funding progress for a campaign.
 * { target_amount, raised_amount, remaining_amount, percentage, is_fully_funded }
 */
export async function getCampaignProgress(id) {
  const data = await apiFetch(`/campaigns/progress.php?id=${id}`);
  return data?.data ?? data;
}

/**
 * POST /campaigns/create  (requires auth, multipart/form-data)
 * @param {FormData} formData
 */
export async function createCampaign(formData) {
  const res = await fetch(`${API_URL}/campaigns/create.php`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      // Do NOT set Content-Type — browser sets it with boundary for FormData
    },
    credentials: "include",
    body: formData,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.message || "Failed to create campaign");
  }

  return data;
}

/**
 * POST /hospitals/request  (form-data with file upload)
 * @param {FormData} formData with hospital_name, hospital_address, contact_email, license_document
 */
export async function requestHospitalVerification(formData) {
  const res = await fetch(`${API_URL}/hospitals/request.php`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      // Do NOT set Content-Type — browser sets it with boundary for FormData
    },
    credentials: "include",
    body: formData,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(
      data?.message || "Failed to submit hospital verification request",
    );
  }

  return data;
}

// ─── Hospitals ───────────────────────────────────────────────────────────────

/**
 * GET /hospitals/index.php
 * Returns list of verified hospitals
 */
export async function getHospitals() {
  const data = await apiFetch("/hospitals/index.php");
  return Array.isArray(data) ? data : (data?.data ?? []);
}

/**
 * GET /admin/hospital-requests.php
 * Returns pending hospital verification requests (admin only)
 */
export async function getPendingHospitalRequests() {
  const data = await apiFetch("/admin/hospital-requests.php", {
    headers: {
      ...authHeaders(),
    },
  });
  return Array.isArray(data) ? data : (data?.data ?? []);
}

/**
 * POST /admin/hospitals/approve.php
 * Approve a hospital request and register payment account
 * @param {Object} payload with request_id, hospital_name, hospital_address, bank_account, bank_code
 */
export async function approveHospital(payload) {
  const res = await fetch(`${API_URL}/admin/hospitals/approve.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.message || "Failed to approve hospital");
  }

  return data;
}

// ─── Donations ────────────────────────────────────────────────────────────────

/**
 * POST /donations/initialize.php
 * @param {{ campaign_id, donor_name, donor_email, amount }} payload
 */
export async function initializeDonation(payload) {
  // Bypass apiFetch so we can log the raw response before any unwrapping
  const res = await fetch(`${API_URL}/donations/initiate.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log("initializeDonation raw response:", text);

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(
      `Payment gateway returned invalid JSON: ${text.slice(0, 200)}`,
    );
  }

  console.log("initializeDonation parsed body:", body);

  if (!res.ok) {
    throw new Error(
      body?.message || body?.error || `Payment request failed (${res.status})`,
    );
  }

  // API envelope: { status, message, data: { ... } }
  // Return the inner data object if present, otherwise the full body
  const result = body?.data ?? body;
  console.log("initializeDonation result:", result);

  if (!result) {
    throw new Error("Empty response from payment gateway.");
  }

  return result;
}
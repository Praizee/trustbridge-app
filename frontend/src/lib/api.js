export const API_URL =
  import.meta.env.VITE_API_URL || "https://trust.ezirimkingdom.com.ng/api";

export const BASE_URL =
  import.meta.env.VITE_BASE_URL || "https://trust.ezirimkingdom.com.ng";

import { useAuthStore } from "@/store/useAuthStore";

function authHeaders() {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// --- Internal fetch wrapper ---------------------------------------------------
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
    },
  });

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

// --- Campaigns ----------------------------------------------------------------

/**
 * GET /campaigns/list.php
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
 */
export async function getCampaignProgress(id) {
  const data = await apiFetch(`/campaigns/progress.php?id=${id}`);
  return data?.data ?? data;
}

/**
 * POST /campaigns/create.php  (requires auth, multipart/form-data)
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

// --- Hospitals ----------------------------------------------------------------

/**
 * POST /hospitals/request.php  (form-data with file upload)
 */
export async function requestHospitalVerification(formData) {
  const res = await fetch(`${API_URL}/hospitals/request.php`, {
    method: "POST",
    headers: {
      ...authHeaders(),
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

/**
 * GET /hospitals/index.php
 * Returns list of verified hospitals.
 */
export async function getHospitals() {
  const data = await apiFetch("/hospitals/index.php");
  return Array.isArray(data) ? data : (data?.data ?? []);
}

/**
 * GET /admin/hospital-requests.php
 * Returns pending hospital verification requests (admin only).
 */
export async function getPendingHospitalRequests() {
  const data = await apiFetch("/admin/hospital-requests.php", {
    headers: { ...authHeaders() },
  });
  return Array.isArray(data) ? data : (data?.data ?? []);
}

/**
 * POST /admin/hospitals/approve.php
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

// --- Hospital Verification ----------------------------------------------------

/**
 * POST /hospitals/verify.php
 * Verify hospital via TIN or CAC number.
 */
export async function verifyHospital(payload) {
  const data = await apiFetch("/hospitals/verify.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return data?.data ?? data;
}

/**
 * GET /hospitals/my-campaigns.php
 * Returns hospital info and its attached campaigns (requires auth).
 */
export async function getHospitalCampaigns() {
  const data = await apiFetch("/hospitals/my-campaigns.php", {
    headers: { ...authHeaders() },
  });
  return data?.data ?? data;
}

/**
 * POST /withdrawals/request.php
 * Request a withdrawal for a fully funded campaign.
 */
export async function requestWithdrawal(payload) {
  const data = await apiFetch("/withdrawals/request.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return data?.data ?? data;
}

// --- Donations ----------------------------------------------------------------

/**
 * POST /donations/initiate.php
 *
 * Request body: { campaign_id, name, email, amount }
 *
 * Response (flat — no nested .data wrapper):
 * {
 *   status: 200,
 *   message: "Donation initialized",
 *   reference: "DON_123456",
 *   amount: 5000,          <- naira; DonationWidget multiplies × 100 for Interswitch (kobo)
 *   email: "user@mail.com"
 * }
 *
 * @param {{ campaign_id: number, name: string, email: string, amount: number }} payload
 * @returns {Promise<{ reference: string, amount: number, email: string }>}
 */
export async function initializeDonation(payload) {
  const res = await fetch(`${API_URL}/donations/initiate.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let body;
  try {
    body = await res.json();
  } catch {
    throw new Error("Payment gateway returned an invalid response.");
  }

  if (!res.ok) {
    throw new Error(
      body?.message || body?.error || `Payment request failed (${res.status})`,
    );
  }

  if (!body?.reference) {
    throw new Error("No payment reference returned by server.");
  }

  // Response is flat: return body directly (reference, amount, email at top level)
  return body;
}

/**
 * GET /donations/verify.php?reference=REF&amount=AMOUNT
 *
 * Called by DonationWidget (inline onComplete) and PaymentCallback (redirect fallback).
 * Returns the full response body so callers can check body.status === 200.
 *
 * @param {string} reference  — DON_xxx / txn_ref value from Interswitch
 * @param {number} [amount]   — original amount in naira (not kobo)
 */
export async function verifyDonation(reference, amount) {
  const params = new URLSearchParams({ reference });
  if (amount != null) params.set("amount", String(amount));
  const data = await apiFetch(`/donations/verify.php?${params.toString()}`);
  return data; // return full body — caller checks data.status === 200
}
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
    headers: { ...options.headers },
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
 * API envelope: { status, data: { page, campaigns: [...] } }
 */
export async function getCampaigns() {
  const data = await apiFetch("/campaigns/list.php");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.campaigns)) return data.data.campaigns;
  return [];
}

export async function updateCampaignStatus(id, status) {
  const data = await apiFetch(`/admin/campaigns/update-status.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ id, status }),
  });
  return data;
}

export async function getCampaignDetails(id) {
  const data = await apiFetch(`/campaigns/show.php?id=${id}`);
  return data?.data ?? data;
}

export async function getCampaignProgress(id) {
  const data = await apiFetch(`/campaigns/progress.php?id=${id}`);
  return data?.data ?? data;
}

export async function createCampaign(formData) {
  const res = await fetch(`${API_URL}/campaigns/create.php`, {
    method: "POST",
    headers: { ...authHeaders() },
    credentials: "include",
    body: formData,
  });
  let data;
  try { data = await res.json(); } catch { data = null; }
  if (!res.ok) throw new Error(data?.message || "Failed to create campaign");
  return data;
}

// --- Hospitals ----------------------------------------------------------------

export async function requestHospitalVerification(formData) {
  const res = await fetch(`${API_URL}/hospitals/request.php`, {
    method: "POST",
    headers: { ...authHeaders() },
    credentials: "include",
    body: formData,
  });
  let data;
  try { data = await res.json(); } catch { data = null; }
  if (!res.ok) throw new Error(data?.message || "Failed to submit hospital verification request");
  return data;
}

export async function getHospitals() {
  const data = await apiFetch("/hospitals/index.php");
  return Array.isArray(data) ? data : (data?.data ?? []);
}

export async function getPendingHospitalRequests() {
  const data = await apiFetch("/admin/hospital-requests.php", {
    headers: { ...authHeaders() },
  });
  return Array.isArray(data) ? data : (data?.data ?? []);
}

export async function approveHospital(payload) {
  const res = await fetch(`${API_URL}/admin/hospitals/approve.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  let data;
  try { data = await res.json(); } catch { data = null; }
  if (!res.ok) throw new Error(data?.message || "Failed to approve hospital");
  return data;
}

export async function getHospitalCampaigns() {
  const data = await apiFetch("/hospitals/my-campaigns.php", {
    headers: { ...authHeaders() },
  });
  return data?.data ?? data;
}

export async function requestWithdrawal(payload) {
  const data = await apiFetch("/withdrawals/request.php", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return data?.data ?? data;
}

// --- Donations ----------------------------------------------------------------

/**
 * POST /donations/initiate.php
 *
 * Request:  { campaign_id, name, email, amount }
 *
 * Response (flat — no nested .data):
 * {
 *   status: 200,
 *   message: "Donation initialized",
 *   reference: "DON_123456",
 *   amount: 5000,          <- naira; multiply × 100 when passing to Interswitch
 *   email: "user@mail.com"
 * }
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
      body?.message || body?.error || `Payment request failed (${res.status})`
    );
  }

  if (!body?.reference) {
    throw new Error("No payment reference returned by server.");
  }

  // Return the flat body — caller uses body.reference, body.amount, body.email
  return body;
}

/**
 * GET /donations/verify.php?reference=REF&amount=AMOUNT
 *
 * @param {string} reference  — the DON_xxx / txn_ref value
 * @param {number} [amount]   — original amount in naira (not kobo)
 * @returns full response body so caller can check body.status === 200
 */
export async function verifyDonation(reference, amount) {
  const params = new URLSearchParams({ reference });
  if (amount != null) params.set("amount", String(amount));
  const data = await apiFetch(`/donations/verify.php?${params.toString()}`);
  return data; // return full body, not just data.data
}
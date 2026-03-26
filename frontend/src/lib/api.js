export const API_URL =
  import.meta.env.VITE_API_URL || "https://trust.ezirimkingdom.com.ng/api";

export const BASE_URL =
  import.meta.env.VITE_BASE_URL || "https://trust.ezirimkingdom.com.ng";

import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

// --- Internal fetch wrapper ---------------------------------------------------
async function apiFetch(path, options = {}) {
  const { token, logout } = useAuthStore.getState();

  const headers = { ...options.headers };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    // Handle Auth Errors
    if (res.status === 401 || res.status === 403) {
      logout();
      window.location.href = "/login";
      toast.error("Session expired. Please login again.");
      throw new Error("Session expired. Please login again.");
    }

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
  // We use apiFetch but rely on fetch to automatically set Content-Type for FormData
  // When body is FormData, do NOT set Content-Type header manually
  const data = await apiFetch(`/campaigns/create.php`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return data;
}

// --- Hospitals ----------------------------------------------------------------

/**
 * POST /hospitals/request.php  (form-data with file upload)
 */
export async function requestHospitalVerification(formData) {
  const data = await apiFetch(`/hospitals/request.php`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
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
  const data = await apiFetch("/admin/hospital-requests.php");
  return Array.isArray(data) ? data : (data?.data ?? []);
}

/**
 * POST /admin/hospitals/approve.php
 */
export async function approveHospital(payload) {
  const data = await apiFetch(`${API_URL}/admin/hospitals/approve.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return data;
}

// --- Donations ----------------------------------------------------------------

/**
 * POST /donations/initiate.php
 *
 * Request body: { campaign_id, name, email, amount }
 *
 * Success response shape:
 * {
 *   status: 200,
 *   message: "Payment initialized",
 *   data: {
 *     reference: "TB_1710323434_4821",
 *     gateway: "interswitch",
 *     checkout_method: "web_redirect",
 *     checkout_url: "https://newwebpay.qa.interswitchng.com/collections/w/pay",
 *     checkout_fields: {
 *       merchant_code, pay_item_id, site_redirect_url,
 *       txn_ref, amount, currency, cust_name, cust_email, pay_item_name
 *     }
 *   }
 * }
 *
 * The caller (DonationWidget) is responsible for building and
 * auto-submitting the form to checkout_url with checkout_fields.
 *
 * @param {{ campaign_id: number, name: string, email: string, amount: number }} payload
 * @returns {Promise<{ reference, checkout_url, checkout_fields, ... }>}
 */
export async function initializeDonation(payload) {
  // Initialize donation is usually public, but if we need auth in future,
  // we would need to manually add it similar to apiFetch or use apiFetch.
  // Currently kept as raw fetch to match previous implementation's specific error handling needs
  // or simple public access.
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

  const result = body?.data ?? body;

  if (!result?.payment_url) {
    throw new Error("Payment link was not returned by the server.");
  }

  return result;
}

// --- Hospital Verification ----------------------------------------------------

/**
 * POST /hospitals/verify.php
 * Verify hospital via TIN or CAC number.
 *
 * @param {{
 *   hospital_name: string,
 *   hospital_address: string,
 *   verification_method: "TIN" | "CAC",
 *   verification_value: string,
 *   bank_account: string,
 *   bank_name: string,
 *   bank_code: string
 * }} payload
 */
export async function verifyHospital(payload) {
  const data = await apiFetch("/hospitals/verify.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return data?.data ?? data;
}

/**
 * GET /hospitals/my-campaigns.php
 * Returns hospital info and its attached campaigns (requires auth).
 *
 * Response shape: { hospital: { id, name, verified }, campaigns: [...] }
 */
export async function getHospitalCampaigns() {
  const data = await apiFetch("/hospitals/my-campaigns.php");
  return data?.data ?? data;
}

/**
 * POST /withdrawals/request.php
 * Request a withdrawal for a fully funded campaign.
 *
 * @param {{ campaign_id: number, amount: number }} payload
 */
export async function requestWithdrawal(payload) {
  const data = await apiFetch("/withdrawals/request.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return data?.data ?? data;
}

/**
 * GET /donations/verify.php?reference=:ref
 *
 * Called on /payment/callback after Interswitch redirects back.
 * The txn_ref from the callback URL query param is passed as reference.
 *
 * @param {string} reference
 */
export async function verifyDonation(reference) {
  const data = await apiFetch(
    `/donations/verify.php?reference=${encodeURIComponent(reference)}`,
  );
  return data?.data ?? data;
}


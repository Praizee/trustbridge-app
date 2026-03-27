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
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.campaigns)) return data.data.campaigns;
  return [];
}

/**
 * GET /campaign/my-campaigns.php
 * Returns campaigns for the logged-in creator.
 */
export async function getMyCampaigns() {
  const data = await apiFetch("/campaigns/my-campaigns.php");
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
 * DELETE Campaign (Creator)
 */
export async function deleteCampaignCreator(campaign_id) {
  const data = await apiFetch(`/campaign/delete.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ campaign_id }),
  });
  return data;
}

/**
 * DELETE Campaign (Admin)
 */
export async function deleteCampaignAdmin(campaign_id) {
  const data = await apiFetch(`/admin/campaigns/delete.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ campaign_id }),
  });
  return data;
}

/**
 * GET /campaigns/my-campaign-details.php?id=:id
 * Returns details for a creator's own campaign
 */
export async function getMyCampaignDetails(id) {
  const data = await apiFetch(`/campaigns/my-campaign-details.php?id=${id}`);
  return data?.data ?? data;
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
 * GET /campaigns/latest-funded.php
 * Returns the latest funded campaign.
 */
export async function getLatestFundedCampaign() {
  const data = await apiFetch(`/campaigns/latest-funded.php`);
  return data?.data ?? data;
}

// --- Auth (Forgot/Reset Password) ---------------------------------------------
export async function forgotPassword(email) {
  const data = await apiFetch(`/auth/forgot-password.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
  return data;
}

export async function resetPassword(token, password) {
  const data = await apiFetch(`/auth/reset-password.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, password }),
  });
  return data;
}

/**
 * POST /campaigns/create.php  (requires auth, multipart/form-data)
 * @param {FormData} formData
 */
export async function createCampaign(formData) {
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
 *
 * Payload:
 * {
 *   request_id: number,
 *   hospital_name: string,
 *   hospital_address: string,
 *   bank_account: string,
 *   bank_name: string,
 *   bank_code: string
 * }
 */
export async function approveHospital(payload) {
  // const data = await apiFetch(`/admin/hospitals/approve.php`, {
  const data = await apiFetch(`/hospitals/verify.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  console.log(data)
  return data;
}

/**
 * GET /hospitals/my-campaigns.php
 * Returns hospital info and its attached campaigns (requires auth).
 */
export async function getHospitalCampaigns() {
  const data = await apiFetch("/hospitals/my-campaigns.php");
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
 *   amount: 5000,
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
      body?.message || body?.error || `Payment request failed (${res.status})`,
    );
  }

  if (!body?.reference) {
    throw new Error("No payment reference returned by server.");
  }

  return body;
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
 * GET /donations/verify.php?reference=:ref&amount=:amount
 *
 * @param {string} reference
 * @param {number} [amount]
 */
export async function verifyDonation(reference, amount) {
  const params = new URLSearchParams({ reference });
  if (amount != null) params.set("amount", String(amount));
  const data = await apiFetch(`/donations/verify.php?${params.toString()}`);
  return data;
}

/**
 * GET /donations/get_campaign_donations.php?campaign_id=:id
 * Returns list of donors for a campaign.
 *
 * @param {number|string} campaignId
 */
export async function getCampaignDonations(campaignId) {
  const data = await apiFetch(
    `/donations/get_campaign_donations.php?campaign_id=${campaignId}`,
  );
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.donations)) return data.donations;
  return [];
}

// --- Admin: Dashboard ---------------------------------------------------------

/**
 * GET /admin/dashboard.php
 * Returns platform-wide stats (users, hospitals, campaigns, donations).
 */
export async function getAdminDashboardStats() {
  const data = await apiFetch("/admin/dashboard.php");
  return data?.data ?? data;
}

// --- Admin: Users -------------------------------------------------------------

/**
 * GET /admin/users/index.php?page=:page&limit=:limit&search=:search
 */
export async function getAllUsers({ page = 1, limit = 20, search = "" } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set("search", search);
  const data = await apiFetch(`/admin/users/index.php?${params.toString()}`);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

/**
 * GET /admin/users/show.php?id=:id
 */
export async function showUser(id) {
  const data = await apiFetch(`/admin/users/show.php?id=${id}`);
  return data?.data ?? data;
}

/**
 * POST /admin/users/activate.php  { user_id }
 */
export async function activateUser(user_id) {
  return apiFetch("/admin/users/activate.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id }),
  });
}

/**
 * POST /admin/users/suspend.php  { user_id }
 */
export async function suspendUser(user_id) {
  return apiFetch("/admin/users/suspend.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id }),
  });
}

/**
 * POST /admin/users/delete.php  { user_id }
 */
export async function deleteUser(user_id) {
  return apiFetch("/admin/users/delete.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id }),
  });
}

// --- Admin: Hospitals ---------------------------------------------------------

/**
 * GET /admin/hospitals/index.php?verified=:filter
 * @param {0|1|null} verified  — null = all, 1 = verified, 0 = unverified
 */
export async function getAllHospitals(verified = null) {
  const params = new URLSearchParams();
  if (verified !== null) params.set("verified", String(verified));
  const qs = params.toString();
  const data = await apiFetch(
    `/admin/hospitals/index.php${qs ? `?${qs}` : ""}`,
  );
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

/**
 * GET /admin/hospitals/show.php?id=:id
 */
export async function showHospital(id) {
  const data = await apiFetch(`/admin/hospitals/show.php?id=${id}`);
  return data?.data ?? data;
}

/**
 * POST /admin/hospitals/verify.php  { hospital_id }
 * Super-admin manually marks a hospital as verified (verified = 1).
 */
export async function verifyHospitalAdmin(hospital_id) {
  return apiFetch("/admin/hospitals/verify.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hospital_id }),
  });
}

/**
 * POST /admin/hospitals/disable.php  { hospital_id }
 */
export async function disableHospital(hospital_id) {
  return apiFetch("/admin/hospitals/disable.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hospital_id }),
  });
}

// --- Admin: Withdrawals -------------------------------------------------------

/**
 * GET /admin/withdrawals/pending.php
 * Returns all pending withdrawal requests.
 */
export async function getPendingWithdrawals() {
  const data = await apiFetch("/admin/withdrawals/pending.php");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

/**
 * POST /admin/withdrawals/approve.php  { withdrawal_id }
 */
export async function approveWithdrawal(withdrawal_id) {
  return apiFetch("/admin/withdrawals/approve.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ withdrawal_id }),
  });
}
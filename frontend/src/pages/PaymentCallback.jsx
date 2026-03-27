import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // loading | success | failed | error
  const [txnData, setTxnData] = useState(null);

  // GET PARAMS FROM BACKEND REDIRECT
  const reference = searchParams.get("txn_ref");
  const amountParam = searchParams.get("amount");
  const campaignIdParam = searchParams.get("campaign_id");
  const verified = searchParams.get("verified");

  useEffect(() => {
    // No reference → invalid request
    if (!reference) {
      setStatus("error");
      return;
    }

    // SUCCESS
    if (verified === "1") {
      setStatus("success");
      setTxnData({
        reference,
        amount: amountParam,
        campaign_id: campaignIdParam,
      });
      return;
    }

    // FAILED
    if (verified === "0") {
      setStatus("failed");
      setTxnData({
        reference,
        amount: amountParam,
        campaign_id: campaignIdParam,
      });
      return;
    }

    // FALLBACK (shouldn't happen normally)
    setStatus("error");
  }, [reference, verified, amountParam, campaignIdParam]);

  const formatCurrency = (value) => {
    if (!value) return "₦0";
    return `₦${Number(value).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        
        {/* LOADING */}
        {status === "loading" && (
          <>
            <h2 className="text-xl font-semibold mb-2">Verifying Payment...</h2>
            <p className="text-gray-500">Please wait...</p>
          </>
        )}

        {/* SUCCESS */}
        {status === "success" && (
          <>
            <div className="text-green-600 text-5xl mb-4">✔</div>
            <h2 className="text-2xl font-bold mb-2">Payment Successful</h2>
            <p className="text-gray-600 mb-4">
              Thank you for your donation ❤️
            </p>

            <div className="bg-gray-100 p-4 rounded-lg text-left text-sm">
              <p><strong>Reference:</strong> {txnData?.reference}</p>
              <p><strong>Amount:</strong> {formatCurrency(txnData?.amount)}</p>
              {txnData?.campaign_id && (
                <p><strong>Campaign ID:</strong> {txnData?.campaign_id}</p>
              )}
            </div>

            <button
              onClick={() => navigate("/")}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Go Home
            </button>
          </>
        )}

        {/* FAILED */}
        {status === "failed" && (
          <>
            <div className="text-red-600 text-5xl mb-4">✖</div>
            <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-4">
              Something went wrong with your payment.
            </p>

            <div className="bg-gray-100 p-4 rounded-lg text-left text-sm">
              <p><strong>Reference:</strong> {txnData?.reference}</p>
            </div>

            <button
              onClick={() => navigate("/")}
              className="mt-6 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </>
        )}

        {/* ERROR */}
        {status === "error" && (
          <>
            <div className="text-yellow-600 text-5xl mb-4">⚠</div>
            <h2 className="text-2xl font-bold mb-2">Invalid Transaction</h2>
            <p className="text-gray-600 mb-4">
              We could not verify this payment.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-6 w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-black transition"
            >
              Go Home
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
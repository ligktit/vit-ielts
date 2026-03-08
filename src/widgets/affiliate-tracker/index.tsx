"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

const AFFILIATE_COOKIE_NAME = "affiliate_ref";
const AFFILIATE_COOKIE_EXPIRY_DAYS = 60;

const AffiliateTracker = () => {
  const router = useRouter();
  const { ref } = router.query;

  useEffect(() => {
    if (ref && typeof ref === "string") {
      // Save affiliate ref to cookie
      Cookies.set(AFFILIATE_COOKIE_NAME, ref, {
        expires: AFFILIATE_COOKIE_EXPIRY_DAYS,
        path: "/",
      });

      // Record visit
      recordVisit(ref);
    }
  }, [ref]);

  const recordVisit = async (affiliateCode: string) => {
    try {
      // Resolve affiliate code to affiliateId
      const resolveRes = await fetch(`/api/affiliate/resolve?code=${affiliateCode}`);
      const resolveData = await resolveRes.json();

      if (resolveData.success && resolveData.affiliateId && resolveData.linkId) {
        // Record the visit
        await fetch("/api/affiliate/visits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            affiliateId: resolveData.affiliateId,
            linkId: resolveData.linkId,
            ipAddress: undefined, // Will be handled server-side
            userAgent: navigator.userAgent,
            referer: document.referrer,
          }),
        });
      }
    } catch (error) {
      console.error("Error recording affiliate visit:", error);
    }
  };

  return null; // This component doesn't render anything
};

export default AffiliateTracker;


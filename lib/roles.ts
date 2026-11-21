import { useEffect, useState } from "react";
import { ENDPOINTS } from "../constants/api";
import { getToken } from "./auth";

// 1 Student, 2 Operational Admin, 3 Dean, 4 Chairperson, 5 Staff, 6 Faculty
// Operational Admin, Dean, Chairperson, Staff may edit (the server decides WHICH procedures).
// Faculty and Students are view-only.
export const canEditProcedures = (r?: number) => r === 2 || r === 3 || r === 4 || r === 5;
export const canManageAccounts = (r?: number) => r === 2 || r === 3 || r === 4;
// Update tracked requests: Dean, Chairperson, Staff, Faculty (not Operational Admin)
export const canScan = (r?: number) => !!r && r >= 3;
export const hasOversight = (r?: number) => r === 2 || r === 3;

// Reads the real role from the server, so it survives a page refresh.
export function useMe() {
  const [me, setMe] = useState<any>(null);
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(ENDPOINTS.me, {
          headers: { Authorization: `Token ${token}` },
        });
        if (res.ok) setMe(await res.json());
      } catch {}
    })();
  }, []);
  return me;
}
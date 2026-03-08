import { getMasterData } from "~supabase/getMasterData";

/**
 * SSR wrapper — loads master data from Supabase.
 * Drop-in replacement for the legacy Apollo-based withMasterData.
 *
 * @see lib/supabase/getMasterData.ts for the actual implementation
 */
export const withMasterData = getMasterData;

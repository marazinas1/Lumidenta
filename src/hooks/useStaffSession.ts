import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

/**
 * Client-side check for "somebody is signed in". Used to let staff keep
 * browsing the real site while maintenance mode is on for visitors.
 * Returns null until the session has been read.
 */
export function useSignedIn(): boolean | null {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setSignedIn(Boolean(session));
    });
    void supabase.auth.getSession().then(({ data: s }) => {
      if (active) setSignedIn(Boolean(s.session));
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return signedIn;
}

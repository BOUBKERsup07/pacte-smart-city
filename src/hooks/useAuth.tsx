import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "observateur" | "operateur" | "gestionnaire" | "administrateur";

/**
 * Hook d'authentification NadhafaTech.
 * Gère la session JWT Supabase et récupère le rôle métier.
 */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 0. CHECK DEMO SESSION (LocalStorage)
    const demoSession = localStorage.getItem("nadhafa_demo_session");
    if (demoSession) {
      try {
        const { user: demoUser, role: demoRole } = JSON.parse(demoSession);
        setUser(demoUser);
        setRole(demoRole);
        setLoading(false);
        return; // Priorité au mode démo pour le moment
      } catch (e) {
        localStorage.removeItem("nadhafa_demo_session");
      }
    }

    // 1. Listener AVANT getSession (règle Lovable Cloud)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        // defer pour éviter les deadlocks
        setTimeout(() => fetchRole(sess.user.id), 0);
      } else {
        setRole(null);
      }
    });

    // 2. Récupération session existante
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) fetchRole(sess.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    setRole((data?.role as AppRole) ?? null);
  };

  const signOut = async () => {
    localStorage.removeItem("nadhafa_demo_session");
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  return { session, user, role, loading, signOut };
}

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type Ctx = {
  session: Session | null;
  ready: boolean;
  onboarded: boolean;
  finishOnboarding: () => Promise<void>;
};

const AuthCtx = createContext<Ctx>(null as unknown as Ctx);
const KEY = "onboarded";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data }, flag] = await Promise.all([
        supabase.auth.getSession(),
        AsyncStorage.getItem(KEY),
      ]);
      setSession(data.session);
      setOnboarded(flag === "1");
      setReady(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) =>
      setSession(s),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const finishOnboarding = async () => {
    await AsyncStorage.setItem(KEY, "1");
    setOnboarded(true);
  };

  return (
    <AuthCtx.Provider value={{ session, ready, onboarded, finishOnboarding }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);

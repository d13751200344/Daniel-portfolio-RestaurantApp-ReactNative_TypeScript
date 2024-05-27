import {
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
  useContext,
} from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthContext = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContext>({
  session: null,
  loading: true,
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  /* only run callback (first parameter) when the component mounts because of "[]", but 
      supabase.auth.onAuthStateChange(...) will keep tracking user's state */
  useEffect(() => {
    const fetchSession = async () => {
      // access the session from the supabase client.
      const { data } = await supabase.auth.getSession();
      // set the session in the State.
      setSession(data.session);
      setLoading(false);
    };

    fetchSession();

    // update the session so that the app will update when user's state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    // Provide the session to the rest of the app.
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};

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
  profile: any;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContext>({
  session: null,
  loading: true,
  profile: null,
  isAdmin: false,
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  /* only run callback (first parameter) when the component mounts because of "[]", but 
      supabase.auth.onAuthStateChange(...) will keep tracking user's state */
  useEffect(() => {
    const fetchSession = async () => {
      // access the session from the supabase client.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // set the session in the State.
      setSession(session);

      // fetch profile table within supabase if session is not null.
      if (session) {
        // fetch profile
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile: ", error);
        } else {
          setProfile(data || null);
        }
      }
      setLoading(false);
    };

    fetchSession();

    // update the session so that the app will update when user's state changes
    /*
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    */
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (error) {
          console.error("Error fetching profile: ", error);
        } else {
          setProfile(data || null);
        }
      } else {
        setProfile(null);
      }
      setSession(session);
    });
  }, []);

  const isAdmin = profile?.group.toString() === "ADMIN";

  return (
    // Provide the session to the rest of the app.
    <AuthContext.Provider
      value={{
        session,
        loading,
        profile,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};

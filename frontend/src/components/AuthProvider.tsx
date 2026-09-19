import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import axios from "axios";
import backend from "../../backend";
import { useNavigate, useLocation } from "react-router-dom";
import type { AuthContextValue } from "@/types";

/**
 * AuthProvider wraps the entire tree in main.tsx, so consumers always receive a
 * real value. The empty default exists only to keep the context non-nullable,
 * which spares every consumer a null check that could never fire.
 */
export const Authcontext = createContext<AuthContextValue>(
  {} as AuthContextValue
);

/** Preferred accessor -- same value as useContext(Authcontext), already typed. */
export function useAuth(): AuthContextValue {
  return useContext(Authcontext);
}

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [roll, setRoll] = useState("");
  const [id, setId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      const publicRoutes = ["/", "/login", "/create"];
      const currentPath = location.pathname;

      if (!token) {
        setIsLoading(false);
        if (!publicRoutes.includes(currentPath)) {
          navigate("/login");
        }
        return;
      }

      try {
        const res = await axios.get(`${backend}/user/details`, {
          headers: {
            Authorization: token,
          },
        });
        setName(res.data.name);
        setEmail(res.data.email);
        setType(res.data.type);
        setRoll(res.data.roll);
        setId(res.data.id);
      } catch (err) {
        console.error("Error fetching user data:", err);
        localStorage.removeItem("token");
        if (!publicRoutes.includes(currentPath)) {
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [token, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--surface)]">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <Authcontext.Provider
      value={{
        name,
        email,
        type,
        roll,
        id,
        setName,
        setEmail,
        setType,
        setRoll,
        setId,
      }}
    >
      {children}
    </Authcontext.Provider>
  );
};

export default AuthProvider;

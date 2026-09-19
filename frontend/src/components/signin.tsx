import { useState } from "react";
import { Eye, EyeOff, Loader2, Mail, Lock, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import backend from "../../backend.js";
import { toast } from "sonner";
import ThemeToggle from "./ThemeToggle";

export default function Signin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!email.includes("@")) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleLogin(e) {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${backend}/user/signin`, {
        email: email.trim(),
        password,
      });

      if (res.data.token) {
        localStorage.setItem("token", `Bearer ${res.data.token}`);
        toast.success("Login successful!");
        navigate("/home");
      } else {
        throw new Error("No token received");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);

      if (typeof errorMessage === "string") {
        if (errorMessage.toLowerCase().includes("email")) {
          setEmail("");
        }
        if (errorMessage.toLowerCase().includes("password")) {
          setPassword("");
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-[var(--border-subtle)] bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Terminal className="w-5 h-5 text-emerald-500" />
            <span className="font-mono font-bold text-base text-[var(--text-primary)]">CodeCollab</span>
          </Link>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Link to="/create">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex">
        {/* Left branding panel */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-clip">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-violet-500/10" />
          <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-emerald-500/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-violet-500/8 rounded-full blur-[100px]" />

          <div className="relative z-10 max-w-md px-8 space-y-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <span className="font-mono font-bold text-2xl text-[var(--text-primary)]">CodeCollab</span>
            </div>

            <h2 className="text-3xl font-bold text-[var(--text-primary)] leading-snug">
              Welcome back to your <span className="gradient-text">coding workspace</span>
            </h2>

            <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
              Pick up right where you left off. Your projects, classrooms, and collaborators are waiting.
            </p>

            {/* Floating code snippets */}
            <div className="space-y-3">
              <div className="glass rounded-lg p-3 font-mono text-sm animate-float" style={{ animationDelay: '0s' }}>
                <span className="text-violet-400">const</span>{" "}
                <span className="text-[var(--text-primary)]">session</span>{" "}
                <span className="text-emerald-400">=</span>{" "}
                <span className="text-amber-400">await</span>{" "}
                <span className="text-cyan-400">login</span>
                <span className="text-[var(--text-secondary)]">(credentials);</span>
              </div>
              <div className="glass rounded-lg p-3 font-mono text-sm animate-float ml-8" style={{ animationDelay: '1s' }}>
                <span className="text-emerald-400">// Connected to 3 classrooms</span>
              </div>
              <div className="glass rounded-lg p-3 font-mono text-sm animate-float ml-4" style={{ animationDelay: '2s' }}>
                <span className="text-violet-400">return</span>{" "}
                <span className="text-cyan-400">dashboard</span>
                <span className="text-[var(--text-secondary)]">.render();</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <Card className="w-full max-w-md card-surface backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-1 pb-6">
              {/* Mobile logo */}
              <div className="flex items-center space-x-2 mb-4 lg:hidden">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-white" />
                </div>
                <span className="font-mono font-bold text-lg text-[var(--text-primary)]">CodeCollab</span>
              </div>
              <CardTitle className="text-2xl font-bold text-[var(--text-primary)]">
                Sign In
              </CardTitle>
              <CardDescription className="text-[var(--text-muted)]">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-[var(--text-secondary)]">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <Input
                      id="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors({ ...errors, email: "" });
                      }}
                      type="email"
                      placeholder="Enter your email"
                      className={`pl-10 input-dark h-11 ${errors.email ? "border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]" : ""}`}
                      disabled={isLoading}
                      required
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-400 mt-1">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-[var(--text-secondary)]">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <Input
                      id="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors({ ...errors, password: "" });
                      }}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className={`pl-10 pr-10 input-dark h-11 ${
                        errors.password ? "border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]" : ""
                      }`}
                      disabled={isLoading}
                      required
                      minLength={6}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-400 mt-1">{errors.password}</p>
                  )}
                </div>
                <Button type="submit" className="w-full btn-gradient font-semibold h-11" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-3">
                <Link
                  to="/forgot-password"
                  className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
                >
                  Forgot password?
                </Link>
                <p className="text-sm text-[var(--text-muted)]">
                  Don&apos;t have an account?{" "}
                  <Link to="/create" className="text-emerald-500 hover:text-emerald-400 transition-colors font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

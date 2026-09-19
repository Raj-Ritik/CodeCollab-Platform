"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  User,
  Hash,
  UserCheck,
  Lock,
  Loader2,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import backend from "../../backend.js";
import { toast } from "sonner";
import ThemeToggle from "./ThemeToggle";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email) {
      toast.error("Please enter your email");
      return false;
    }
    if (!name) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!type) {
      toast.error("Please select a user type");
      return false;
    }
    if (type === "STUDENT" && !roll) {
      toast.error("Please enter your roll number");
      return false;
    }
    if (!password) {
      toast.error("Please enter a password");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return false;
    }
    return true;
  };

  async function handleSignup(e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${backend}/user/create`, {
        email: email.trim(),
        name: name.trim(),
        type,
        password,
        roll: roll.trim(),
      });

      if (res.data.token) {
        localStorage.setItem("token", `Bearer ${res.data.token}`);
        toast.success("Account created successfully!");
        navigate("/home", { replace: true });
      } else {
        throw new Error("No token received");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Signup failed. Please try again.";
      toast.error(errorMessage);
      if (errorMessage.includes("email")) {
        setEmail("");
      }
      if (errorMessage.includes("password")) {
        setPassword("");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleTypeChange = (value) => {
    setType(value);
    if (value === "TEACHER") {
      setRoll("");
    }
  };

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
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex">
        {/* Left branding panel */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-clip">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-emerald-500/10" />
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-violet-500/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-emerald-500/8 rounded-full blur-[100px]" />

          <div className="relative z-10 max-w-md px-8 space-y-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <span className="font-mono font-bold text-2xl text-[var(--text-primary)]">CodeCollab</span>
            </div>

            <h2 className="text-3xl font-bold text-[var(--text-primary)] leading-snug">
              Join the <span className="gradient-text">collaborative coding</span> revolution
            </h2>

            <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
              Create your account and start coding with your classmates in real-time. Teachers and students welcome.
            </p>

            {/* Floating code snippets */}
            <div className="space-y-3">
              <div className="glass rounded-lg p-3 font-mono text-sm animate-float" style={{ animationDelay: '0s' }}>
                <span className="text-violet-400">class</span>{" "}
                <span className="text-cyan-400">Developer</span>{" "}
                <span className="text-[var(--text-secondary)]">{"{"}</span>
              </div>
              <div className="glass rounded-lg p-3 font-mono text-sm animate-float ml-8" style={{ animationDelay: '1.2s' }}>
                <span className="text-[var(--text-secondary)]">  skills: </span>
                <span className="text-emerald-400">["collab", "code"]</span>
              </div>
              <div className="glass rounded-lg p-3 font-mono text-sm animate-float ml-4" style={{ animationDelay: '0.6s' }}>
                <span className="text-[var(--text-secondary)]">{"}"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <Card className="w-full max-w-md card-surface backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-1 pb-4">
              {/* Mobile logo */}
              <div className="flex items-center space-x-2 mb-4 lg:hidden">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-white" />
                </div>
                <span className="font-mono font-bold text-lg text-[var(--text-primary)]">CodeCollab</span>
              </div>
              <CardTitle className="text-2xl font-bold text-[var(--text-primary)]">
                Create Account
              </CardTitle>
              <CardDescription className="text-[var(--text-muted)]">
                Join our learning platform and start your journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-[var(--text-secondary)]">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <Input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 input-dark h-11"
                      disabled={isLoading}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-[var(--text-secondary)]">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10 input-dark h-11"
                      disabled={isLoading}
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium text-[var(--text-secondary)]">
                    User Type
                  </label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)] z-10" />
                    <Select
                      value={type}
                      onValueChange={handleTypeChange}
                      disabled={isLoading}
                      required
                    >
                      <SelectTrigger className="w-full pl-10 input-dark h-11 [&>span]:text-[var(--text-muted)] data-[state=open]:border-emerald-500/50">
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent className="dialog-surface">
                        <SelectItem value="STUDENT" className="text-[var(--text-primary)] focus:bg-emerald-500/10 focus:text-[var(--text-primary)]">Student</SelectItem>
                        <SelectItem value="TEACHER" className="text-[var(--text-primary)] focus:bg-emerald-500/10 focus:text-[var(--text-primary)]">Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {type === "STUDENT" && (
                  <div className="space-y-2 animate-slideUp" style={{ animationDuration: '0.3s' }}>
                    <label htmlFor="roll" className="text-sm font-medium text-[var(--text-secondary)]">
                      Roll Number
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                      <Input
                        id="roll"
                        value={roll}
                        onChange={(e) => setRoll(e.target.value)}
                        type="text"
                        placeholder="Enter your roll number"
                        className="pl-10 input-dark h-11"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-[var(--text-secondary)]">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <Input
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="pl-10 pr-10 input-dark h-11"
                      disabled={isLoading}
                      required
                      minLength={6}
                      autoComplete="new-password"
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
                </div>

                <Button type="submit" className="w-full btn-gradient font-semibold h-11" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm text-[var(--text-muted)]">
                By signing up, you agree to our{" "}
                <Link to="/terms" className="text-emerald-500 hover:text-emerald-400 transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-emerald-500 hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </div>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[var(--border-subtle)]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[var(--surface-raised)] px-2 text-[var(--text-muted)]">
                      Already have an account?
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors font-medium"
                >
                  Sign in to your account
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

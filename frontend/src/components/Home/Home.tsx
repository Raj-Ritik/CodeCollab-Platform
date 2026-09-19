import { useState } from "react";
import ClassroomsContent from "./ClassRoom";
import { BookOpen, Users, UserCircle, LogOut, Loader2, Terminal, Menu, X } from "lucide-react";
import { useContext } from "react";
import { Authcontext } from "../AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import ProfileContent from "../Home/profile";
import RequestsContent from "./request";
import { toast } from "sonner";
import ThemeToggle from "../ThemeToggle";

export default function Home() {
  const [activeTab, setActiveTab] = useState("classrooms");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const value = useContext(Authcontext);
  const navigate = useNavigate();

  async function logout() {
    try {
      setIsLoggingOut(true);
      localStorage.removeItem("token");
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout");
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (!value.name) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--surface)]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const navItems = [
    { id: "profile", label: "Profile", icon: UserCircle },
    { id: "classrooms", label: "Home", icon: Users },
  ];

  if (value && value.type !== "STUDENT") {
    navItems.push({ id: "request", label: "Requests", icon: BookOpen });
  }

  return (
    <div className="flex h-screen bg-[var(--surface)]">
      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 sidebar-bg border-r border-[var(--border-subtle)] flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 space-y-8">
          {/* Logo + Close button */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Terminal className="w-5 h-5 text-emerald-500" />
              <h1 className="font-mono font-bold text-base text-[var(--text-primary)]">CodeCollab</h1>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                  activeTab === item.id
                    ? "sidebar-active text-[var(--text-primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] sidebar-hover"
                }`}
              >
                {activeTab === item.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-500 rounded-r-full" />
                )}
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                  activeTab === item.id ? "text-emerald-500" : ""
                }`} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* User info + Theme + Logout */}
        <div className="p-6 space-y-3 border-t border-[var(--border-subtle)]">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-[var(--border-subtle)] flex items-center justify-center">
              <span className="text-sm font-semibold text-emerald-500">{value.name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{value.name}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">{value.type === "TEACHER" ? "Teacher" : "Student"}</p>
            </div>
            <ThemeToggle />
          </div>

          <button
            onClick={logout}
            disabled={isLoggingOut}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isLoggingOut
                ? "text-[var(--text-muted)] cursor-not-allowed"
                : "text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/[0.06]"
            }`}
          >
            {isLoggingOut ? (
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            ) : (
              <LogOut className="w-5 h-5 mr-3" />
            )}
            <span className="font-medium text-sm">
              {isLoggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-[var(--surface)] dot-pattern">
        {/* Mobile header with hamburger */}
        <div className="md:hidden flex items-center p-4 border-b border-[var(--border-subtle)] sidebar-bg">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 ml-3">
            <Terminal className="w-4 h-4 text-emerald-500" />
            <span className="font-mono font-bold text-sm text-[var(--text-primary)]">CodeCollab</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {activeTab === "classrooms" && <ClassroomsContent />}
          {activeTab === "profile" && <ProfileContent />}
          {activeTab === "request" && <RequestsContent />}
        </div>
      </main>
    </div>
  );
}

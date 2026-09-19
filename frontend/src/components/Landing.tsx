import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Code2,
  Users,
  BookOpen,
  Play,
  Terminal,
  ArrowRight,
  MessageSquare,
  Loader2,
  User,
  Hash,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ThemeToggle from "./ThemeToggle";
import axios from "axios";
import backend from "../../backend.js";
import { toast } from "sonner";

const GUEST_ACCOUNTS = {
  STUDENT: {
    email: "guest.student@codecollab.app",
    password: "guest_student_2026",
    name: "Guest Student",
    roll: "GUEST-001",
    type: "STUDENT",
  },
  TEACHER: {
    email: "guest.teacher@codecollab.app",
    password: "guest_teacher_2026",
    name: "Guest Teacher",
    roll: "",
    type: "TEACHER",
  },
};

export default function Landing() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);
  const [guestType, setGuestType] = useState("STUDENT");
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  function handleGetStarted() {
    if (token) {
      navigate("/home");
    } else {
      setGuestType("STUDENT");
      setIsGuestDialogOpen(true);
    }
  }

  async function handleGuestAccess() {
    setIsGuestLoading(true);
    const guest = GUEST_ACCOUNTS[guestType];

    try {
      // Try signing in first (account already exists)
      const res = await axios.post(`${backend}/user/signin`, {
        email: guest.email,
        password: guest.password,
      });

      if (res.data.token) {
        localStorage.setItem("token", `Bearer ${res.data.token}`);
        toast.success(`Welcome back, ${guest.name}!`);
        setIsGuestDialogOpen(false);
        navigate("/home");
        return;
      }
    } catch {
      // Account doesn't exist yet — create it
    }

    try {
      const res = await axios.post(`${backend}/user/create`, {
        email: guest.email,
        name: guest.name,
        type: guest.type,
        password: guest.password,
        roll: guest.roll,
      });

      if (res.data.token) {
        localStorage.setItem("token", `Bearer ${res.data.token}`);
        toast.success(`Welcome, ${guest.name}!`);
        setIsGuestDialogOpen(false);
        navigate("/home");
      } else {
        throw new Error("No token received");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to access guest account. Please try signing up instead.";
      toast.error(errorMessage);
    } finally {
      setIsGuestLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)]">
      {/* ===== NAV ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--surface)]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Terminal className="w-5 h-5 text-emerald-500" />
            <span className="font-mono font-bold text-sm sm:text-base">CodeCollab</span>
          </Link>
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs sm:text-sm px-2 sm:px-3">
                Log in
              </Button>
            </Link>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm px-3 sm:px-4" onClick={handleGetStarted}>
              {token ? "Dashboard" : "Sign up"}
            </Button>
          </div>
        </div>
      </nav>

      {/* ===== HERO — Left text, Right mockup ===== */}
      <section className="pt-20 sm:pt-28 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Left */}
          <div className="space-y-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.12] tracking-tight">
              CodeCollab makes live coding seamless
            </h1>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2.5">
              {[
                { label: "Familiar IDE based on VS Code", color: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" },
                { label: "Real-time collaboration on code", color: "bg-violet-500/10 text-violet-500 border border-violet-500/20" },
                { label: "Multi-language support", color: "bg-amber-500/10 text-amber-500 border border-amber-500/20" },
                { label: "Classroom management", color: "bg-sky-500/10 text-sky-500 border border-sky-500/20" },
                { label: "Instant code execution", color: "bg-rose-500/10 text-rose-500 border border-rose-500/20" },
                { label: "Built-in chat", color: "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20" },
              ].map((pill) => (
                <span key={pill.label} className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${pill.color}`}>
                  {pill.label}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-12 px-7" onClick={handleGetStarted}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-7 border-[var(--border-medium)] text-[var(--text-primary)]" onClick={handleGetStarted}>
                Join as Guest
              </Button>
            </div>
          </div>

          {/* Right — Product screenshot mockup */}
          <div className="relative">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] overflow-hidden shadow-lg">
              {/* Window chrome */}
              <div className="flex items-center px-4 h-9 border-b border-[var(--border-subtle)]">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <span className="text-xs text-[var(--text-muted)] font-mono mx-auto">CodeCollab</span>
              </div>

              {/* Mock IDE content */}
              <div className="flex min-h-[220px] sm:min-h-[320px]">
                {/* Sidebar */}
                <div className="w-44 border-r border-[var(--border-subtle)] p-3 space-y-3 hidden sm:block">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-2">Classrooms</div>
                  {["CS 101", "Web Dev", "Algorithms"].map((name, i) => (
                    <div key={name} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${i === 0 ? "bg-emerald-500/10 text-emerald-500" : "text-[var(--text-secondary)]"}`}>
                      <BookOpen className="w-3 h-3" />
                      {name}
                    </div>
                  ))}
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mt-4 mb-2">Projects</div>
                  {["main.js", "solver.py"].map((name) => (
                    <div key={name} className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-[var(--text-secondary)]">
                      <Code2 className="w-3 h-3" />
                      {name}
                    </div>
                  ))}
                </div>

                {/* Editor area */}
                <div className="flex-1 bg-[#1e1e1e] text-gray-300 p-4 font-mono text-xs leading-relaxed">
                  <div><span className="text-[#569cd6]">function</span> <span className="text-[#dcdcaa]">collaborate</span><span className="text-gray-500">(team) {"{"}</span></div>
                  <div className="pl-4"><span className="text-[#569cd6]">const</span> ideas = team.<span className="text-[#dcdcaa]">brainstorm</span>();</div>
                  <div className="pl-4"><span className="text-[#569cd6]">const</span> code = ideas.<span className="text-[#dcdcaa]">map</span>(build);</div>
                  <div className="pl-4"><span className="text-[#c586c0]">return</span> code.<span className="text-[#dcdcaa]">deploy</span>();</div>
                  <div><span className="text-gray-500">{"}"}</span></div>
                  <div className="mt-2"><span className="text-[#6a9955]">// 2 collaborators online</span></div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-[10px] text-emerald-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />You
                    </div>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-500/20 text-[10px] text-violet-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />Alex
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2 — Why CodeCollab ===== */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-sm uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-3">
              Why CodeCollab
            </p>
            <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mx-auto leading-tight">
              Your coding classroom should feel collaborative, not isolated
            </h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto mt-4">
              Traditional coding assignments are solo work. CodeCollab brings real-time teamwork to every project.
            </p>
          </div>

          {/* 3 feature cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "Collaborate on live projects",
                desc: "Code side-by-side with classmates. Every keystroke syncs in real-time across all collaborators.",
                bg: "feature-card-amber",
                iconColor: "text-amber-500",
              },
              {
                icon: MessageSquare,
                title: "Communicate seamlessly",
                desc: "Built-in project chat keeps discussions right next to the code. No more switching tools.",
                bg: "feature-card-violet",
                iconColor: "text-violet-500",
              },
              {
                icon: BookOpen,
                title: "Manage with confidence",
                desc: "Teachers control classrooms, approve students, and oversee projects from one dashboard.",
                bg: "feature-card-sky",
                iconColor: "text-sky-500",
              },
            ].map((card) => (
              <div key={card.title} className={`rounded-2xl border p-6 sm:p-8 ${card.bg} transition-all duration-200 hover:-translate-y-1`}>
                <card.icon className={`w-10 h-10 mb-5 ${card.iconColor}`} />
                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 3 — Alternating feature blocks ===== */}
      <section className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-16 sm:space-y-28">
          {/* Block 1: Text Left, Visual Right */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-5">
              <h3 className="text-2xl md:text-3xl font-bold">Quick to Launch</h3>
              <p className="text-[var(--text-secondary)] text-base leading-relaxed">
                Create a classroom in seconds. Students request to join, teachers approve, and everyone starts coding together immediately. No complex setup.
              </p>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /> One-click classroom creation</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /> Works in any modern browser</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /> No downloads required</li>
              </ul>
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-sm font-medium">My Classrooms</span>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium">+ Create</span>
                </div>
                {[
                  { name: "CS 101 — Intro to Programming", count: 12 },
                  { name: "Web Development 301", count: 8 },
                  { name: "Data Structures & Algorithms", count: 24 },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)]">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">{item.count} students</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Block 2: Visual Left, Text Right */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] overflow-hidden">
              <div className="flex">
                <div className="flex-1 p-5 border-r border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2 mb-3 text-xs text-[var(--text-muted)]">
                    <Code2 className="w-3.5 h-3.5" /> main.py
                  </div>
                  <div className="font-mono text-xs space-y-1 text-[var(--text-secondary)]">
                    <div><span className="text-violet-500">def</span> <span className="text-emerald-500">solve</span>(data):</div>
                    <div className="pl-4">result = process(data)</div>
                    <div className="pl-4"><span className="text-violet-500">return</span> result</div>
                  </div>
                </div>
                <div className="hidden sm:block w-44 p-4">
                  <div className="flex items-center gap-2 mb-3 text-xs text-[var(--text-muted)]">
                    <MessageSquare className="w-3.5 h-3.5" /> Chat
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 rounded-lg bg-violet-500/10 text-xs text-violet-500">Let's fix the loop</div>
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-xs text-emerald-500 ml-3">On it!</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-5">
              <h3 className="text-2xl md:text-3xl font-bold">Code & Chat, Side by Side</h3>
              <p className="text-[var(--text-secondary)] text-base leading-relaxed">
                Built-in project chat keeps the conversation flowing right next to the code. Discuss approaches, share ideas, and solve problems together without switching tools.
              </p>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-violet-500" /> Per-project messaging</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-violet-500" /> Live user presence indicators</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-violet-500" /> Real-time message delivery</li>
              </ul>
            </div>
          </div>

          {/* Block 3: Text Left, Visual Right */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-5">
              <h3 className="text-2xl md:text-3xl font-bold">Run Code Instantly</h3>
              <p className="text-[var(--text-secondary)] text-base leading-relaxed">
                Execute JavaScript, Python, or Java directly in the browser. See output in real-time — no setup, no terminal configuration, no hassle.
              </p>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /> JavaScript, Python, Java</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /> One-click execution</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /> Output displayed inline</li>
              </ul>
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-subtle)]">
                <span className="text-xs text-[var(--text-muted)] font-mono">Output</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                  <Play className="w-3 h-3" /> Run
                </span>
              </div>
              <div className="p-5 font-mono text-sm space-y-1 bg-[#1e1e1e] text-gray-300">
                <div className="text-gray-500">$ running collaborate.js...</div>
                <div className="text-emerald-400">Hello, World!</div>
                <div className="text-emerald-400">Hello, Developer!</div>
                <div className="text-gray-600 mt-2">Process exited with code 0</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-[var(--border-subtle)]">
        <div className="max-w-2xl mx-auto text-center space-y-5 sm:space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to start coding together?
          </h2>
          <p className="text-[var(--text-secondary)] text-lg">
            Free for students and teachers. Create a classroom in seconds.
          </p>
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-13 px-8 text-base mt-2" onClick={handleGetStarted}>
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[var(--border-subtle)] py-8 sm:py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-500" />
                <span className="font-mono font-bold text-sm">CodeCollab</span>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Real-time collaborative coding for classrooms.
              </p>
            </div>
            {[
              { title: "Product", items: ["Live Coding", "Classrooms", "Code Execution"] },
              { title: "For", items: ["Students", "Teachers", "Institutions"] },
              { title: "Company", items: ["About", "Blog", "Contact"] },
            ].map((col) => (
              <div key={col.title} className="space-y-3">
                <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{col.title}</h4>
                <div className="space-y-2">
                  {col.items.map((item) => (
                    <p key={item} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">{item}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--text-muted)]">&copy; {new Date().getFullYear()} CodeCollab. All rights reserved.</p>
            <div className="flex items-center space-x-4 text-xs text-[var(--text-muted)]">
              <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Terms</span>
              <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Privacy</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ===== GUEST ACCESS DIALOG ===== */}
      <Dialog open={isGuestDialogOpen} onOpenChange={setIsGuestDialogOpen}>
        <DialogContent className="sm:max-w-[420px] dialog-surface">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)] text-xl">Try CodeCollab as a Guest</DialogTitle>
            <DialogDescription className="text-[var(--text-muted)]">
              Jump right in — no email or password needed. You can edit your profile later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Name — read only */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Guest Name</label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg input-dark h-11 opacity-75 cursor-default">
                <User className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-sm text-[var(--text-primary)]">{GUEST_ACCOUNTS[guestType].name}</span>
              </div>
            </div>

            {/* Roll — read only, shown only for student */}
            {guestType === "STUDENT" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Roll Number</label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg input-dark h-11 opacity-75 cursor-default">
                  <Hash className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-primary)]">{GUEST_ACCOUNTS[guestType].roll}</span>
                </div>
              </div>
            )}

            {/* Type — switchable */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">I want to try as</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGuestType("STUDENT")}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                    guestType === "STUDENT"
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
                      : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-secondary)]"
                  }`}
                  disabled={isGuestLoading}
                >
                  <Users className="h-4 w-4" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setGuestType("TEACHER")}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                    guestType === "TEACHER"
                      ? "border-violet-500/50 bg-violet-500/10 text-violet-500"
                      : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-secondary)]"
                  }`}
                  disabled={isGuestLoading}
                >
                  <GraduationCap className="h-4 w-4" />
                  Teacher
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsGuestDialogOpen(false)}
              className="btn-outline-theme"
              disabled={isGuestLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGuestAccess}
              className="btn-gradient font-medium"
              disabled={isGuestLoading}
            >
              {isGuestLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Enter as Guest
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-[var(--text-muted)] text-center">
            Want a full account?{" "}
            <Link to="/create" className="text-emerald-500 hover:text-emerald-400 transition-colors font-medium">
              Sign up here
            </Link>
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { socket } from "../../useSocket";
import { LANGUAGE } from "../codeMap";
import { useContext, useEffect, useState } from "react";
import type { RoomUser, ChatMessage } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Play,
  Users,
  Download,
  ChevronLeft,
  ArrowLeft,
  MessageSquare,
  Loader2,
  Code2,
  Terminal,
  Share2,
  Maximize2,
  Minimize2,
  Type,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Authcontext } from "./AuthProvider";
import { SaveCode } from "@/utils/codeArena";
import { handleRunCode } from "@/utils/codeArena";
import axios from "axios";
import backend from "../../backend";
import Chat from "./Chat";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ThemeToggle from "./ThemeToggle";

const language = {
  [LANGUAGE["JS"].language]: `// JavaScript code
console.log("Hello, World!");

// Example function
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Example usage
console.log(greet("Developer"));`,
  [LANGUAGE["JAVA"].language]: `// Java code
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");

        // Example method
        String message = greet("Developer");
        System.out.println(message);
    }

    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}`,
  [LANGUAGE["PYTHON"].language]: `# Python code
print("Hello, World!")

# Example function
def greet(name):
    return f"Hello, {name}!"

# Example usage
print(greet("Developer"))`,
};

const Output = {
  [LANGUAGE["JS"].language]: `JS`,
  [LANGUAGE["JAVA"].language]: `JAVA`,
  [LANGUAGE["PYTHON"].language]: `PYTHON`,
};

const getLanguageExtension = (language) => {
  switch (language) {
    case "javascript":
      return javascript();
    case "python":
      return python();
    case "java":
      return java();
    default:
      return javascript();
  }
};

const editorStyles = `
  .cm-scroller::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .cm-scroller::-webkit-scrollbar-track {
    background: #0d0d15;
  }
  .cm-scroller::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    border: 2px solid #0d0d15;
  }
  .cm-scroller::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.15);
  }
  .cm-scroller::-webkit-scrollbar-corner {
    background: #0d0d15;
  }
  .output-scroll::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .output-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .output-scroll::-webkit-scrollbar-thumb {
    background: rgba(128, 128, 128, 0.2);
    border-radius: 4px;
  }
  .output-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(128, 128, 128, 0.3);
  }
  .editor-container {
    overflow: hidden;
    position: relative;
  }
  .editor-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
  }
  .top-bar {
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .left-sidebar {
    position: sticky;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 5;
  }
  .chat-sidebar {
    position: sticky;
    right: 0;
    top: 0;
    height: 100vh;
    z-index: 5;
  }
`;

export default function CodeArea() {
  const [isLight, setIsLight] = useState(() => document.documentElement.classList.contains("light"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);
  const { projectId, projectName } = useParams();
  const value = useContext(Authcontext);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<RoomUser[]>([]);
  const [connectionCount, setConnectionCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const [languageCode, SetLanguageCode] = useState(LANGUAGE["JS"]);
  const [codes, setCodes] = useState(language);
  const [output, setOutput] = useState(Output);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Watch for theme changes on <html> element
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains("light"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    socket.emit("privateRoomJoin", projectId);

    socket.on("privateMessage", (code, languageCode) => {
      setCodes({ ...codes, [languageCode]: code });
    });

    return () => {
      socket.off("privateMessage");
    };
  }, [projectId, codes]);

  useEffect(() => {
    async function getCodes() {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${backend}/room/project/code/${projectId}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        const value = res.data.codes;
        value.forEach((code) => {
          const lang = code.language;
          setCodes((prev) => ({ ...prev, [lang]: code.data }));
        });
      } catch (error) {
        toast.error("Failed to load code");
      } finally {
        setIsLoading(false);
      }
    }
    getCodes();
  }, [projectId, token]);

  useEffect(() => {
    socket.emit("joinProjectRoom", {
      roomid: projectId,
      userInfo: {
        id: value.id,
        name: value.name,
        type: value.type,
      },
    });

    socket.on("projectUsers", ({ roomId, count, users }) => {
      if (roomId === projectId) {
        setConnectionCount(count);
        setOnlineUsers(users || []);
      }
    });

    socket.on("userLeft", ({ roomId, userId }) => {
      if (roomId === projectId) {
        setOnlineUsers((prev) => prev.filter((user) => user.id !== userId));
        setConnectionCount((prev) => Math.max(0, prev - 1));
      }
    });

    socket.on("privateMessage", (code, languageCode) => {
      setCodes((prev) => ({ ...prev, [languageCode]: code }));
    });

    socket.on("chatMessage", (messageData) => {
      setMessages((prev) => [...prev, messageData]);
    });

    socket.on("disconnect", () => {
      setOnlineUsers([]);
      setConnectionCount(0);
    });

    socket.on("connect", () => {
      socket.emit("joinProjectRoom", {
        roomid: projectId,
        userInfo: {
          id: value.id,
          name: value.name,
          type: value.type,
        },
      });
    });

    return () => {
      socket.off("projectUsers");
      socket.off("userLeft");
      socket.off("privateMessage");
      socket.off("chatMessage");
      socket.off("disconnect");
      socket.off("connect");
      socket.emit("leaveProjectRoom", projectId);
    };
  }, [projectId, value.id, value.name, value.type]);

  const handleCodeChange = (value, languageCode) => {
    setCodes((prev) => ({ ...prev, [languageCode]: value }));
    socket.emit("privateMessage", {
      roomid: projectId,
      data: value,
      languageCode: languageCode,
    });
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const messageData = {
      sender: value.name,
      senderId: value.id,
      text: input,
      timestamp: new Date().toISOString(),
      roomId: projectId,
    };

    try {
      socket.emit("sendChatMessage", messageData);
      setInput("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  async function handleSaveCode() {
    setIsSaving(true);
    try {
      await SaveCode(projectId, languageCode, codes, token, setIsSaving);
      toast.success("Code saved successfully");
    } catch (error) {
      toast.error("Failed to save code");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRun() {
    setIsRunning(true);
    try {
      await handleRunCode({
        languageCode,
        setOutput,
        codes,
        setLoading: setIsRunning,
        loading: isRunning,
        output,
      });
    } catch (error) {
      toast.error("Failed to run code");
    } finally {
      setIsRunning(false);
    }
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(location.href);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  }

  const toggleFontSize = () => {
    setFontSize((prev) => (prev === 14 ? 16 : 14));
  };

  if (!value) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--surface)]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--surface)]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <span className="text-sm text-[var(--text-muted)] font-mono">Loading editor...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{editorStyles}</style>
      <div className="flex h-screen bg-[var(--surface)] overflow-hidden">
        {/* Mobile sidebar backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Left sidebar */}
        <div
          className={`left-sidebar ${
            isSidebarOpen ? "w-72" : "w-0"
          } bg-[var(--surface-raised)] border-r border-[var(--border-subtle)] transition-all duration-300 overflow-hidden max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40`}
        >
          <div className="p-5 space-y-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] truncate font-mono">
                {projectName}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden btn-ghost-theme"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
                <Users className="w-4 h-4" />
                <span>Online ({connectionCount})</span>
              </div>
              <div className="space-y-1.5">
                {onlineUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-2 text-sm p-2.5 rounded-lg badge-locked"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft" />
                    <span className="font-medium text-[var(--text-primary)]">{user.name}</span>
                    <span className="text-xs text-[var(--text-muted)] font-mono">({user.type})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
              <Button
                disabled={isSaving}
                variant="outline"
                className="w-full justify-start btn-outline-theme"
                onClick={handleSaveCode}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Save Code
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start btn-outline-theme"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Code
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="top-bar h-14 bg-[var(--surface-raised)] border-b border-[var(--border-subtle)] flex items-center justify-between px-2 sm:px-4">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="btn-ghost-theme h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="btn-ghost-theme h-8 w-8"
              >
                <ChevronLeft
                  className={`h-4 w-4 transform ${
                    isSidebarOpen ? "rotate-0" : "rotate-180"
                  } transition-transform`}
                />
              </Button>
              <Button
                disabled={isRunning}
                onClick={handleRun}
                className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 px-2 sm:px-4 glow-emerald"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run
                  </>
                )}
              </Button>
              <Select
                defaultValue="JS"
                onValueChange={(value) => SetLanguageCode(LANGUAGE[value])}
              >
                <SelectTrigger className="w-[100px] sm:w-[160px] h-8 bg-[var(--surface)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:ring-emerald-500/30">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="dialog-surface">
                  <SelectItem value="JS" className="text-[var(--text-primary)] focus:bg-emerald-500/10 focus:text-[var(--text-primary)]">JavaScript</SelectItem>
                  <SelectItem value="PYTHON" className="text-[var(--text-primary)] focus:bg-emerald-500/10 focus:text-[var(--text-primary)]">Python</SelectItem>
                  <SelectItem value="JAVA" className="text-[var(--text-primary)] focus:bg-emerald-500/10 focus:text-[var(--text-primary)]">Java</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-1">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFontSize}
                title={`Font Size: ${fontSize}px`}
                className="btn-ghost-theme h-8 w-8 hidden sm:inline-flex"
              >
                <Type className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLineNumbers(!showLineNumbers)}
                title={
                  showLineNumbers ? "Hide Line Numbers" : "Show Line Numbers"
                }
                className="btn-ghost-theme h-8 w-8 hidden sm:inline-flex"
              >
                <Code2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                className="btn-ghost-theme h-8 w-8 hidden sm:inline-flex"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`h-8 w-8 ${
                  isChatOpen ? "text-emerald-400" : "btn-ghost-theme"
                }`}
                title={isChatOpen ? "Close Chat" : "Open Chat"}
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Editor and output */}
          <div
            className={`flex-1 grid ${
              isFullscreen ? "grid-rows-1" : "grid-rows-2"
            } gap-0 overflow-hidden`}
          >
            <div className={`editor-container relative border-b border-[var(--border-subtle)] ${isLight ? "bg-white" : "bg-[#0d0d15]"}`}>
              <div className={`absolute top-0 left-0 right-0 h-8 flex items-center px-4 border-b z-10 ${isLight ? "bg-[#f5f5f5] border-gray-200" : "bg-[#0a0a0f] border-white/[0.05]"}`}>
                <Code2 className="h-3.5 w-3.5 text-emerald-400/60 mr-2" />
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  {languageCode.language}
                </span>
              </div>
              <div className="editor-content pt-8">
                <CodeMirror
                  value={codes[languageCode.language]}
                  height="100%"
                  theme={isLight ? vscodeLight : vscodeDark}
                  extensions={[
                    getLanguageExtension(languageCode.language.toLowerCase()),
                  ]}
                  onChange={(value) =>
                    handleCodeChange(value, languageCode.language)
                  }
                  className="h-full"
                  basicSetup={{
                    lineNumbers: showLineNumbers,
                    foldGutter: true,
                    highlightActiveLineGutter: true,
                    highlightSpecialChars: true,
                    history: true,
                    drawSelection: true,
                    dropCursor: true,
                    allowMultipleSelections: true,
                    indentOnInput: true,
                    syntaxHighlighting: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    autocompletion: true,
                    rectangularSelection: true,
                    crosshairCursor: true,
                    highlightActiveLine: true,
                    highlightSelectionMatches: true,
                    closeBracketsKeymap: true,
                    searchKeymap: true,
                    completionKeymap: true,
                    lintKeymap: true,
                  }}
                  style={{
                    fontSize: `${fontSize}px`,
                    height: "100%",
                  }}
                />
              </div>
            </div>
            {!isFullscreen && (
              <div className="bg-[var(--surface)] flex flex-col">
                <div className="flex items-center justify-between px-4 h-8 border-b border-[var(--border-subtle)]">
                  <h3 className="text-xs font-medium flex items-center text-[var(--text-muted)] font-mono">
                    <Terminal className="h-3.5 w-3.5 mr-2 text-emerald-400/60" />
                    Output
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setOutput({ ...output, [languageCode.language]: "" })
                    }
                    className="h-6 px-2 text-xs btn-ghost-theme"
                  >
                    Clear
                  </Button>
                </div>
                <div className="flex-1 bg-[var(--surface-raised)] text-[var(--text-primary)] p-4 font-mono text-sm overflow-auto output-scroll">
                  {output[languageCode.language].length !== 0 ? (
                    output[languageCode.language]
                      .split("\n")
                      .map((line, index) => (
                        <div key={index} className="whitespace-pre">
                          {line}
                        </div>
                      ))
                  ) : (
                    <div className="text-[var(--text-muted)] flex items-center justify-center h-full">
                      <Terminal className="h-5 w-5 mr-2 opacity-50" />
                      Run your code to see output here
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat sidebar */}
        {isChatOpen && (
          <div className="chat-sidebar w-full fixed inset-0 z-50 md:relative md:inset-auto md:z-5 md:w-80 border-l border-[var(--border-subtle)] bg-[var(--surface-raised)]">
            <Chat />
          </div>
        )}
      </div>
    </>
  );
}

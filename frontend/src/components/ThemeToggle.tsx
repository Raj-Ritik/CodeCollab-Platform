import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem("theme") === "light";
  });

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
  }, [isLight]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsLight(!isLight)}
      className={`relative w-9 h-9 rounded-lg transition-all duration-300 ${
        isLight
          ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          : "text-[#9ca3af] hover:bg-white/5 hover:text-[#f0f0f5]"
      } ${className}`}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
    >
      {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}

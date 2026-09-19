import { useState, useEffect, useRef, useContext } from "react";
import { socket } from "../../useSocket";
import { useParams } from "react-router-dom";
import { Authcontext } from "./AuthProvider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { SendHorizontal, Users, MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ChatMessage } from "@/types";

export default function Chat({ roomid }: { roomid?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [activeTab] = useState("room");
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const value = useContext(Authcontext);
  const { projectId } = useParams();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const messageData = {
      sender: value.name,
      senderId: value.id,
      text: input,
      timestamp: new Date().toISOString(),
      roomId: projectId || roomid,
    };

    try {
      socket.emit("sendChatMessage", messageData);
      setInput("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  useEffect(() => {
    socket.emit("joinProjectRoom", { roomid: projectId || roomid });

    socket.on("chatMessage", (messageData) => {
      setMessages((prev) => {
        const messageExists = prev.some(
          (msg) =>
            msg.senderId === messageData.senderId &&
            msg.timestamp === messageData.timestamp
        );
        if (messageExists) return prev;
        return [...prev, messageData];
      });
    });

    socket.on("connect", () => {
      setIsConnected(true);
      toast.success("Connected to chat");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      toast.error("Disconnected from chat");
    });

    return () => {
      socket.off("chatMessage");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [projectId, roomid]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--surface-raised)]">
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-[var(--text-primary)] font-mono">Chat</h3>
          <div className="flex items-center gap-2">
            {!isConnected && (
              <div className="flex items-center gap-1 text-xs text-red-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                Reconnecting...
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList className="w-full mb-2 tab-list-surface">
            <TabsTrigger value="room" className="flex-1 tab-trigger-theme text-xs">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Project
            </TabsTrigger>
            <TabsTrigger value="class" className="flex-1 tab-trigger-theme text-xs">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              Class
            </TabsTrigger>
          </TabsList>

          <div className="h-[calc(100vh-220px)] overflow-y-auto">
            <TabsContent value="room" className="space-y-3 p-1">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] text-sm py-8">
                  <MessageSquare className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn("flex items-start gap-2 group", {
                      "justify-end": message.senderId === value.id,
                    })}
                  >
                    {message.senderId !== value.id && (
                      <Avatar className="h-7 w-7">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${message.sender}`}
                        />
                        <AvatarFallback className="text-xs bg-emerald-500/10 text-[var(--text-secondary)]">
                          {getInitials(message.sender)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                        {
                          "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white":
                            message.senderId === value.id,
                          "bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border-subtle)]":
                            message.senderId !== value.id,
                        }
                      )}
                    >
                      {message.senderId !== value.id && (
                        <p className="font-medium text-xs mb-0.5 text-emerald-500">
                          {message.sender}
                        </p>
                      )}
                      <div className="space-y-0.5">
                        <p className="whitespace-pre-wrap break-words text-sm">
                          {message.text}
                        </p>
                        <p className="text-[10px] opacity-60 text-right">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </TabsContent>

            <TabsContent value="class">
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] text-sm py-8">
                <Users className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs">Class-wide chat coming soon!</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="p-3 border-t border-[var(--border-subtle)] mt-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 input-dark h-9 text-sm"
            disabled={!isConnected}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || !isConnected}
            className="shrink-0 btn-gradient h-9 w-9"
          >
            <SendHorizontal className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}


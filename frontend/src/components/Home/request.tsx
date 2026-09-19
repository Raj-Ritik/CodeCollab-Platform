import type { JoinRequest } from "@/types";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Mail,
  BookOpen,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import backend from "../../../backend";
import axios from "axios";
import { toast } from "sonner";

export default function RequestsContent() {
  const [search, setSearch] = useState("");
  const [requests, setRequest] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRequests();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchRequests() {
    try {
      setIsLoading(true);
      const res = await axios.get(`${backend}/room/class/request/get`, {
        headers: {
          Authorization: token,
        },
      });
      console.log("Fetched requests:", res.data.requests);
      setRequest(res.data.requests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to fetch requests");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRequest(value, requestId, classId, studentId) {
    try {
      setProcessingIds((prev) => new Set([...prev, requestId]));
      const res = await axios.post(
        `${backend}/room/class/request/handle`,
        {
          value,
          requestId,
          classId,
          studentId,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      // Remove the request from the list
      setRequest((prevRequests) =>
        prevRequests.filter((req) => req.id !== requestId)
      );

      toast.success(
        res.data.message ||
          (value === "APPROVE"
            ? "Request approved successfully"
            : "Request rejected successfully")
      );
    } catch (error) {
      console.error("Error handling request:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to process request";
      toast.error(errorMessage);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  }

  const filteredRequests = requests.filter((request) => {
    const searchTerm = search.toLowerCase();
    return (
      request.student.name.toLowerCase().includes(searchTerm) ||
      request.student.email.toLowerCase().includes(searchTerm) ||
      request.student.roll.toLowerCase().includes(searchTerm) ||
      request.class.name.toLowerCase().includes(searchTerm)
    );
  });

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto" />
          <p className="text-[var(--text-muted)] text-sm font-mono">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Pending Requests</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Review and manage student requests to join classrooms
          </p>
        </div>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 input-dark w-full md:w-64 h-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-[var(--text-muted)]" />
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <Alert className="card-surface text-[var(--text-secondary)]">
          <AlertCircle className="h-4 w-4 text-[var(--text-muted)]" />
          <AlertDescription>
            {search
              ? "No requests match your search"
              : "No pending requests found"}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="card-surface card-hover"
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Avatar className="h-12 w-12 avatar-ring shrink-0">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${request.student.email}`}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-violet-500/20 text-emerald-400 font-semibold">
                      {getInitials(request.student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg text-[var(--text-primary)]">
                        {request.student.name}
                      </h3>
                      <p className="text-sm text-[var(--text-muted)] font-mono">
                        Roll: {request.student.roll}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center text-sm text-[var(--text-muted)]">
                        <Mail className="h-4 w-4 mr-2" />
                        {request.student.email}
                      </div>
                      <div className="flex items-center text-sm text-[var(--text-muted)]">
                        <BookOpen className="h-4 w-4 mr-2" />
                        {request.class.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                    <Button
                      onClick={() =>
                        handleRequest(
                          "APPROVE",
                          request.id,
                          request.classId,
                          request.StudentId
                        )
                      }
                      disabled={processingIds.has(request.id)}
                      className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed glow-emerald"
                    >
                      {processingIds.has(request.id) ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button
                      onClick={() =>
                        handleRequest(
                          "REJECT",
                          request.id,
                          request.classId,
                          request.StudentId
                        )
                      }
                      disabled={processingIds.has(request.id)}
                      className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed glow-red"
                    >
                      {processingIds.has(request.id) ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

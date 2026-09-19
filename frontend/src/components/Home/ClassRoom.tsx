import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Loader2,
  BookOpen,
  Edit2,
  Trash2,
  User,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useRecoilState } from "recoil";
import { useContext, useEffect, useState } from "react";
import type { Classroom } from "@/types";
import axios from "axios";
import backend from "../../../backend";
import { allclasses, insideClassRoom, joinedClasses } from "@/state/roomid";
import { useNavigate } from "react-router-dom";
import { Authcontext } from "../AuthProvider";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Project from "./Project";
import { toast } from "sonner";

export default function ClassroomsContent() {
  const [allclass, setAllClass] = useRecoilState(allclasses);
  const [joinedclass, setJoinedClass] = useRecoilState(joinedClasses);
  const value = useContext(Authcontext);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState("");
  const [classId, setClassId] = useState("");
  const [selectedClassName, setSelectedClassName] = useState("");
  const [insideClass, setInsideClass] = useRecoilState(insideClassRoom);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [editClassName, setEditClassName] = useState("");
  const [pendingRequests, setPendingRequests] = useState(new Set());
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestTarget, setRequestTarget] = useState<Classroom | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/create");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (value.type === "TEACHER") {
          await Promise.all([fetchAll(), fetchTeacher()]);
        } else {
          await Promise.all([fetchAll(), fetchStudent()]);
        }
      } catch (error) {
        toast.error("Failed to load classrooms");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [value]);

  async function fetchAll() {
    try {
      const res = await axios.get(`${backend}/room/class/get/all`, {
        headers: { Authorization: token },
      });
      setAllClass(res.data.classes);
    } catch (error) {
      toast.error("Failed to fetch all classrooms");
    }
  }

  async function fetchTeacher() {
    try {
      const res = await axios.get(`${backend}/room/class/get/teacher`, {
        headers: { Authorization: token },
      });
      setJoinedClass(res.data.classes);
    } catch (error) {
      toast.error("Failed to fetch teacher classrooms");
    }
  }

  async function fetchStudent() {
    try {
      const res = await axios.get(`${backend}/room/class/get/student`, {
        headers: { Authorization: token },
      });
      setJoinedClass(res.data.classes);
    } catch (error) {
      toast.error("Failed to fetch student classrooms");
    }
  }


  function openRequestModal(classroom) {
    if (value.type === "TEACHER") {
      toast.error("Teachers cannot join other classrooms");
      return;
    }
    setRequestTarget(classroom);
    setIsRequestModalOpen(true);
  }

  async function confirmRequest() {
    if (!requestTarget) return;
    setIsRequesting(true);
    try {
      const res = await axios.post(
        `${backend}/room/class/request/create`,
        {
          classId: requestTarget.id,
          teacherId: requestTarget.teacher.id,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (res.data.status === "PENDING") {
        toast.info("Request already pending");
      } else if (res.data.message === "you are already in the class") {
        toast.info("You are already a member of this class");
      } else {
        toast.success("Request sent! Waiting for teacher approval.");
      }
      setPendingRequests((prev) => new Set([...prev, requestTarget.id]));
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to send request";
      toast.error(errorMessage);
    } finally {
      setIsRequesting(false);
      setIsRequestModalOpen(false);
      setRequestTarget(null);
    }
  }

  async function handleCreateClassroom() {
    if (!newClassroomName.trim()) {
      toast.error("Please enter a classroom name");
      return;
    }

    try {
      const res = await axios.post(
        `${backend}/room/class/create`,
        { name: newClassroomName },
        { headers: { Authorization: token } }
      );

      setJoinedClass((prev) => [...prev, res.data.room]);
      setIsCreateModalOpen(false);
      setNewClassroomName("");
      toast.success("Classroom created successfully");
    } catch (error) {
      toast.error("Failed to create classroom");
    }
  }

  async function handleJoinClassroom() {
    if (!joinCode.trim()) {
      toast.error("Please enter a classroom code");
      return;
    }

    try {
      // Add your join classroom logic here
      setIsJoinModalOpen(false);
      setJoinCode("");
      toast.success("Successfully joined classroom");
    } catch (error) {
      toast.error("Failed to join classroom");
    }
  }

  function OpenClass(classId, className) {
    navigate(`?classId=${classId}`);
    setClassId(classId);
    setSelectedClassName(className);
    setInsideClass(true);
  }

  const filteredClasses = (classes) => {
    return classes.filter((cls) =>
      cls.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  async function handleEditClassroom() {
    if (!editingClassroom) return;
    try {
      const res = await axios.post(
        `${backend}/room/class/update/${editingClassroom.id}`,
        { name: editClassName },
        { headers: { Authorization: token } }
      );
      setAllClass((prev) =>
        prev.map((c) => (c.id === editingClassroom.id ? res.data.class : c))
      );
      setJoinedClass((prev) =>
        prev.map((c) => (c.id === editingClassroom.id ? res.data.class : c))
      );
      setEditingClassroom(null);
      setEditClassName("");
      toast.success("Classroom renamed successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to rename classroom"
      );
    }
  }

  function handleEditClick(e, classroom) {
    e.stopPropagation();
    setEditingClassroom(classroom);
    setEditClassName(classroom.name);
    setIsEditModalOpen(true);
  }

  async function handleDeleteClassroom(id) {
    try {
      const res = await axios.post(
        `${backend}/room/class/delete/${id}`,
        {},
        {
          headers: { Authorization: token },
        }
      );

      if (res.data.message) {
        toast.success(res.data.message);
        setAllClass((prev) => prev.filter((cls) => cls.id !== id));
        setJoinedClass((prev) => prev.filter((cls) => cls.id !== id));
      } else {
        toast.error("Failed to delete classroom");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete classroom"
      );
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const ClassroomCard = ({ classroom, showJoinButton = false }) => (
    <Card className="card-surface card-hover group">
      {/* Gradient accent strip */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-t-lg opacity-60 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between text-[var(--text-primary)]">
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-emerald-400" />
            {classroom.name}
          </div>
          {value.type !== "STUDENT" &&
            classroom.teacher.id === value.id && (
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleEditClick(e, classroom)}
                  className="btn-ghost-theme h-8 w-8"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      window.confirm(
                        "Are you sure you want to delete this classroom?"
                      )
                    ) {
                      handleDeleteClassroom(classroom.id);
                    }
                  }}
                  className="hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-[var(--text-muted)]">
          <User className="h-4 w-4 mr-2" />
          {classroom.teacher.name}
        </div>
        {showJoinButton && value.type === "STUDENT" &&
          !joinedclass.some((c) => c.id === classroom.id) && (
            pendingRequests.has(classroom.id) ? (
              <div className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-500 text-sm font-medium">
                <Clock className="h-4 w-4 animate-pulse-soft" />
                Waiting for Approval
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full mt-2 border-[var(--border-subtle)] bg-transparent text-[var(--text-primary)] hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-600"
                onClick={(e) => {
                  e.stopPropagation();
                  openRequestModal(classroom);
                }}
              >
                Request to Join
              </Button>
            )
          )}
        {joinedclass.some((c) => c.id === classroom.id) && (
          <Button
            className="w-full mt-2 btn-gradient font-medium"
            onClick={() =>
              OpenClass(classroom.id, classroom.name)
            }
          >
            Enter Classroom
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      {insideClass ? (
        <Project classroomName={selectedClassName} />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-3xl font-bold text-[var(--text-primary)]">Classrooms</h2>
              <div className="flex items-center text-[var(--text-muted)]">
                <BookOpen className="h-5 w-5 mr-2" />
                <span className="text-sm">{allclass.length} total</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search classrooms..."
                  className="pl-10 input-dark w-full md:w-64 h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-[var(--text-muted)]" />
              </div>
              {value.type !== "STUDENT" && (
                <Button
                  className="btn-gradient text-[#0a0a0f] font-medium"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Create
                </Button>
              )}
              {value.type === "STUDENT" && (
                <Button
                  className="btn-gradient text-[#0a0a0f] font-medium"
                  onClick={() => setIsJoinModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Join
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="tab-list-surface">
              <TabsTrigger
                value="all"
                className="tab-trigger-theme"
              >
                All Classrooms
              </TabsTrigger>
              <TabsTrigger
                value="joined"
                className="tab-trigger-theme"
              >
                My Classrooms
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredClasses(allclass).map((classroom) => (
                    <ClassroomCard key={classroom.id} classroom={classroom} showJoinButton={true} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="joined" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredClasses(joinedclass).map((classroom) => (
                    <ClassroomCard key={classroom.id} classroom={classroom} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent className="sm:max-w-[425px] dialog-surface">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">Join a Classroom</DialogTitle>
            <DialogDescription className="text-[var(--text-muted)]">
              Enter the classroom code provided by your teacher
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                id="classroomCode"
                placeholder="Enter Classroom Code"
                className="col-span-4 input-dark"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsJoinModalOpen(false)} className="btn-outline-theme">
              Cancel
            </Button>
            <Button onClick={handleJoinClassroom} className="btn-gradient text-[#0a0a0f] font-medium">Join Classroom</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px] dialog-surface">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">Create a Classroom</DialogTitle>
            <DialogDescription className="text-[var(--text-muted)]">
              Create a new classroom for your students
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="classroomName" className="col-span-4 text-[var(--text-secondary)]">
                Classroom Name
              </Label>
              <Input
                id="classroomName"
                value={newClassroomName}
                onChange={(e) => setNewClassroomName(e.target.value)}
                placeholder="Enter Classroom Name"
                className="col-span-4 input-dark"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="btn-outline-theme"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateClassroom}
              className="btn-gradient text-[#0a0a0f] font-medium"
            >
              Create Classroom
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] dialog-surface">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">Edit Classroom</DialogTitle>
            <DialogDescription className="text-[var(--text-muted)]">
              Update the name of your classroom
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editClassName" className="col-span-4 text-[var(--text-secondary)]">
                Classroom Name
              </Label>
              <Input
                id="editClassName"
                value={editClassName}
                onChange={(e) => setEditClassName(e.target.value)}
                placeholder="Enter Classroom Name"
                className="col-span-4 input-dark"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="btn-outline-theme">
              Cancel
            </Button>
            <Button
              onClick={handleEditClassroom}
              className="btn-gradient text-[#0a0a0f] font-medium"
            >
              Update Classroom
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request to Join Confirmation Modal */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="sm:max-w-[400px] dialog-surface">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">Join Classroom</DialogTitle>
            <DialogDescription className="text-[var(--text-muted)]">
              Send a request to join this classroom. The teacher will review and approve your request.
            </DialogDescription>
          </DialogHeader>
          {requestTarget && (
            <div className="py-4 space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)]">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{requestTarget.name}</p>
                  <p className="text-sm text-[var(--text-muted)]">by {requestTarget.teacher.name}</p>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Once approved, you'll be able to access all projects in this classroom.
              </p>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsRequestModalOpen(false);
                setRequestTarget(null);
              }}
              className="btn-outline-theme"
              disabled={isRequesting}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRequest}
              className="btn-gradient font-medium"
              disabled={isRequesting}
            >
              {isRequesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

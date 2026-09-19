import { useContext, useState } from "react";
import { Authcontext } from "../AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Key,
  Loader2,
  User,
  Mail,
  Save,
  Shield,
  Lock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import backend from "../../../backend";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProfileContent() {
  const value = useContext(Authcontext);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: value.name || "",
    email: value.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const token = localStorage.getItem("token");

  const handleEdit = () => {
    setIsEditing(true);
    setPasswordError("");
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post(
        `${backend}/user/update`,
        {
          name: formData.name,
        },
        {
          headers: { Authorization: token },
        }
      );
      toast.success("Profile updated successfully");
      setIsEditing(false);
      value.setName(res.data.user.name);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setPasswordError("All password fields are required");
      return;
    }

    if (formData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post(
        `${backend}/user/change-password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: { Authorization: token },
        }
      );
      toast.success(res.data.message);
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordError("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to change password";
      setPasswordError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Profile Settings</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Manage your account settings and preferences
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={handleEdit}
            variant="outline"
            className="flex items-center gap-2 btn-outline-theme"
          >
            <User className="w-4 h-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2 card-surface">
          <CardHeader className="border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-2 ring-emerald-500/30 ring-offset-2 ring-offset-[var(--surface)]">
                  <AvatarImage src={value.avatar} alt={value.name} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-emerald-500/20 to-violet-500/20 text-emerald-400 font-bold">
                    {value.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <CardTitle className="text-xl text-[var(--text-primary)]">{value.name}</CardTitle>
                <p className="text-sm text-[var(--text-muted)] mt-1">{value.email}</p>
                <p className="text-xs text-emerald-400/80 mt-1 font-mono">
                  {value.type === "TEACHER" ? "Teacher" : "Student"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-[var(--text-secondary)]">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      readOnly={!isEditing}
                      className={`pl-10 input-dark ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-[var(--text-secondary)]">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                    <Input
                      id="email"
                      value={formData.email}
                      readOnly
                      className="pl-10 input-dark opacity-60 cursor-not-allowed"
                      placeholder="Enter your email"
                    />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Email address cannot be changed
                  </p>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-4 pt-4 border-t border-[var(--border-subtle)]">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        ...formData,
                        name: value.name,
                        email: value.email,
                      });
                    }}
                    disabled={isLoading}
                    className="btn-outline-theme"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-2 btn-gradient text-[#0a0a0f] font-medium"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 card-surface">
          <CardHeader className="border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <CardTitle className="text-xl text-[var(--text-primary)]">Security Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form className="space-y-6">
              {passwordError && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="currentPassword"
                    className="text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Current Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                    <Input
                      id="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          currentPassword: e.target.value,
                        });
                        setPasswordError("");
                      }}
                      className="pl-10 input-dark"
                      placeholder="Enter current password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-[var(--text-secondary)]">
                    New Password
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                    <Input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          newPassword: e.target.value,
                        });
                        setPasswordError("");
                      }}
                      className="pl-10 input-dark"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        });
                        setPasswordError("");
                      }}
                      className="pl-10 input-dark"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[var(--border-subtle)]">
                <Button
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="flex items-center gap-2 btn-gradient text-[#0a0a0f] font-medium"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  Change Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

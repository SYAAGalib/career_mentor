import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  learning_goals: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({
    display_name: "",
    avatar_url: "",
    bio: "",
    learning_goals: "",
    github_url: "",
    linkedin_url: "",
    portfolio_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (data) {
      setProfile({
        display_name: data.display_name || "",
        avatar_url: data.avatar_url || "",
        bio: data.bio || "",
        learning_goals: data.learning_goals || "",
        github_url: data.github_url || "",
        linkedin_url: data.linkedin_url || "",
        portfolio_url: data.portfolio_url || "",
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
        learning_goals: profile.learning_goals,
        github_url: profile.github_url,
        linkedin_url: profile.linkedin_url,
        portfolio_url: profile.portfolio_url,
      })
      .eq("user_id", user.id);

    if (error) toast.error("Failed to save profile");
    else toast.success("Profile saved!");
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUploading(true);
    const filePath = `${user.id}/avatar.${file.name.split(".").pop()}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("user_id", user.id);

    setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
    toast.success("Avatar uploaded!");
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="font-heading text-2xl font-bold text-foreground mb-8">Your Profile</h1>

        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
          <div>
            <h2 className="font-heading font-semibold text-foreground">
              {profile.display_name || "Set your name"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {uploading ? "Uploading..." : "Tap the camera icon to change your avatar"}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-heading font-semibold text-foreground text-sm">Basic Info</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Display Name</label>
              <Input
                value={profile.display_name || ""}
                onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))}
                className="bg-background border-border"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Bio</label>
              <Textarea
                value={profile.bio || ""}
                onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                className="bg-background border-border min-h-[80px]"
                placeholder="Tell us about yourself..."
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Learning Goals</label>
              <Textarea
                value={profile.learning_goals || ""}
                onChange={e => setProfile(p => ({ ...p, learning_goals: e.target.value }))}
                className="bg-background border-border min-h-[80px]"
                placeholder="What do you want to learn?"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-heading font-semibold text-foreground text-sm">Social Links</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">GitHub</label>
              <Input
                value={profile.github_url || ""}
                onChange={e => setProfile(p => ({ ...p, github_url: e.target.value }))}
                className="bg-background border-border"
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">LinkedIn</label>
              <Input
                value={profile.linkedin_url || ""}
                onChange={e => setProfile(p => ({ ...p, linkedin_url: e.target.value }))}
                className="bg-background border-border"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Portfolio</label>
              <Input
                value={profile.portfolio_url || ""}
                onChange={e => setProfile(p => ({ ...p, portfolio_url: e.target.value }))}
                className="bg-background border-border"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full gradient-primary text-primary-foreground h-11">
            <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function UserAvatar() {
  const { user } = useAuth();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userInitial = user?.email?.[0]?.toUpperCase() || "U";

  // Get user's uploaded profile picture from localStorage
  const userProfilePic = user
    ? localStorage.getItem(`profilePic_${user.uid}`)
    : null;

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = () => {
    if (selectedImage && user) {
      setUploading(true);

      // Convert image to base64 and store in localStorage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        localStorage.setItem(`profilePic_${user.uid}`, base64);
        setShowUploadDialog(false);
        setSelectedImage(null);
        setPreviewUrl("");
        setUploading(false);

        // Force refresh of the avatar
        window.dispatchEvent(new Event("storage"));
      };
      reader.readAsDataURL(selectedImage);
    }
  };

  const removeProfilePicture = () => {
    if (user) {
      localStorage.removeItem(`profilePic_${user.uid}`);
      setShowUploadDialog(false);
      window.dispatchEvent(new Event("storage"));
    }
  };

  return (
    <>
      <div className="relative group">
        <Avatar
          className="h-16 w-16 border-2 border-[#49BBBD] cursor-pointer transition-all duration-300 group-hover:border-[#3aa8a9] group-hover:scale-105"
          onClick={() => setShowUploadDialog(true)}
        >
          <AvatarImage
            src={userProfilePic || user?.photoURL || ""}
            alt="Profile picture"
            className="object-cover"
          />
          <AvatarFallback className="bg-[#49BBBD] text-white text-lg font-semibold">
            {userInitial}
          </AvatarFallback>
        </Avatar>

        {/* Upload overlay */}
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
          <Camera className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Update Profile Picture
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current/Preview Image */}
            <div className="flex justify-center">
              <Avatar className="h-32 w-32 border-2 border-[#49BBBD]">
                <AvatarImage
                  src={previewUrl || userProfilePic || user?.photoURL || ""}
                  alt="Profile preview"
                  className="object-cover"
                />
                <AvatarFallback className="bg-[#49BBBD] text-white text-2xl font-semibold">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Upload Controls */}
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-[#49BBBD] hover:bg-[#3aa8a9] text-white"
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Image
              </Button>

              {selectedImage && (
                <div className="text-center text-sm text-muted-foreground">
                  Selected: {selectedImage.name}
                  <br />
                  Size: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                </div>
              )}

              <div className="flex gap-2">
                {(userProfilePic || user?.photoURL) && (
                  <Button
                    variant="outline"
                    onClick={removeProfilePicture}
                    className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                    disabled={uploading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!selectedImage || uploading}
                  className="flex-1 bg-[#49BBBD] hover:bg-[#3aa8a9] text-white"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
              </div>
            </div>

            {/* Help Text */}
            <div className="text-xs text-muted-foreground text-center">
              Supported formats: JPG, PNG, GIF • Max size: 5MB
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

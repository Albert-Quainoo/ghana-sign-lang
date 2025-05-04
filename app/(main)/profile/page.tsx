"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context"; 
import { LoadingSpinner } from "@/components/loading-spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Timestamp, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth, storage } from "@/lib/config";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import {
  User as FirebaseUser,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  sendEmailVerification
 } from "firebase/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter} from "@/components/ui/dialog";
import { AlertCircle, Trash2, Edit3, Save, XCircle, Lock, Camera, MailWarning, MailCheck, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  createdAt?: Timestamp;
  role?: string;
  photoURL?: string | null;
}

const fallbacks = { title: "My Profile", loadingProfile: "Loading profile...", profileNotFound: "Profile data not found.", nameLabel: "Name", emailLabel: "Email", memberSinceLabel: "Member Since", editProfileButton: "Edit Profile", saveProfileButton: "Save Changes", cancelEditButton: "Cancel", changePasswordButton: "Change Password", updatePasswordDescription: "Update your account password.", deleteAccountButton: "Delete Account", deleteDescription: "Permanently remove your account and data.", deleteConfirmTitle: "Confirm Account Deletion", deleteConfirmMessage: "Are you absolutely sure you want to delete your account? This action cannot be undone and all your progress will be lost.", deleteCancel: "Cancel", deleteConfirm: "Yes, Delete My Account", updateSuccess: "Profile updated successfully!", updateError: "Failed to update profile.", nameRequiredError: "Name cannot be empty.", fetchError: "Failed to load profile data.", deleteError: "Failed to delete account. Please try again.", passwordChangeTitle: "Change Password", passwordChangeCurrentLabel: "Current Password", passwordChangeNewlabel: "New Password", passwordChangeConfirmLabel: "Confirm New Password", passwordChangeButton: "Update Password", passwordChangeSuccess: "Password updated successfully!", passwordChangeError: "Failed to update password. Check current password or ensure new password is valid.", passwordChangeMismatch: "New passwords do not match.", passwordChangeWeak: "New password is too weak (must be at least 6 characters).", reauthPrompt: "Please enter your current password to proceed.", reauthError: "Incorrect password. Please try again.", uploadPicture: "Change Picture", uploadingPicture: "Uploading...", uploadError: "Failed to upload picture.", uploadSuccess: "Profile picture updated!", removePicture: "Remove Picture", removingPicture: "Removing...", removePictureSuccess: "Profile picture removed.", removePictureError: "Failed to remove profile picture.", verificationResendSuccess: "Verification email sent!", verificationResendError: "Failed to send verification email.", emailVerified: "Email Verified", emailNotVerified: "Email Not Verified", resendVerificationButton: "Resend Verification Email", sent: "Sent!" };

export default function ProfilePage() {
  const { t, isLoading: isLanguageLoading } = useLanguage();
  const { user, loading: authLoading } = useAuth(); // Keep useAuth
  const router = useRouter();

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemovingPicture, setIsRemovingPicture] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => { if (!authLoading && !user) { router.push('/sign-in'); } }, [user, authLoading, router]);

  useEffect(() => {
    const fetchProfileData = async (currentUser: FirebaseUser) => {
       setProfileLoading(true); setProfileError(null); const userDocRef = doc(db, "users", currentUser.uid);
       try {
         const docSnap = await getDoc(userDocRef);
         if (docSnap.exists()) {
           const data = docSnap.data() as UserProfile; const resolvedPhotoURL = data.photoURL !== undefined ? data.photoURL : (currentUser.photoURL || undefined);
           const profileWithResolvedPhoto: UserProfile = { ...data, uid: currentUser.uid, email: data.email || currentUser.email || "No email", name: data.name || currentUser.displayName || "User", photoURL: resolvedPhotoURL, };
           setProfileData(profileWithResolvedPhoto); setEditedName(profileWithResolvedPhoto.name || "");
         } else {
           const basicProfile: UserProfile = { uid: currentUser.uid, email: currentUser.email || "No email", name: currentUser.displayName || "User", photoURL: currentUser.photoURL || undefined }
           setProfileData(basicProfile); setEditedName(basicProfile.name);
         }
       } catch (error) { console.error("Error fetching profile data:", error); setProfileError(t('profile.fetchError') ?? fallbacks.fetchError); }
       finally { setProfileLoading(false); }
    };
    if (!authLoading && user) { fetchProfileData(user); } else if (!authLoading && !user) { setProfileLoading(false); }
  }, [user, authLoading, t]);

  const clearStatus = (delay = 4000) => { setTimeout(() => setStatusMessage(null), delay); };
  const handleEditToggle = () => { if (!profileData) return; setStatusMessage(null); if (!isEditing) { setEditedName(profileData.name || user?.displayName || ""); } setIsEditing(!isEditing); };
  const handleCancelEdit = () => { setIsEditing(false); setStatusMessage(null); };

  const handleProfileUpdate = async () => {
     if (!user || !profileData) return; setStatusMessage(null); setEditLoading(true);
     const newName = editedName.trim(); if (!newName) { setStatusMessage({ type: 'error', message: t('profile.nameRequiredError') ?? fallbacks.nameRequiredError }); setEditLoading(false); return; }
     try {
       const userDocRef = doc(db, "users", user.uid); const updateData: Partial<UserProfile> = { name: newName }; await updateDoc(userDocRef, updateData);
       if (auth.currentUser && auth.currentUser.displayName !== newName) { await updateProfile(auth.currentUser, { displayName: newName }); }
       setProfileData((prev) => prev ? { ...prev, name: newName } : null); setStatusMessage({ type: 'success', message: t('profile.updateSuccess') ?? fallbacks.updateSuccess }); setIsEditing(false); clearStatus();
     } catch (error) { console.error("Error updating profile:", error); setStatusMessage({ type: 'error', message: t('profile.updateError') ?? fallbacks.updateError }); clearStatus(); }
     finally { setEditLoading(false); }
   };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { if (event.target.files && event.target.files[0]) { const file = event.target.files[0]; if (!file.type.startsWith("image/")) { setStatusMessage({ type: 'error', message: "Please select an image file." }); clearStatus(); return; } if (file.size > 5 * 1024 * 1024) { setStatusMessage({ type: 'error', message: "Image file size should be less than 5MB." }); clearStatus(); return; } handlePictureUpload(file); } };
  const handlePictureUpload = async (file: File) => {
        if (!user) return; setIsUploading(true); setStatusMessage(null); const storageRef = ref(storage, `profilePictures/${user.uid}/${Date.now()}_${file.name}`);
        try {
            const oldPhotoURL = profileData?.photoURL; if (oldPhotoURL) { try { 
                const oldPhotoRef = ref(storage, oldPhotoURL); 
                await deleteObject(oldPhotoRef); 
            } catch (storageError: unknown) { 
                if (typeof storageError === "object" && storageError && "code" in storageError && (storageError as { code?: string }).code !== 'storage/object-not-found') { 
                    console.warn("Could not delete old profile picture:", storageError); 
                } 
            } 
            }
            const snapshot = await uploadBytes(storageRef, file); const downloadURL = await getDownloadURL(snapshot.ref);
            if (auth.currentUser) { await updateProfile(auth.currentUser, { photoURL: downloadURL }); }
            const userDocRef = doc(db, "users", user.uid); await updateDoc(userDocRef, { photoURL: downloadURL });
            setProfileData((prev) => prev ? { ...prev, photoURL: downloadURL } : null); setStatusMessage({ type: 'success', message: t('profile.uploadSuccess') ?? fallbacks.uploadSuccess }); clearStatus();
        } catch (error: unknown) { 
            console.error("Error uploading profile picture:", error); 
            setStatusMessage({ type: 'error', message: t('profile.uploadError') ?? fallbacks.uploadError }); 
            clearStatus(); 
        }
        finally { setIsUploading(false); if (fileInputRef.current) { fileInputRef.current.value = ""; } }
     };

    const handleRemovePicture = async () => {
        if (!user || !profileData?.photoURL) return; setIsRemovingPicture(true); setStatusMessage(null); const currentPhotoURL = profileData.photoURL;
        try {
             try { 
                const photoRef = ref(storage, currentPhotoURL); 
                await deleteObject(photoRef); 
            } catch (storageError: unknown) { 
                if (typeof storageError === "object" && storageError && "code" in storageError && (storageError as { code?: string }).code !== 'storage/object-not-found') { 
                    console.warn("Error deleting profile picture from storage during removal:", storageError); 
                } 
            }
             if (auth.currentUser) { await updateProfile(auth.currentUser, { photoURL: null }); }
             const userDocRef = doc(db, "users", user.uid); await updateDoc(userDocRef, { photoURL: null });
             setProfileData((prev) => prev ? { ...prev, photoURL: null } : null); setStatusMessage({ type: 'success', message: t('profile.removePictureSuccess') ?? fallbacks.removePictureSuccess }); clearStatus();
        } catch (error: unknown) { 
            console.error("Error removing profile picture:", error); 
            setStatusMessage({ type: 'error', message: t('profile.removePictureError') ?? fallbacks.removePictureError }); 
            clearStatus(); 
        }
        finally { setIsRemovingPicture(false); }
    };

  const reauthenticate = async (currentPass: string): Promise<boolean> => { if (!user || !user.email) return false; try { const credential = EmailAuthProvider.credential(user.email, currentPass); await reauthenticateWithCredential(user, credential); return true; } catch (error) { console.error("Re-authentication failed:", error); return false; } };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
      e.preventDefault(); if (!user) return; setPasswordChangeError(null); setStatusMessage(null);
      if (newPassword !== confirmNewPassword) { setPasswordChangeError(t('profile.passwordChangeMismatch') ?? fallbacks.passwordChangeMismatch); return; } if (newPassword.length < 6) { setPasswordChangeError(t('profile.passwordChangeWeak') ?? fallbacks.passwordChangeWeak); return; }
      setPasswordChangeLoading(true); const reauthSuccess = await reauthenticate(currentPassword);
      if (reauthSuccess) {
          try { await updatePassword(user, newPassword); setStatusMessage({ type: 'success', message: t('profile.passwordChangeSuccess') ?? fallbacks.passwordChangeSuccess }); setShowPasswordModal(false); setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword(""); clearStatus(); }
          catch (error: unknown) { 
              console.error("Error updating password:", error); 
              if (typeof error === "object" && error && "code" in error && (error as { code?: string }).code === "auth/weak-password") { 
                  setPasswordChangeError(t('profile.passwordChangeWeak') ?? fallbacks.passwordChangeWeak); 
              } else { 
                  setPasswordChangeError(t('profile.passwordChangeError') ?? fallbacks.passwordChangeError); 
              } 
          }
      } else { setPasswordChangeError(t('profile.reauthError') ?? fallbacks.reauthError); }
      setPasswordChangeLoading(false);
  };

  const handleDeleteAccountSubmit = async (e: React.FormEvent) => {
     e.preventDefault(); if (!user) return; setDeleteError(null); setStatusMessage(null); setIsDeleting(true); const reauthSuccess = await reauthenticate(deletePassword);
     if (reauthSuccess) {
         try {
            const photoToDelete = profileData?.photoURL || user.photoURL; if (photoToDelete) { try { 
                const photoRef = ref(storage, photoToDelete); 
                await deleteObject(photoRef); 
            } catch (storageError: unknown) { 
                if (typeof storageError === "object" && storageError && "code" in storageError && (storageError as { code?: string }).code !== 'storage/object-not-found') { 
                    console.error("Error deleting profile picture during account deletion:", storageError); 
                } 
            } 
            }
            const userDocRef = doc(db, "users", user.uid); await deleteDoc(userDocRef); await deleteUser(user); router.push('/');
         } catch (error: unknown) { 
            console.error("Error deleting account:", error); 
            setDeleteError(t('profile.deleteError') ?? fallbacks.deleteError); 
            setIsDeleting(false); 
         }
     } else { setDeleteError(t('profile.reauthError') ?? fallbacks.reauthError); setIsDeleting(false); }
   };

  const handleResendVerification = async () => {
        if (!user || user.emailVerified) return; setResendLoading(true); setStatusMessage(null);
    try { await sendEmailVerification(user); setVerificationSent(true); setStatusMessage({ type: 'success', message: t('profile.verificationResendSuccess') ?? fallbacks.verificationResendSuccess}); setTimeout(() => setVerificationSent(false), 15000); clearStatus(15000); }
    catch (error) { console.error("Error resending verification email:", error); setStatusMessage({ type: 'error', message: t('profile.verificationResendError') ?? fallbacks.verificationResendError}); clearStatus(); }
    finally { setResendLoading(false); }
     };

  const getInitials = (name?: string | null): string => { if (!name) return "?"; return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(); };

  if (authLoading || isLanguageLoading || profileLoading) { return ( <main className="min-h-screen section-padding hero-bg relative overflow-hidden flex items-center justify-center"> <LoadingSpinner size="lg" /> <p className="ml-3 text-muted-foreground">{t('profile.loadingProfile') ?? fallbacks.loadingProfile}</p> </main> ); }
  if (!user) return null;

  const userPhotoURL = profileData?.photoURL;
  const displayName = profileData?.name || user.displayName || "User";
  const displayEmail = profileData?.email || user.email || "No email provided";
  const memberSince = profileData?.createdAt?.toDate()?.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) || "N/A";

  return (
    <main className="min-h-screen section-padding hero-bg relative overflow-hidden">
       <div className="container max-w-3xl mx-auto relative z-10 py-8 md:py-12">
            <div className="text-center mb-8 md:mb-12"> <h1 className="text-3xl md:text-4xl font-bold gradient-text-heading mb-2"> {t('profile.title') ?? fallbacks.title} </h1> </div>
            {statusMessage && ( <Alert className={cn("mb-6", statusMessage.type === 'success' ? 'border-green-500 bg-green-50/80 text-green-800' : 'border-red-500 bg-red-50/80 text-red-800')}> {statusMessage.type === 'success' ? <Check className="h-4 w-4 text-green-600"/> : <AlertCircle className={cn("h-4 w-4", 'text-red-600')} /> } <AlertTitle className="font-semibold">{statusMessage.type === 'success' ? 'Success' : 'Error'}</AlertTitle> <AlertDescription>{statusMessage.message}</AlertDescription> </Alert> )}
            {profileError && ( <Alert variant="destructive" className="mb-6"> <AlertCircle className="h-4 w-4" /> <AlertTitle>Error Loading Profile</AlertTitle> <AlertDescription>{profileError}</AlertDescription> </Alert> )}
            <div className="glass-card-content rounded-xl shadow-lg overflow-hidden border border-gray-100/50 p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 pb-6 border-b border-gray-200/60">
                    <div className="relative shrink-0 group">
                        <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-white shadow-md"> <AvatarImage src={userPhotoURL || undefined} alt={displayName} key={userPhotoURL} /> <AvatarFallback className="text-2xl bg-gray-100">{getInitials(displayName)}</AvatarFallback> </Avatar>
                        <div className="absolute bottom-0 right-0 flex items-center gap-1 transform translate-y-1/4">
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm border border-gray-300 shadow-sm hover:bg-gray-50" onClick={() => fileInputRef.current?.click()} aria-label={t('profile.uploadPicture') ?? fallbacks.uploadPicture} disabled={isUploading || isRemovingPicture}> {isUploading ? <LoadingSpinner size="sm"/> : <Camera className="h-4 w-4 text-gray-600"/>} </Button>
                             {userPhotoURL && ( <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm border border-gray-300 shadow-sm hover:bg-red-50 text-red-600 hover:text-red-700" onClick={handleRemovePicture} aria-label={t('profile.removePicture') ?? fallbacks.removePicture} disabled={isUploading || isRemovingPicture}> {isRemovingPicture ? <LoadingSpinner size="sm"/> : <X className="h-4 w-4"/>} </Button> )}
                        </div>
                        <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading || isRemovingPicture} />
                    </div>
                    <div className="text-center sm:text-left flex-grow min-w-0 pt-2 sm:pt-0">
                        {isEditing ? ( <div className="space-y-2"> <Label htmlFor="profileName" className="text-xs font-medium text-muted-foreground">{t('profile.nameLabel') ?? fallbacks.nameLabel}</Label> <Input id="profileName" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="text-xl font-semibold h-9" disabled={editLoading || isUploading || isRemovingPicture} /> </div> )
                        : ( <h2 className="text-2xl font-semibold text-gray-800 truncate pt-1">{displayName}</h2> )}
                        <p className="text-sm text-muted-foreground mt-1 break-words">{displayEmail}</p> <p className="text-xs text-muted-foreground mt-2"> {t('profile.memberSince') ?? fallbacks.memberSinceLabel}: {memberSince} </p>
                         <div className="mt-3"> {user?.emailVerified ? ( <div className="flex items-center justify-center sm:justify-start text-xs text-green-600 font-medium"> <MailCheck className="h-4 w-4 mr-1.5"/> {t('profile.emailVerified') ?? fallbacks.emailVerified} </div> )
                             : ( <div className="flex flex-col items-center sm:items-start gap-1"> <div className="flex items-center text-xs text-orange-600 font-medium"> <MailWarning className="h-4 w-4 mr-1.5"/> {t('profile.emailNotVerified') ?? fallbacks.emailNotVerified} </div> <Button variant="link" size="sm" className="text-xs h-auto p-0 text-purple-600 hover:text-purple-800 disabled:text-muted-foreground disabled:no-underline" onClick={handleResendVerification} disabled={resendLoading || verificationSent}> {resendLoading ? <LoadingSpinner size="sm" className="mr-1"/> : null} {verificationSent ? (t('profile.sent') ?? fallbacks.sent) : (t('profile.resendVerificationButton') ?? fallbacks.resendVerificationButton)} </Button> </div> )}
                         </div>
                    </div>
                     <div className="shrink-0 mt-4 sm:mt-0 self-start"> {isEditing ? ( <div className="flex flex-col sm:flex-row gap-2"> <Button size="sm" onClick={handleProfileUpdate} disabled={editLoading || isUploading || isRemovingPicture}> <Save className="h-4 w-4 mr-1.5"/> {editLoading ? "Saving..." : (t('profile.saveButton') ?? fallbacks.saveProfileButton)} </Button> <Button size="sm" variant="ghost" onClick={handleCancelEdit} disabled={editLoading || isUploading || isRemovingPicture}> <XCircle className="h-4 w-4 mr-1.5"/> {t('profile.cancelButton') ?? fallbacks.cancelEditButton} </Button> </div> )
                        : ( <Button size="sm" variant="outline" onClick={handleEditToggle} disabled={isUploading || isRemovingPicture}> <Edit3 className="h-4 w-4 mr-1.5"/> {t('profile.editButton') ?? fallbacks.editProfileButton} </Button> )}
                     </div>
                </div>
                <div className="space-y-4 pt-4">
                   <h3 className="text-lg font-semibold text-gray-700 mb-3">Account Settings</h3>
                    <div> <Button variant="outline" className="w-full justify-start sm:w-auto" onClick={() => { setPasswordChangeError(null); setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); setShowPasswordModal(true); }}> <Lock className="h-4 w-4 mr-2 opacity-70"/> {t('profile.changePasswordButton') ?? fallbacks.changePasswordButton} </Button> <p className="text-xs text-muted-foreground mt-1 pl-1">{t('profile.updatePasswordDescription') ?? fallbacks.updatePasswordDescription}</p> </div>
                    <div> <Button variant="outline" className={cn( "w-full justify-start sm:w-auto", "text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 focus:ring-red-500" )} onClick={() => { setDeleteError(null); setDeletePassword(''); setShowDeleteModal(true); }}> <Trash2 className="h-4 w-4 mr-2 opacity-70"/> {t('profile.deleteAccountButton') ?? fallbacks.deleteAccountButton} </Button> <p className="text-xs text-muted-foreground mt-1 pl-1">{t('profile.deleteDescription') ?? fallbacks.deleteDescription}</p> </div>
                </div>
            </div>
            <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}> <DialogContent className="sm:max-w-[425px]"> <DialogHeader> <DialogTitle>{t('profile.passwordChangeTitle') ?? fallbacks.passwordChangeTitle}</DialogTitle> <DialogDescription>{t('profile.reauthPrompt') ?? fallbacks.reauthPrompt}</DialogDescription> </DialogHeader> <form onSubmit={handleChangePasswordSubmit} className="grid gap-4 py-4"> {passwordChangeError && ( <p className="text-sm text-red-600 px-1">{passwordChangeError}</p> )} <div className="grid grid-cols-4 items-center gap-4"> <Label htmlFor="currentPassword" className="text-right col-span-1 text-sm">{t('profile.passwordChangeCurrentLabel') ?? fallbacks.passwordChangeCurrentLabel}</Label> <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="col-span-3" required disabled={passwordChangeLoading} /> </div> <div className="grid grid-cols-4 items-center gap-4"> <Label htmlFor="newPassword" className="text-right col-span-1 text-sm">{t('profile.passwordChangeNewlabel') ?? fallbacks.passwordChangeNewlabel}</Label> <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="col-span-3" required disabled={passwordChangeLoading} /> </div> <div className="grid grid-cols-4 items-center gap-4"> <Label htmlFor="confirmNewPassword" className="text-right col-span-1 text-sm">{t('profile.passwordChangeConfirmLabel') ?? fallbacks.passwordChangeConfirmLabel}</Label> <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="col-span-3" required disabled={passwordChangeLoading} /> </div> <DialogFooter> <Button type="submit" disabled={passwordChangeLoading}> {passwordChangeLoading ? <LoadingSpinner size="sm" className="mr-2"/> : null} {passwordChangeLoading ? "Updating..." : (t('profile.passwordChangeButton') ?? fallbacks.passwordChangeButton)} </Button> </DialogFooter> </form> </DialogContent> </Dialog>
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}> <DialogContent className="sm:max-w-md"> <DialogHeader> <DialogTitle className="text-red-600">{t('profile.deleteConfirmTitle') ?? fallbacks.deleteConfirmTitle}</DialogTitle> <DialogDescription>{t('profile.deleteConfirmMessage') ?? fallbacks.deleteConfirmMessage}</DialogDescription> </DialogHeader> <form onSubmit={handleDeleteAccountSubmit} className="space-y-4 pt-4"> {deleteError && ( <p className="text-sm text-red-600 px-1">{deleteError}</p> )} <div> <Label htmlFor="deletePassword">{t('profile.reauthPrompt') ?? fallbacks.reauthPrompt}</Label> <Input id="deletePassword" type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} required disabled={isDeleting} className="mt-1" /> </div> <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2"> <Button type="button" variant="ghost" disabled={isDeleting} onClick={() => setShowDeleteModal(false)}> {t('profile.deleteCancel') ?? fallbacks.deleteCancel} </Button> <Button type="submit" variant="destructive" disabled={isDeleting}> {isDeleting ? <LoadingSpinner size="sm" className="mr-2"/> : <Trash2 className="h-4 w-4 mr-2"/>} {isDeleting ? "Deleting..." : (t('profile.deleteConfirm') ?? fallbacks.deleteConfirm)} </Button> </DialogFooter> </form> </DialogContent> </Dialog>
       </div>
    </main>
  );
}
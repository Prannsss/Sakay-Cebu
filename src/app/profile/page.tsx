'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Camera, 
  LogOut, 
  Save,
  Palette,
  Shield,
  CheckCircle2,
  AlertCircle,
  Edit,
  X
} from 'lucide-react';
import { User as UserType } from '@/lib/types';
import { ThemeModal } from '@/components/ThemeModal';
import { useTheme } from 'next-themes';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePicture: ''
  });

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.push('/login');
    } else {
      setIsLoading(false);
      
      // Load profile picture from separate storage based on user role
      const storageKey = user.role === 'provider' 
        ? `sakay-cebu-provider-profile-${user.id}`
        : `sakay-cebu-client-profile-${user.id}`;
      
      const savedProfilePicture = localStorage.getItem(storageKey) || '';
      
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        profilePicture: savedProfilePicture
      });
    }
  }, [user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, profilePicture: base64String }));
        
        // Store profile picture separately based on user role
        const storageKey = user?.role === 'provider' 
          ? `sakay-cebu-provider-profile-${user.id}`
          : `sakay-cebu-client-profile-${user.id}`;
        
        localStorage.setItem(storageKey, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Store profile picture separately based on user role
    const storageKey = user.role === 'provider' 
      ? `sakay-cebu-provider-profile-${user.id}`
      : `sakay-cebu-client-profile-${user.id}`;
    
    if (formData.profilePicture) {
      localStorage.setItem(storageKey, formData.profilePicture);
    }

    // Create updated user object
    const updatedUser: UserType = {
      ...user,
      name: formData.name,
      email: formData.email,
      phone: formData.phone
    };

    // Update user in auth context (this will also update the lists)
    updateUser(updatedUser);
    
    setIsSaving(false);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancel = () => {
    // Load profile picture from storage
    const storageKey = user.role === 'provider' 
      ? `sakay-cebu-provider-profile-${user.id}`
      : `sakay-cebu-client-profile-${user.id}`;
    
    const savedProfilePicture = localStorage.getItem(storageKey) || '';
    
    // Reset form data to original user data
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      profilePicture: savedProfilePicture
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleInfo = () => {
    switch (user.role) {
      case 'provider':
        return { label: 'Vehicle Provider', color: 'bg-blue-500' };
      case 'admin':
        return { label: 'Administrator', color: 'bg-purple-500' };
      default:
        return { label: 'Client', color: 'bg-green-500' };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Picture Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload a photo to personalize your account</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-muted">
                <AvatarImage src={formData.profilePicture} alt={formData.name} />
                <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                  {formData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Upload profile picture"
                aria-label="Upload profile picture"
              >
                <Camera className="h-8 w-8 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                aria-label="Profile picture upload"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-bold">{formData.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{formData.email}</p>
              <Badge variant="secondary" className={`${roleInfo.color} text-white`}>
                <Shield className="h-3 w-3 mr-1" />
                {roleInfo.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10"
                  placeholder="Enter your full name"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  placeholder="Enter your email"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Contact Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="pl-10"
                  placeholder="Enter your contact number"
                  disabled={!isEditing}
                />
              </div>
            </div>

            {saveSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Profile updated successfully!</span>
              </div>
            )}

            {isEditing && (
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="flex-1 sm:flex-initial"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleCancel} 
                  variant="outline"
                  disabled={isSaving}
                  className="flex-1 sm:flex-initial"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how Sakay Cebu looks for you</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => setShowThemeModal(true)}
              className="w-full justify-between"
            >
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span>Theme</span>
              </div>
              <span className="text-muted-foreground capitalize">{theme || 'System'}</span>
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Theme Selection Modal */}
      <ThemeModal open={showThemeModal} onOpenChange={setShowThemeModal} />
    </div>
  );
}

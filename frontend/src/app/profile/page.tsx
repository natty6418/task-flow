"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Camera, Shield, Clock, BarChart3, Loader, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fetchUserProfile, updateUserProfile } from '@/services/userService';
import { UserProfile } from '@/types/type';
import RecentActivity from '@/components/dashboard/ActivityFeed';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    jobTitle: '',
    company: '',
    
  });

  // Fetch user profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const profileData = await fetchUserProfile();
        setProfile(profileData);
        setFormData({
          name: user?.name || 'User',
          email: user?.email || 'user@example.com',
          phone: profileData.phone || '',
          location: profileData.location || '',
          bio: profileData.bio || '',
          jobTitle: profileData.jobTitle || '',
          company: profileData.company || '',
          
        });
      } catch (err) {
        // Profile doesn't exist or failed to load - use generic placeholders
        setError(null); // Don't show error for missing profile
        setProfile(null);
        setFormData({
          name: user?.name || 'User',
          email: user?.email || 'user@example.com',
          phone: '',
          location: '',
          bio: 'Welcome to TaskFlow! Update your profile to let others know more about you.',
          jobTitle: '',
          company: '',
          
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Update user profile (excluding name, email, and timezone which aren't part of UserProfile)
      const updatedProfile = await updateUserProfile({
        bio: formData.bio,
        jobTitle: formData.jobTitle,
        location: formData.location,
        company: formData.company,
        phone: formData.phone,
      });
      
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current profile values or generic placeholders
    if (profile) {
      setFormData({
        name: user?.name || 'User',
        email: user?.email || 'user@example.com',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        jobTitle: profile.jobTitle || '',
        company: profile.company || '',
        
      });
    } else {
      // No profile exists, use generic placeholders
      setFormData({
        name: user?.name || 'User',
        email: user?.email || 'user@example.com',
        phone: '',
        location: '',
        bio: 'Welcome to TaskFlow! Update your profile to let others know more about you.',
        jobTitle: '',
        company: '',
        
      });
    }
    setIsEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and preferences</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Profile Header */}
              <div className="relative p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {formData.name.charAt(0).toUpperCase()}
                      </div>
                      {isEditing && (
                        <button 
                          title="Change profile picture"
                          className="absolute bottom-0 right-0 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
                        >
                          <Camera className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    
                    {/* Basic Info */}
                    <div className="space-y-3">
                      <h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2>
                      
                      {isEditing ? (
                        <input
                          type="text"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleInputChange}
                          title="Job title"
                          placeholder="Enter your job title"
                          className="text-gray-600 border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-0 focus:border-gray-300"
                        />
                      ) : (
                        <p className="text-gray-600">{formData.jobTitle || 'Job title not specified'}</p>
                      )}
                      
                      {isEditing ? (
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          title="Company name"
                          placeholder="Enter your company name"
                          className="text-gray-500 border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-0 focus:border-gray-300"
                        />
                      ) : (
                        <p className="text-gray-500">{formData.company || 'Company not specified'}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Edit Button - Only show when not editing */}
                  {!isEditing && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-gray-900">{formData.email}</span>
                      <p className="text-xs text-gray-500 mt-1">Email is managed in account settings</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        title="Phone number"
                        placeholder="Enter your phone number"
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-300"
                      />
                    ) : (
                      <span className="text-gray-900">{formData.phone || 'Phone number not provided'}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {isEditing ? (
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        title="Location"
                        placeholder="Enter your location"
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-300"
                      />
                    ) : (
                      <span className="text-gray-900">{formData.location || 'Location not specified'}</span>
                    )}
                  </div>
                  
                </div>
              </div>

              {/* Bio Section */}
              <div className="p-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-0 focus:border-gray-300"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {formData.bio || 'No bio provided yet. Click edit to add information about yourself.'}
                  </p>
                )}
              </div>

              {/* Account Info */}
              <div className="p-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span className="text-gray-900">Account Status: </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Active</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">Member since: </span>
                    <span className="text-gray-600">
                      {user?.createdAt 
                        ? format(new Date(user.createdAt), 'MMM dd, yyyy')
                        : 'Unknown'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Actions - Only show when editing */}
              {isEditing && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <RecentActivity numActivities={3}/>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

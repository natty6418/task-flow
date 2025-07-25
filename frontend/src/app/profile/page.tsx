"use client";
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Camera, Shield, Clock, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Passionate software developer with 5 years of experience in full-stack development. Love building scalable applications and working with modern technologies.',
    jobTitle: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    timezone: 'PST (UTC-8)',
  });

  // Dummy activity data
  const activityStats = {
    tasksCompleted: 47,
    projectsContributed: 8,
    averageTaskTime: '2.3 days',
    efficiency: 92,
  };

  // Dummy recent activity
  const recentActivity = [
    { id: 1, action: 'Completed task', item: 'Update user authentication', time: '2 hours ago' },
    { id: 2, action: 'Created project', item: 'Mobile App Redesign', time: '1 day ago' },
    { id: 3, action: 'Assigned to task', item: 'Fix payment gateway bug', time: '2 days ago' },
    { id: 4, action: 'Updated profile', item: 'Added new skills', time: '1 week ago' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Here you would typically save to backend
    console.log('Saving profile data:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: user?.name || 'John Doe',
      email: user?.email || 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      bio: 'Passionate software developer with 5 years of experience in full-stack development. Love building scalable applications and working with modern technologies.',
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      timezone: 'PST (UTC-8)',
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and preferences</p>
        </div>

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
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          title="Full name"
                          placeholder="Enter your full name"
                          className="text-2xl font-bold text-gray-900 border border-gray-300 rounded-md px-2 py-1 mb-2"
                        />
                      ) : (
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{formData.name}</h2>
                      )}
                      
                      {isEditing ? (
                        <input
                          type="text"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleInputChange}
                          title="Job title"
                          placeholder="Enter your job title"
                          className="text-gray-600 border border-gray-300 rounded-md px-2 py-1 mb-1 block"
                        />
                      ) : (
                        <p className="text-gray-600 mb-1">{formData.jobTitle}</p>
                      )}
                      
                      {isEditing ? (
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          title="Company name"
                          placeholder="Enter your company name"
                          className="text-gray-500 border border-gray-300 rounded-md px-2 py-1"
                        />
                      ) : (
                        <p className="text-gray-500">{formData.company}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Edit Controls */}
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="inline-flex items-center px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        title="Email address"
                        placeholder="Enter your email address"
                        className="flex-1 border border-gray-300 rounded-md px-2 py-1"
                      />
                    ) : (
                      <span className="text-gray-900">{formData.email}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        title="Phone number"
                        placeholder="Enter your phone number"
                        className="flex-1 border border-gray-300 rounded-md px-2 py-1"
                      />
                    ) : (
                      <span className="text-gray-900">{formData.phone}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        title="Location"
                        placeholder="Enter your location"
                        className="flex-1 border border-gray-300 rounded-md px-2 py-1"
                      />
                    ) : (
                      <span className="text-gray-900">{formData.location}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="text"
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleInputChange}
                        title="Timezone"
                        placeholder="Enter your timezone"
                        className="flex-1 border border-gray-300 rounded-md px-2 py-1"
                      />
                    ) : (
                      <span className="text-gray-900">{formData.timezone}</span>
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">{formData.bio}</p>
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
                    <span className="text-gray-600">{format(new Date(2023, 5, 15), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Activity Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tasks Completed</span>
                  <span className="font-semibold text-gray-900">{activityStats.tasksCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Projects</span>
                  <span className="font-semibold text-gray-900">{activityStats.projectsContributed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg. Task Time</span>
                  <span className="font-semibold text-gray-900">{activityStats.averageTaskTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Efficiency</span>
                  <span className="font-semibold text-green-600">{activityStats.efficiency}%</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex flex-col space-y-1">
                    <div className="text-sm text-gray-900">
                      <span className="font-medium">{activity.action}:</span> {activity.item}
                    </div>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </div>
                ))}
              </div>
              <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 transition-colors">
                View all activity →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

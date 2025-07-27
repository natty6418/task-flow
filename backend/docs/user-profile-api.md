# User Profile API Endpoints

This document describes the user profile management endpoints for the Task Flow application.

## Endpoints Overview

### Base URL: `/api/users`

All endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

## User Profile Endpoints

### 1. Get User Profile
**GET** `/profile`

Retrieves the current user's profile information.

**Response:**
```json
{
  "id": "profile-uuid",
  "userId": "user-uuid",
  "bio": "Software developer passionate about clean code",
  "avatarUrl": "https://example.com/avatar.jpg",
  "jobTitle": "Senior Software Engineer",
  "location": "San Francisco, CA",
  "company": "Tech Corp",
  "phone": "+1-555-0123",
  "createdAt": "2025-07-26T10:00:00Z",
  "updatedAt": "2025-07-26T10:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Profile not found
- `500 Internal Server Error` - Server error

---

### 2. Create or Update Profile (Full Replace)
**POST** `/profile`

Creates a new profile or completely replaces an existing profile.

**Request Body:**
```json
{
  "bio": "Software developer passionate about clean code",
  "avatarUrl": "https://example.com/avatar.jpg",
  "jobTitle": "Senior Software Engineer",
  "location": "San Francisco, CA",
  "company": "Tech Corp",
  "phone": "+1-555-0123"
}
```

**Response:** Returns the created/updated profile object.

**Notes:**
- All fields are optional
- If profile doesn't exist, creates a new one
- If profile exists, replaces all fields with provided values
- Unprovided fields will be set to null

---

### 3. Update Profile (Partial Update)
**PATCH** `/profile`

Updates specific fields of the user's profile without affecting other fields.

**Request Body:**
```json
{
  "jobTitle": "Lead Software Engineer",
  "location": "New York, NY"
}
```

**Response:** Returns the updated profile object.

**Allowed Fields:**
- `bio` (string)
- `avatarUrl` (string)
- `jobTitle` (string)
- `location` (string)
- `company` (string)
- `phone` (string)

**Error Responses:**
- `400 Bad Request` - No valid fields provided
- `401 Unauthorized` - User not authenticated
- `500 Internal Server Error` - Server error

---

### 4. Delete Profile
**DELETE** `/profile`

Deletes the current user's profile.

**Response:**
```json
{
  "message": "Profile deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Profile not found
- `500 Internal Server Error` - Server error

---

### 5. Update Avatar
**POST** `/profile/avatar`

Updates only the user's avatar URL.

**Request Body:**
```json
{
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

**Response:**
```json
{
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

**Notes:**
- Creates a profile if one doesn't exist
- `avatarUrl` is required in request body

---

## Updated User Info Endpoint

### Get Current User (Enhanced)
**GET** `/me`

The existing `/me` endpoint has been enhanced to include profile information.

**Response:**
```json
{
  "id": "user-uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "MEMBER",
  "authProvider": "CREDENTIALS",
  "createdAt": "2025-07-26T10:00:00Z",
  "updatedAt": "2025-07-26T10:00:00Z",
  "profile": {
    "id": "profile-uuid",
    "userId": "user-uuid",
    "bio": "Software developer passionate about clean code",
    "avatarUrl": "https://example.com/avatar.jpg",
    "jobTitle": "Senior Software Engineer",
    "location": "San Francisco, CA",
    "company": "Tech Corp",
    "phone": "+1-555-0123",
    "createdAt": "2025-07-26T10:00:00Z",
    "updatedAt": "2025-07-26T10:00:00Z"
  },
  "projects": [...],
  "ownedProjects": [...],
  "assignedTasks": [...],
  "projectMemberships": [...]
}
```

## Usage Examples

### Creating a Profile
```javascript
const response = await fetch('/api/users/profile', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    bio: 'Full-stack developer with 5 years experience',
    jobTitle: 'Software Engineer',
    location: 'Remote',
    company: 'Startup Inc'
  })
});

const profile = await response.json();
```

### Updating Specific Fields
```javascript
const response = await fetch('/api/users/profile', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jobTitle: 'Senior Software Engineer',
    location: 'San Francisco, CA'
  })
});

const updatedProfile = await response.json();
```

### Updating Avatar
```javascript
const response = await fetch('/api/users/profile/avatar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    avatarUrl: 'https://cdn.example.com/avatars/user123.jpg'
  })
});

const { avatarUrl } = await response.json();
```

## Security Notes

- All endpoints require valid JWT authentication
- Users can only access and modify their own profiles
- Input validation is performed on all fields
- Profile deletion is irreversible
- Avatar URLs should be validated on the client side for security

## Database Schema

The UserProfile model includes the following fields:
- `id` - UUID primary key
- `userId` - Foreign key to User (unique)
- `bio` - Optional text description
- `avatarUrl` - Optional URL to profile image
- `jobTitle` - Optional job title
- `location` - Optional location string
- `company` - Optional company name
- `phone` - Optional phone number
- `createdAt` - Timestamp of creation
- `updatedAt` - Timestamp of last update

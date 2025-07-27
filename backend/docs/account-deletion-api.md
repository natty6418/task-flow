# Account Deletion API

This document describes the secure account deletion functionality for the Task Flow application.

## Endpoint

### Delete Account
**DELETE** `/api/auth/delete-account`

Permanently deletes a user account and handles all associated data according to the deletion policy.

**Authentication:** JWT token required

**Request Body:**
```json
{
  "password": "user_password",  // Required for credential-based accounts
  "confirmDelete": "DELETE_MY_ACCOUNT"  // Required confirmation string
}
```

**Response (Success):**
```json
{
  "message": "Account deleted successfully. All associated data has been removed or transferred."
}
```

**Error Responses:**
- `400 Bad Request` - Missing confirmation or password
- `401 Unauthorized` - Invalid authentication or password
- `500 Internal Server Error` - Server error during deletion

## Security Features

### 1. **Explicit Confirmation Required**
- Users must provide the exact string `"DELETE_MY_ACCOUNT"` in the `confirmDelete` field
- Prevents accidental deletions from simple API calls

### 2. **Password Verification**
- For users with credential-based accounts (email/password), current password verification is required
- OAuth users (Google, GitHub) don't need password verification as they're already authenticated

### 3. **JWT Authentication**
- Valid JWT token required to identify the user
- Only authenticated users can delete their own accounts

### 4. **Cookie Cleanup**
- JWT cookie is automatically cleared upon successful deletion
- Prevents any residual authentication state

## Data Handling Policy

The deletion process follows a comprehensive data cleanup and transfer policy:

### **Personal Data (Deleted)**
- User profile information (bio, avatar, contact details)
- User account credentials
- Personal notifications
- Activity logs performed by the user

### **Project Ownership (Transferred or Deleted)**
- **Projects with other members**: Ownership is transferred to the first project member
- **Projects without other members**: Entire project is deleted including:
  - All tasks within the project
  - All boards within the project
  - All project-related notifications
  - All project-related activity logs

### **Task Assignments (Unassigned)**
- Tasks assigned to the deleted user are unassigned (set to null)
- Task history and content remain intact for project continuity

### **Project Memberships (Removed)**
- User is removed from all project memberships
- Projects continue to exist with remaining members

## Transaction Safety

The deletion process uses database transactions to ensure:
- **Atomicity**: Either all operations succeed or none do
- **Consistency**: Database remains in a valid state
- **Data Integrity**: No orphaned records or broken references

## Usage Examples

### For Credential-Based Users
```javascript
const response = await fetch('/api/auth/delete-account', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    password: 'current_password',
    confirmDelete: 'DELETE_MY_ACCOUNT'
  })
});

if (response.ok) {
  // Account deleted successfully
  // Redirect to home page or show confirmation
  window.location.href = '/';
} else {
  const error = await response.json();
  console.error('Deletion failed:', error.message);
}
```

### For OAuth Users
```javascript
const response = await fetch('/api/auth/delete-account', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    confirmDelete: 'DELETE_MY_ACCOUNT'
    // No password required for OAuth users
  })
});
```

## Frontend Implementation Recommendations

### 1. **Multi-Step Confirmation UI**
```javascript
// Step 1: Show warning about data loss
// Step 2: Password verification (if needed)
// Step 3: Type confirmation phrase
// Step 4: Final confirmation button
```

### 2. **Clear Data Impact Communication**
- Show users what will happen to their projects
- Explain data transfer vs. deletion scenarios
- Provide option to transfer project ownership manually before deletion

### 3. **Progress Indication**
- Account deletion may take a few seconds due to data cleanup
- Show loading state during the process
- Handle potential timeout scenarios

## Error Handling

### Common Error Scenarios

**Missing Confirmation:**
```json
{
  "message": "Account deletion requires explicit confirmation. Please provide confirmDelete: 'DELETE_MY_ACCOUNT'"
}
```

**Invalid Password:**
```json
{
  "message": "Invalid password"
}
```

**Database Error:**
```json
{
  "error": "Failed to delete account. Please try again."
}
```

## Administrative Considerations

### 1. **Audit Logging**
- Consider implementing audit logs for account deletions
- Track deletion requests for compliance purposes

### 2. **Data Retention**
- Current implementation provides immediate deletion
- Consider implementing "soft delete" with retention period if required by regulations

### 3. **Backup Strategy**
- Ensure backup systems can handle user deletion events
- Consider GDPR compliance for EU users

## Recovery Policy

**Important**: Account deletion is **irreversible**. Once an account is deleted:
- The user data cannot be recovered
- The user can create a new account with the same email
- Previous project associations are permanently lost
- Historical activity data is removed

## Rate Limiting Recommendations

Consider implementing rate limiting for account deletion to prevent:
- Automated account deletion attacks
- Accidental rapid deletions
- System overload from bulk deletions

Example rate limit: 1 deletion per IP address per hour.

## Testing Considerations

When testing account deletion:
1. Test with users who own projects with/without members
2. Test with users who have various data types (tasks, notifications, etc.)
3. Verify transaction rollback on failures
4. Test both credential and OAuth user deletion flows
5. Verify proper cleanup of all related data

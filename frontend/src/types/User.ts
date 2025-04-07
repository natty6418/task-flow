export interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'MEMBER' | 'VIEWER';
    authProvider: 'GOOGLE' | 'GITHUB' | 'CREDENTIALS';
  }
  
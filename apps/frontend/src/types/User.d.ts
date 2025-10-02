export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin'; // Assuming roles are 'user' or 'admin'
  status: 'active' | 'inactive' | 'pending'; // Assuming statuses
}

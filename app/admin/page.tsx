/**
 * Admin Root Page - Redirects to Dashboard
 */

import { redirect } from 'next/navigation';

export default function AdminPage() {
  redirect('/admin/dashboard');
}

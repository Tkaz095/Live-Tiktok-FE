import AdminLayout from "@/features/admin-dashboard/components/AdminLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}

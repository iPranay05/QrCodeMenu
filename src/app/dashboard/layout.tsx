import DashboardSidebar from '@/components/DashboardSidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar />
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-24 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}

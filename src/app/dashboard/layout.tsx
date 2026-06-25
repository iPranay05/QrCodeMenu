import DashboardSidebar from '@/components/DashboardSidebar'
import Aurora from '@/components/ui/Aurora'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Aurora showGrid={true}>
      <div className="flex flex-1 min-h-screen w-full relative z-10">
        <DashboardSidebar />
        <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-24 md:pb-0 min-h-screen relative z-10 w-full">
          {children}
        </main>
      </div>
    </Aurora>
  )
}

import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'

export default function AdminLayout() {
  const { admin, isAdmin, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile viewport and manage sidebar state
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024 // lg breakpoint
      setIsMobile(mobile)
      // Close sidebar by default on mobile, open by default on desktop
      if (mobile) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    // Initial check
    checkIfMobile()
    
    // Handle resize
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/admin/login', { replace: true })
    }
  }, [isAdmin, loading, navigate])

  const handleSignOut = async () => {
    try {
      const result = await signOut()
      if (result.success) {
        navigate('/admin/login', { replace: true })
      } else {
        console.error('Sign out failed:', result.error)
        navigate('/admin/login', { replace: true })
      }
    } catch (error) {
      console.error('Sign out error:', error)
      navigate('/admin/login', { replace: true })
    }
  }

  // Close sidebar when clicking a link on mobile
  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Teams', href: '/admin/teams', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Notes', href: '/admin/notes', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Evaluations', href: '/admin/evaluations', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile sidebar backdrop with better touch handling */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar with responsive improvements */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-gray-700 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isMobile ? 'w-full max-w-xs' : ''}`}
      >
        {/* Logo/Brand */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700 bg-gradient-to-r from-indigo-900/20 to-indigo-800/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-sm">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white truncate">
              Admin Panel
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-200 p-1 rounded-lg hover:bg-gray-700 transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation with scroll for mobile */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            // Better active route detection: exact match for /admin, startsWith for nested routes
            const isActive = item.href === '/admin' 
              ? location.pathname === '/admin' || location.pathname === '/admin/'
              : location.pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={handleNavClick}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-900/50 to-indigo-800/30 text-indigo-300 shadow-sm border-l-4 border-indigo-400'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <svg
                  className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-gray-400'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="truncate font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User section - optimized for mobile */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-medium">
                  {admin?.name?.charAt(0)?.toUpperCase() || admin?.email?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {admin?.name || admin?.email}
              </p>
              <p className="text-xs text-gray-400 truncate">Administrator</p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 rounded-lg transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md"
          >
            <svg className="mr-2 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main content with responsive padding */}
      <div className="lg:pl-64">
        {/* Top bar with mobile optimizations */}
        <div className="sticky top-0 z-40 bg-gray-800 shadow-sm border-b border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-gray-200 p-2 rounded-lg hover:bg-gray-700"
                aria-label="Open sidebar"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Breadcrumb or page title for mobile */}
              <div className="ml-4 lg:ml-0">
                <h2 className="text-lg font-semibold text-white truncate">
                  {navigation.find(item => {
                    if (item.href === '/admin') {
                      return location.pathname === '/admin' || location.pathname === '/admin/'
                    }
                    return location.pathname.startsWith(item.href)
                  })?.name || 'Dashboard'}
                </h2>
              </div>
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center space-x-3">
              {/* Mobile user info */}
              <div className="lg:hidden flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {admin?.name?.charAt(0)?.toUpperCase() || admin?.email?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white truncate max-w-[120px]">
                    {admin?.name?.split(' ')[0] || admin?.email?.split('@')[0]}
                  </p>
                </div>
              </div>
              
              {/* Mobile sign out button */}
              <button
                onClick={handleSignOut}
                className="lg:hidden text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-gray-700"
                aria-label="Sign out"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Page content without the container wrapper */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
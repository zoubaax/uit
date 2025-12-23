import { useAuth } from '../contexts/AuthContext'
import { useTeams } from '../hooks/useTeams'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { admin } = useAuth()
  const { teams, loading } = useTeams()

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back, {admin?.name || admin?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Teams Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Teams
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : teams.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                to="/admin/teams"
                className="font-medium text-indigo-700 hover:text-indigo-900"
              >
                View all teams
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            <div className="mt-4 space-y-2">
              <Link
                to="/admin/teams"
                className="block text-sm text-indigo-600 hover:text-indigo-900"
              >
                Manage Teams
              </Link>
              <Link
                to="/admin/notes"
                className="block text-sm text-indigo-600 hover:text-indigo-900"
              >
                View Notes
              </Link>
              <Link
                to="/admin/evaluations"
                className="block text-sm text-indigo-600 hover:text-indigo-900"
              >
                Weekly Evaluations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


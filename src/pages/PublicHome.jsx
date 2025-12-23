import { useTeams } from '../hooks/useTeams'
import { Link } from 'react-router-dom'

export default function PublicHome() {
  const { teams, loading } = useTeams()

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Team Notes System</h1>
        <p className="mt-2 text-sm text-gray-600">
          View team information and notes
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-600">Loading teams...</div>
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No teams available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">
                  {team.name}
                </h3>
                {team.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {team.description}
                  </p>
                )}
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <Link
                  to={`/teams/${team.id}`}
                  className="text-sm font-medium text-indigo-700 hover:text-indigo-900"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


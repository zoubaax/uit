import { useState, useEffect } from 'react'
import { useTeams } from '../hooks/useTeams'
import { Link } from 'react-router-dom'
import { 
  FaUsers, 
  FaFileAlt, 
  FaChartBar, 
  FaTrophy, 
  FaCheckCircle,
  FaCalendarAlt,
  FaArrowRight
} from 'react-icons/fa'

export default function PublicTeams() {
  const { teams, loading } = useTeams()

  // Sort teams by score (descending, nulls last) and assign rankings
  const sortedTeams = [...teams].sort((a, b) => {
    if (a.score !== null && a.score !== undefined && b.score !== null && b.score !== undefined) {
      return b.score - a.score
    }
    if (a.score !== null && a.score !== undefined) return -1
    if (b.score !== null && b.score !== undefined) return 1
    return 0
  })

  // Filter teams with scores first
  const teamsWithScores = sortedTeams.filter(team => team.score !== null && team.score !== undefined)
  
  // Build teams with ranking incrementally
  const teamsWithRanking = []
  let currentRank = 1
  teamsWithScores.forEach((team, index) => {
    let rank = currentRank
    // Check if this team has the same score as the previous team
    if (index > 0 && 
        team.score !== null && 
        team.score !== undefined &&
        teamsWithScores[index - 1].score !== null &&
        teamsWithScores[index - 1].score !== undefined &&
        team.score === teamsWithScores[index - 1].score) {
      // Use the same rank as the previous team
      rank = teamsWithRanking[index - 1].rank
    } else {
      // New rank
      currentRank = index + 1
      rank = currentRank
    }
    teamsWithRanking.push({ ...team, rank })
  })
  
  // Add teams without scores (they won't have ranks)
  sortedTeams.forEach(team => {
    if (team.score === null || team.score === undefined) {
      teamsWithRanking.push({ ...team, rank: null })
    }
  })

  // Top teams for banner - sorted by rank to ensure 1, 2, 3 order
  const topTeams = teamsWithRanking
    .filter(t => t.score !== null && t.score !== undefined && t.rank !== null)
    .sort((a, b) => a.rank - b.rank) // Sort by rank to ensure 1, 2, 3 order
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                Teams
              </h1>
              <p className="text-gray-300 text-lg">
                View all teams and their rankings
              </p>
            </div>
          </div>

          {/* Top Teams Banner */}
          {topTeams.length > 0 && (
            <div className="mb-8 bg-gradient-to-r from-amber-900/20 via-yellow-900/20 to-amber-900/20 rounded-2xl border-2 border-amber-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FaTrophy className="h-8 w-8 text-amber-400 mr-3" />
                  <h2 className="text-2xl font-bold text-white">Top Teams Leaderboard</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                {topTeams.map((team) => {
                  // Determine order: rank 1 in middle, rank 2 on left, rank 3 on right
                  let orderClass = ''
                  if (team.rank === 1) {
                    orderClass = 'md:order-2' // Middle
                  } else if (team.rank === 2) {
                    orderClass = 'md:order-1' // Left
                  } else if (team.rank === 3) {
                    orderClass = 'md:order-3' // Right
                  }
                  
                  return (
                  <div key={team.id} className={`bg-gray-800 rounded-xl border border-amber-800 shadow-sm ${orderClass} ${
                    team.rank === 1 
                      ? 'p-6 md:-mt-4 md:transform md:scale-105 shadow-lg' 
                      : 'p-4'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`rounded-lg flex items-center justify-center font-bold ${
                          team.rank === 1 
                            ? 'w-10 h-10 text-base bg-gradient-to-br from-yellow-400 to-amber-500 text-gray-900' 
                            : team.rank === 2
                            ? 'w-8 h-8 text-sm bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900'
                            : 'w-8 h-8 text-sm bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                        }`}>
                          {team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : '🥉'}
                        </div>
                        {team.logo_url ? (
                          <img
                            src={team.logo_url}
                            alt={`${team.name} logo`}
                            className={`object-cover rounded-lg border border-amber-800 flex-shrink-0 ${
                              team.rank === 1 ? 'h-10 w-10' : 'h-8 w-8'
                            }`}
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        ) : null}
                      </div>
                      <span className={`font-bold text-amber-400 ${
                        team.rank === 1 ? 'text-xl' : 'text-lg'
                      }`}>
                        {Math.round(parseFloat(team.score))}
                      </span>
                    </div>
                    <h3 className={`font-semibold text-white truncate ${
                      team.rank === 1 ? 'text-lg' : 'text-base'
                    }`}>{team.name}</h3>
                  </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Stats - Fixed dark colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-sm border border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-gray-800 rounded-xl shadow-sm mr-4 border border-gray-700">
                  <FaUsers className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Teams</p>
                  <p className="text-3xl font-bold text-white">{loading ? '...' : teams.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-sm border border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-gray-800 rounded-xl shadow-sm mr-4 border border-gray-700">
                  <FaFileAlt className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Teams with Scores</p>
                  <p className="text-3xl font-bold text-white">
                    {teams.filter(t => t.score !== null && t.score !== undefined).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-sm border border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-gray-800 rounded-xl shadow-sm mr-4 border border-gray-700">
                  <FaChartBar className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Average Score</p>
                  <p className="text-3xl font-bold text-white">
                    {(() => {
                      const teamsWithScores = teams.filter(t => t.score !== null && t.score !== undefined)
                      if (teamsWithScores.length === 0) return '0'
                      const avg = teamsWithScores.reduce((sum, t) => sum + parseFloat(t.score), 0) / teamsWithScores.length
                      return Math.round(avg)
                    })()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-sm border border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-gray-800 rounded-xl shadow-sm mr-4 border border-gray-700">
                  <FaCheckCircle className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Top Score</p>
                  <p className="text-3xl font-bold text-white">
                    {topTeams.length > 0 ? Math.round(parseFloat(topTeams[0].score)) : '0'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teams List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading teams...</p>
            </div>
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-dashed border-gray-700 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-gray-800 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6 border border-gray-700">
                <FaUsers className="h-12 w-12 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No teams yet</h3>
              <p className="text-gray-300">
                Teams will appear here once they are added.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamsWithRanking.map((team) => (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl border border-gray-700 overflow-hidden hover:shadow-3xl hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-1 block"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {team.score !== null && team.score !== undefined && (
                          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                            team.rank === 1 
                              ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-gray-900' 
                              : team.rank === 2
                              ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900'
                              : team.rank === 3
                              ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                              : 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white'
                          }`}>
                            {team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : team.rank === 3 ? '🥉' : `#${team.rank}`}
                          </div>
                        )}
                        {team.logo_url ? (
                          <img
                            src={team.logo_url}
                            alt={`${team.name} logo`}
                            className="h-12 w-12 object-cover rounded-xl shadow-sm border-2 border-gray-700 flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div className={`p-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-sm flex-shrink-0 ${team.logo_url ? 'hidden' : ''}`}>
                          <FaUsers className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                            {team.name}
                          </h3>
                        </div>
                      </div>
                      
                      {team.description && (
                        <p className="text-gray-300 line-clamp-2 mb-4 leading-relaxed">
                          {team.description}
                        </p>
                      )}
                      
                      {team.score !== null && team.score !== undefined && (
                        <div className="mb-4">
                          <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border border-amber-800">
                            <FaTrophy className="h-4 w-4 text-amber-400 mr-2" />
                            <span className="text-sm font-semibold text-amber-300">
                              Score: {Math.round(parseFloat(team.score))}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="flex items-center text-sm text-gray-400">
                          <FaCalendarAlt className="mr-1.5 h-4 w-4" />
                          {new Date(team.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                        View Details
                        <FaArrowRight className="ml-1.5 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
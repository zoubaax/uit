import { useState, useEffect } from 'react'
import { useTeams } from '../hooks/useTeams'
import { Link } from 'react-router-dom'

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

  const teamsWithRanking = []
  let currentRank = 1
  sortedTeams.forEach((team, index) => {
    let rank = null
    if (team.score !== null && team.score !== undefined) {
      if (index > 0 && 
          sortedTeams[index - 1].score !== null &&
          sortedTeams[index - 1].score !== undefined &&
          team.score === sortedTeams[index - 1].score) {
        rank = teamsWithRanking[index - 1].rank
      } else {
        rank = currentRank
        currentRank++
      }
    }
    teamsWithRanking.push({ ...team, rank })
  })

  // Top teams for banner
  const topTeams = teamsWithRanking.filter(t => t.score !== null && t.score !== undefined).slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                Teams
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                View all teams and their rankings
              </p>
            </div>
          </div>

          {/* Top Teams Banner */}
          {topTeams.length > 0 && (
            <div className="mb-8 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-amber-900/20 rounded-2xl border-2 border-amber-200 dark:border-amber-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <svg className="h-8 w-8 text-amber-600 dark:text-amber-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Teams Leaderboard</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topTeams.map((team) => (
                  <div key={team.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-amber-200 dark:border-amber-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          team.rank === 1 
                            ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' 
                            : team.rank === 2
                            ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800'
                            : 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                        }`}>
                          {team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : '🥉'}
                        </div>
                        {team.logo_url ? (
                          <img
                            src={team.logo_url}
                            alt={`${team.name} logo`}
                            className="h-8 w-8 object-cover rounded-lg border border-amber-200 dark:border-amber-800 flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        ) : null}
                      </div>
                      <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        {Math.round(parseFloat(team.score))}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{team.name}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-2xl p-6 shadow-sm border border-indigo-100 dark:border-indigo-800/30">
              <div className="flex items-center">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm mr-4">
                  <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Teams</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '...' : teams.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-2xl p-6 shadow-sm border border-emerald-100 dark:border-emerald-800/30">
              <div className="flex items-center">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm mr-4">
                  <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Teams with Scores</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {teams.filter(t => t.score !== null && t.score !== undefined).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-6 shadow-sm border border-amber-100 dark:border-amber-800/30">
              <div className="flex items-center">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm mr-4">
                  <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
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
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-2xl p-6 shadow-sm border border-purple-100 dark:border-purple-800/30">
              <div className="flex items-center">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm mr-4">
                  <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Score</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading teams...</p>
            </div>
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/30 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6">
                <svg className="h-12 w-12 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No teams yet</h3>
              <p className="text-gray-600 dark:text-gray-300">
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
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl dark:hover:shadow-3xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 transform hover:-translate-y-1 block"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {team.score !== null && team.score !== undefined && (
                          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                            team.rank === 1 
                              ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' 
                              : team.rank === 2
                              ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800'
                              : team.rank === 3
                              ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                              : 'bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white'
                          }`}>
                            {team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : team.rank === 3 ? '🥉' : `#${team.rank}`}
                          </div>
                        )}
                        {team.logo_url ? (
                          <img
                            src={team.logo_url}
                            alt={`${team.name} logo`}
                            className="h-12 w-12 object-cover rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-700 flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div className={`p-2 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-xl shadow-sm flex-shrink-0 ${team.logo_url ? 'hidden' : ''}`}>
                          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {team.name}
                          </h3>
                        </div>
                      </div>
                      
                      {team.description && (
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 leading-relaxed">
                          {team.description}
                        </p>
                      )}
                      
                      {team.score !== null && team.score !== undefined && (
                        <div className="mb-4">
                          <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-200 dark:border-amber-800">
                            <svg className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                              Score: {Math.round(parseFloat(team.score))}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(team.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                        View Details
                        <svg className="ml-1.5 h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
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


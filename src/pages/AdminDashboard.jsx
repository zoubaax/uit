import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTeams } from '../hooks/useTeams'
import { useAllNotes } from '../hooks/useAllNotes'
import { useAllEvaluations } from '../hooks/useAllEvaluations'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { admin } = useAuth()
  const { teams, loading: teamsLoading } = useTeams()
  const { notes, loading: notesLoading } = useAllNotes()
  const { evaluations, loading: evalsLoading } = useAllEvaluations()

  const [stats, setStats] = useState({
    totalTeams: 0,
    totalNotes: 0,
    totalEvaluations: 0,
    averageRating: 0,
    recentNotes: 0,
    recentEvaluations: 0,
    teamsWithNotes: 0,
    weeksCovered: 0
  })

  useEffect(() => {
    if (!teamsLoading && !notesLoading && !evalsLoading) {
      // Calculate unique weeks from evaluations
      const weeks = new Set()
      evaluations.forEach(evaluation => {
        if (evaluation.week_start_date) weeks.add(evaluation.week_start_date)
      })
      
      // Calculate average rating
      const avgRating = evaluations.length > 0 
        ? (evaluations.reduce((sum, evalItem) => sum + (evalItem.rating || 0), 0) / evaluations.length).toFixed(1)
        : 0
  
      // Calculate recent activity (last 7 days)
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 7)
      
      const recentNotes = notes.filter(note => 
        new Date(note.created_at) > lastWeek
      ).length
      
      const recentEvaluations = evaluations.filter(evaluation => 
        new Date(evaluation.created_at) > lastWeek
      ).length
  
      setStats({
        totalTeams: teams.length,
        totalNotes: notes.length,
        totalEvaluations: evaluations.length,
        averageRating: avgRating,
        recentNotes,
        recentEvaluations,
        teamsWithNotes: new Set(notes.map(n => n.team_id)).size,
        weeksCovered: weeks.size
      })
    }
  }, [teams, notes, evaluations, teamsLoading, notesLoading, evalsLoading])

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // Format date for display
  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Get performance trend
  const getPerformanceTrend = () => {
    if (stats.averageRating >= 4.5) return 'Excellent'
    if (stats.averageRating >= 4) return 'Great'
    if (stats.averageRating >= 3) return 'Good'
    if (stats.averageRating >= 2) return 'Needs Improvement'
    return 'Poor'
  }

  const getPerformanceColor = () => {
    if (stats.averageRating >= 4.5) return 'text-emerald-400'
    if (stats.averageRating >= 4) return 'text-green-400'
    if (stats.averageRating >= 3) return 'text-yellow-400'
    if (stats.averageRating >= 2) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white">
                    {getGreeting()}, {admin?.name || admin?.email?.split('@')[0]}
                  </h1>
                  <p className="text-gray-300 text-lg mt-2">
                    {formatDate()}
                  </p>
                </div>
              </div>
              <p className="text-gray-400 max-w-3xl">
                Welcome to your admin dashboard. Here's an overview of your team management system.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Teams Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-sm border border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-indigo-500">
              <div className="flex items-center">
                <div className="p-3 bg-gray-800 rounded-xl shadow-sm mr-4 border border-gray-700">
                  <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Teams</p>
                  <p className="text-3xl font-bold text-white">
                    {teamsLoading ? '...' : stats.totalTeams}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <Link
                  to="/admin/teams"
                  className="inline-flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                >
                  Manage teams
                  <svg className="ml-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Notes Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-sm border border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-500">
              <div className="flex items-center">
                <div className="p-3 bg-gray-800 rounded-xl shadow-sm mr-4 border border-gray-700">
                  <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Notes</p>
                  <p className="text-3xl font-bold text-white">
                    {notesLoading ? '...' : stats.totalNotes}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-400">
                  {stats.recentNotes} new in last 7 days • {stats.teamsWithNotes} teams with notes
                </div>
                <Link
                  to="/admin/notes"
                  className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors mt-2"
                >
                  View all notes
                  <svg className="ml-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Evaluations Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-sm border border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-500">
              <div className="flex items-center">
                <div className="p-3 bg-gray-800 rounded-xl shadow-sm mr-4 border border-gray-700">
                  <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Evaluations</p>
                  <p className="text-3xl font-bold text-white">
                    {evalsLoading ? '...' : stats.totalEvaluations}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-400">
                  {stats.recentEvaluations} new in last 7 days • {stats.weeksCovered} weeks covered
                </div>
                <Link
                  to="/admin/evaluations"
                  className="inline-flex items-center text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:underline transition-colors mt-2"
                >
                  View evaluations
                  <svg className="ml-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Performance Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-sm border border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-amber-500">
              <div className="flex items-center">
                <div className="p-3 bg-gray-800 rounded-xl shadow-sm mr-4 border border-gray-700">
                  <svg className="h-6 w-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Average Rating</p>
                  <p className="text-3xl font-bold text-white">
                    {evalsLoading ? '...' : stats.averageRating}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className={`text-sm font-medium ${getPerformanceColor()}`}>
                  {getPerformanceTrend()} Performance
                </div>
                <div className="flex items-center space-x-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`h-4 w-4 ${star <= stats.averageRating ? 'text-yellow-400' : 'text-gray-600'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions & Recent Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-indigo-700 to-purple-800">
                <h2 className="text-xl font-bold text-white">Quick Actions</h2>
                <p className="text-indigo-200 mt-1">
                  Manage your team system efficiently
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    to="/admin/teams"
                    className="group p-5 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl hover:shadow-lg hover:border-indigo-500 transition-all duration-300"
                  >
                    <div className="flex items-center">
                      <div className="p-3 bg-gray-800 rounded-lg shadow-sm mr-4 border border-gray-700">
                        <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          Manage Teams
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Create, edit, and organize your teams
                        </p>
                      </div>
                      <svg className="h-5 w-5 text-gray-400 group-hover:text-indigo-300 transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </Link>

                  <Link
                    to="/admin/notes"
                    className="group p-5 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl hover:shadow-lg hover:border-blue-500 transition-all duration-300"
                  >
                    <div className="flex items-center">
                      <div className="p-3 bg-gray-800 rounded-lg shadow-sm mr-4 border border-gray-700">
                        <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                          View Notes
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Review and manage team notes
                        </p>
                      </div>
                      <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-300 transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </Link>

                  <Link
                    to="/admin/evaluations"
                    className="group p-5 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl hover:shadow-lg hover:border-emerald-500 transition-all duration-300"
                  >
                    <div className="flex items-center">
                      <div className="p-3 bg-gray-800 rounded-lg shadow-sm mr-4 border border-gray-700">
                        <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                          Weekly Evaluations
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Track team performance weekly
                        </p>
                      </div>
                      <svg className="h-5 w-5 text-gray-400 group-hover:text-emerald-300 transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </Link>

                  <div className="group p-5 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl hover:shadow-lg hover:border-purple-500 transition-all duration-300">
                    <div className="flex items-center">
                      <div className="p-3 bg-gray-800 rounded-lg shadow-sm mr-4 border border-gray-700">
                        <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                          Analytics & Reports
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          View detailed insights and analytics
                        </p>
                      </div>
                      <svg className="h-5 w-5 text-gray-400 group-hover:text-purple-300 transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Teams Leaderboard */}
            <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-amber-700 to-yellow-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">🏆 Top Teams</h2>
                    <p className="text-amber-200 mt-1">
                      Ranked by score
                    </p>
                  </div>
                  <Link
                    to="/admin/teams"
                    className="text-sm font-medium text-white hover:text-amber-300 hover:underline transition-colors"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {teamsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                  </div>
                ) : (() => {
                  // Sort teams by score and assign rankings
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
                  
                  if (teamsWithRanking.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <h3 className="mt-4 text-sm font-medium text-gray-100">No scores yet</h3>
                        <p className="mt-1 text-sm text-gray-400">Add scores to teams to see rankings</p>
                      </div>
                    )
                  }
                  
                  return (
                    <div className="space-y-3">
                      {teamsWithRanking.slice(0, 5).map((team) => (
                        <div key={team.id} className="flex items-center p-4 rounded-xl border border-gray-700 hover:bg-gray-800/50 transition-all hover:shadow-md">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm mr-4 ${
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
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate">{team.name}</h4>
                            <div className="flex items-center mt-1">
                              <span className="text-xs font-medium text-amber-400">
                                Score: {Math.round(parseFloat(team.score))}
                              </span>
                            </div>
                          </div>
                          <Link
                            to={`/admin/teams`}
                            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors ml-2"
                          >
                            View
                          </Link>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Recent Teams */}
            <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-gray-800 to-gray-900">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Recent Teams</h2>
                    <p className="text-gray-300 mt-1">
                      Latest teams in your organization
                    </p>
                  </div>
                  <Link
                    to="/admin/teams"
                    className="text-sm font-medium text-white hover:text-gray-200 hover:underline transition-colors"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {teamsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
                  </div>
                ) : teams.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-4 text-sm font-medium text-gray-100">No teams yet</h3>
                    <p className="mt-1 text-sm text-gray-400">Create your first team to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teams.slice(0, 4).map((team) => (
                      <div key={team.id} className="flex items-center p-4 rounded-lg border border-gray-700 hover:bg-gray-800/50 transition-colors">
                        <div className="flex-shrink-0 p-2 bg-indigo-900/30 rounded-lg border border-indigo-800/30">
                          <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="text-sm font-medium text-white">{team.name}</h4>
                          <p className="text-xs text-gray-400 mt-1">
                            Created {new Date(team.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                        <Link
                          to={`/admin/teams`}
                          className="text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - System Status & Tips */}
          <div className="space-y-8">
            {/* System Status */}
            <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-gray-800 to-gray-900">
                <h2 className="text-xl font-bold text-white">System Status</h2>
                <p className="text-gray-300 mt-1">
                  Current status of your team management system
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-900/30 rounded-lg border border-green-800/30">
                        <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="ml-3 text-sm font-medium text-white">Database</span>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-900/30 text-green-400 border border-green-800/30">
                      Connected
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-900/30 rounded-lg border border-green-800/30">
                        <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="ml-3 text-sm font-medium text-white">Authentication</span>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-900/30 text-green-400 border border-green-800/30">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-900/30 rounded-lg border border-green-800/30">
                        <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="ml-3 text-sm font-medium text-white">API Services</span>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-900/30 text-green-400 border border-green-800/30">
                      Operational
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-900/30 rounded-lg border border-yellow-800/30">
                        <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="ml-3 text-sm font-medium text-white">Data Backup</span>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-800/30">
                      Pending
                    </span>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-700">
                    <div className="text-xs text-gray-400">
                      Last updated: {new Date().toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips & Updates */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-900/30 rounded-lg border border-blue-800/30">
                  <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h1m0 0h-1m1 0v4m0-11.25V6H9.75a2.25 2.25 0 00-2.25 2.25v6.5a2.25 2.25 0 002.25 2.25h4.5A2.25 2.25 0 0016.5 15v-6.5a2.25 2.25 0 00-2.25-2.25H13z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-white">Quick Tips</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Use weekly evaluations to track team progress consistently.</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Add detailed notes after important meetings or milestones.</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Review performance trends in the weekly summary reports.</span>
                </li>
              </ul>
            </div>

            {/* Need Help? */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-900/30 rounded-lg border border-purple-800/30">
                  <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-white">Need Help?</h3>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                Get assistance with managing your teams and tracking performance.
              </p>
              <button className="w-full px-4 py-2 bg-gray-800 border border-purple-700 text-purple-400 rounded-lg hover:bg-purple-900/20 hover:text-purple-300 transition-colors text-sm font-medium">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
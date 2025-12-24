import { useState, useEffect } from 'react'
import { useTeams } from '../hooks/useTeams'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
// Using public logo
import logo from '../assets/logo.png'
import {
  FaUsers,
  FaFileAlt,
  FaStar,
  FaChartBar,
  FaTrophy,
  FaArrowRight,
  FaInfoCircle,
  FaBolt,
  FaCheckCircle
} from 'react-icons/fa'

export default function PublicHome() {
  const { teams, loading } = useTeams()
  const [teamsWithMembers, setTeamsWithMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalMembers: 0,
    topTeam: null,
    averageRating: 0
  })

  useEffect(() => {
    const fetchAllData = async () => {
      if (!teams.length) {
        setMembersLoading(false)
        return
      }

      try {
        setMembersLoading(true)
        
        const [membersResult, evaluationsResult] = await Promise.all([
          supabase.from('team_members').select('*'),
          supabase.from('weekly_evaluations').select('*')
        ])

        if (membersResult.error) throw membersResult.error
        if (evaluationsResult.error) throw evaluationsResult.error

        const membersByTeam = {}
        membersResult.data?.forEach(member => {
          if (!membersByTeam[member.team_id]) {
            membersByTeam[member.team_id] = []
          }
          membersByTeam[member.team_id].push(member)
        })

        const ratingsByTeam = {}
        evaluationsResult.data?.forEach(evaluation => {
          if (evaluation.rating !== null && evaluation.rating !== undefined) {
            if (!ratingsByTeam[evaluation.team_id]) {
              ratingsByTeam[evaluation.team_id] = []
            }
            ratingsByTeam[evaluation.team_id].push(evaluation.rating)
          }
        })

        const averageRatings = {}
        Object.keys(ratingsByTeam).forEach(teamId => {
          const ratings = ratingsByTeam[teamId]
          if (ratings.length > 0) {
            averageRatings[teamId] = ratings.reduce((a, b) => a + b, 0) / ratings.length
          }
        })

        // Sort teams by score (highest first)
        const sortedTeams = [...teams].sort((a, b) => {
          // Handle null/undefined scores by putting them at the end
          if (a.score === null || a.score === undefined) return 1
          if (b.score === null || b.score === undefined) return -1
          return b.score - a.score
        })

        // Build teams with unique ranking (no ties)
        const teamsWithRanking = []
        let currentRank = 1
        
        sortedTeams.forEach((team) => {
          // Teams without scores don't get ranks
          if (team.score === null || team.score === undefined) {
            teamsWithRanking.push({
              ...team,
              rank: null,
              members: membersByTeam[team.id] || [],
              averageRating: averageRatings[team.id] || null,
              totalEvaluations: ratingsByTeam[team.id]?.length || 0
            })
            return
          }
          
          // Assign unique rank - each team gets its own rank even if scores are tied
          // This ensures no ties on the podium
          const rank = currentRank
          currentRank++
          
          teamsWithRanking.push({
            ...team,
            rank,
            members: membersByTeam[team.id] || [],
            averageRating: averageRatings[team.id] || null,
            totalEvaluations: ratingsByTeam[team.id]?.length || 0
          })
        })
        
        // Calculate stats
        const totalMembers = Object.values(membersByTeam).reduce((sum, members) => sum + members.length, 0)
        const ratedTeams = teamsWithRanking.filter(t => t.averageRating)
        const avgRating = ratedTeams.length > 0 
          ? ratedTeams.reduce((sum, team) => sum + team.averageRating, 0) / ratedTeams.length 
          : 0

        setStats({
          totalTeams: teams.length,
          totalMembers,
          topTeam: teamsWithRanking.find(t => t.rank === 1) || null,
          averageRating: avgRating
        })

        setTeamsWithMembers(teamsWithRanking)
      } catch (err) {
        console.error('Error fetching data:', err)
        setTeamsWithMembers(teams.map(team => ({ ...team, members: [], averageRating: null, totalEvaluations: 0 })))
      } finally {
        setMembersLoading(false)
      }
    }

    if (!loading) {
      fetchAllData()
    }
  }, [teams, loading])

  const getTopTeams = (count = 3) => {
    return teamsWithMembers
      .filter(team => team.rank !== null)
      .sort((a, b) => a.rank - b.rank) // Sort by rank to ensure 1, 2, 3 order
      .slice(0, count)
  }

  const getMedalColor = (rank) => {
    switch(rank) {
      case 1: return 'from-yellow-400 to-amber-500 text-white'
      case 2: return 'from-gray-400 to-gray-500 text-white'
      case 3: return 'from-amber-600 to-amber-700 text-white'
      default: return 'from-blue-900/80 to-blue-800 text-blue-100'
    }
  }

  const getMedalIcon = (rank) => {
    switch(rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  const getRatingColor = (rating) => {
    if (!rating) return 'text-gray-400'
    if (rating >= 4.5) return 'text-emerald-400'
    if (rating >= 4.0) return 'text-green-400'
    if (rating >= 3.0) return 'text-amber-400'
    return 'text-red-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900/30">
        <div className="absolute inset-0 bg-grid-gray-800 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            
            <div className="flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                  <img 
                    src={logo} // Use the imported logo variable
                    alt="Logo"
                    className="h-16 w-auto" // Adjust size as needed
                  />
                </div>
            
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Team Performance
              <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent mt-2">
                Leaderboard
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
              Track, compare, and celebrate team achievements. Discover top-performing teams and their journey to excellence.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/teams"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl border border-blue-500/30"
              >
                Explore All Teams
                <FaArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <button className="inline-flex items-center px-6 py-3 rounded-lg bg-gray-800 text-gray-200 font-semibold border border-gray-700 hover:border-gray-600 hover:bg-gray-750 transition-all shadow-sm hover:shadow">
                <FaInfoCircle className="mr-2 w-5 h-5" />
                How It Works
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-12 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-colors group">
              <div className="flex items-center">
                <div className="p-3 bg-blue-900/30 rounded-xl mr-4 group-hover:bg-blue-900/50 transition-colors">
                  <FaUsers className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-blue-300 font-medium">Active Teams</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.totalTeams}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-emerald-500/50 transition-colors group">
              <div className="flex items-center">
                <div className="p-3 bg-emerald-900/30 rounded-xl mr-4 group-hover:bg-emerald-900/50 transition-colors">
                  <FaUsers className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-emerald-300 font-medium">Total Members</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.totalMembers}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-amber-500/50 transition-colors group">
              <div className="flex items-center">
                <div className="p-3 bg-amber-900/30 rounded-xl mr-4 group-hover:bg-amber-900/50 transition-colors">
                  <FaStar className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-amber-300 font-medium">Avg. Rating</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-colors group">
              <div className="flex items-center">
                <div className="p-3 bg-purple-900/30 rounded-xl mr-4 group-hover:bg-purple-900/50 transition-colors">
                  <FaChartBar className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-purple-300 font-medium">Top Score</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {stats.topTeam?.score ? Math.round(parseFloat(stats.topTeam.score)) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Teams Section */}
      <section className="py-16 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Top Performing Teams</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Celebrating excellence and outstanding performance across all teams
            </p>
          </div>

          {loading || membersLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-blue-500"></div>
              <p className="mt-4 text-gray-400">Loading leaderboard...</p>
            </div>
          ) : teamsWithMembers.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-700">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No teams yet</h3>
              <p className="text-gray-400">Be the first to create a team and start tracking performance!</p>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              <div className="py-12 mb-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto items-end">
                  {getTopTeams(3).map((team) => {
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
                    <div 
                      key={team.id}
                      className={`relative rounded-2xl border-2 backdrop-blur-sm ${orderClass} ${
                        team.rank === 1 
                          ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-amber-500/30 shadow-2xl p-8 md:-mt-8 md:transform md:scale-105' 
                          : 'bg-gradient-to-b from-gray-800/80 to-gray-900 border-gray-700 shadow-lg p-6'
                      }`}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                        <div className={`rounded-full flex items-center justify-center text-2xl font-bold shadow-2xl bg-gradient-to-br ${getMedalColor(team.rank)} ring-2 ring-gray-800 ${
                          team.rank === 1 ? 'w-16 h-16' : 'w-14 h-14'
                        }`}>
                          {getMedalIcon(team.rank)}
                        </div>
                      </div>
                      
                      <div className={`text-center ${
                        team.rank === 1 ? 'pt-10' : 'pt-8'
                      }`}>
                        <div>
                          {team.logo_url && (
                            <div className="mb-4 flex justify-center">
                              <img
                                src={team.logo_url}
                                alt={`${team.name} logo`}
                                className={`object-cover rounded-xl border-2 border-gray-700 shadow-lg ${
                                  team.rank === 1 ? 'h-24 w-24' : 'h-20 w-20'
                                }`}
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                }}
                              />
                            </div>
                          )}
                          <h3 className={`font-bold text-white mb-2 ${
                            team.rank === 1 ? 'text-2xl' : 'text-xl'
                          }`}>{team.name}</h3>
                          {team.description && (
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{team.description}</p>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-lg font-bold text-white">
                              Score: {Math.round(parseFloat(team.score))}
                            </span>
                          </div>
                          
                          {team.averageRating && (
                            <div className="flex items-center justify-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-5 h-5 ${star <= Math.round(team.averageRating) ? 'text-amber-500' : 'text-gray-700'}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className={`text-sm ml-1 ${getRatingColor(team.averageRating)}`}>
                                {team.averageRating.toFixed(1)}
                              </span>
                            </div>
                          )}
                          
                          <Link
                            to={`/teams/${team.id}`}
                            className="inline-flex items-center justify-center w-full py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 transition-all font-medium text-sm border border-blue-500/30"
                          >
                            View Team
                          </Link>
                        </div>
                      </div>
                    </div>
                    )
                  })}
                </div>
              </div>

              {/* All Teams Grid */}
              {teamsWithMembers.length > 3 && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-white">All Teams</h3>
                    <Link 
                      to="/teams" 
                      className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2 transition-colors"
                    >
                      View All
                      <FaArrowRight className="w-5 h-5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teamsWithMembers.slice(3, 9).map((team) => (
                      <div key={team.id} className="bg-gradient-to-b from-gray-800/80 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 hover:shadow-xl transition-all group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              {team.logo_url ? (
                                <img
                                  src={team.logo_url}
                                  alt={`${team.name} logo`}
                                  className="h-12 w-12 object-cover rounded-lg border-2 border-gray-700 flex-shrink-0"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                  }}
                                />
                              ) : null}
                              {team.rank && (
                                <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center font-bold text-gray-200 group-hover:bg-gray-600 transition-colors">
                                  #{team.rank}
                                </div>
                              )}
                              <div>
                                <h4 className="font-bold text-white group-hover:text-blue-100 transition-colors">{team.name}</h4>
                                {team.score !== null && team.score !== undefined && (
                                  <p className="text-sm text-blue-300 font-medium">
                                    Score: {Math.round(parseFloat(team.score))}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {team.description && (
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{team.description}</p>
                        )}

                        <div className="flex items-center justify-between mt-6">
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                              {team.members.slice(0, 3).map((member, index) => (
                                <div
                                  key={member.id}
                                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-gray-800"
                                  style={{ zIndex: 3 - index }}
                                  title={member.name}
                                >
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                              ))}
                              {team.members.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-xs font-semibold border-2 border-gray-800">
                                  +{team.members.length - 3}
                                </div>
                              )}
                            </div>
                            <span className="text-sm text-gray-400">{team.members.length} members</span>
                          </div>

                          <Link
                            to={`/teams/${team.id}`}
                            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
                          >
                            Details
                            <FaArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-gray-800 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl mb-6 ring-2 ring-blue-500/30">
            <FaBolt className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-6">Ready to track your team's performance?</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of teams already using our platform to measure success and drive improvement.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl border border-blue-500/30"
            >
              Get Started Free
            </Link>
            <Link
              to="/demo"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-transparent border-2 border-gray-700 text-gray-200 font-semibold hover:border-blue-500/50 hover:text-blue-100 transition-all"
            >
              Schedule a Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
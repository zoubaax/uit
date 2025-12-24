import { useParams } from 'react-router-dom'
import { useNotes } from '../hooks/useNotes'
import { useTeam } from '../hooks/useTeam'
import { useTeamMembers } from '../hooks/useTeamMembers'
import { useWeeklyEvaluations } from '../hooks/useWeeklyEvaluations'
import { useMemo } from 'react'

export default function TeamDetail() {
  const { teamId } = useParams()
  const { team, loading: teamLoading } = useTeam(teamId)
  const { notes, loading: notesLoading } = useNotes(teamId)
  const { members, loading: membersLoading } = useTeamMembers(teamId)
  const { evaluations, loading: evaluationsLoading } = useWeeklyEvaluations(teamId)

  // Calculate average rating
  const averageRating = useMemo(() => {
    const ratings = evaluations
      .map(evaluation => evaluation.rating)
      .filter(r => r !== null && r !== undefined)
    
    if (ratings.length === 0) return null
    return ratings.reduce((a, b) => a + b, 0) / ratings.length
  }, [evaluations])

  if (teamLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-950 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400"></div>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 font-medium">Loading team...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-950 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-blue-200 dark:border-blue-900/50">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
              <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xl text-gray-700 dark:text-gray-300 font-semibold">Team not found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Team Header */}
        <div className="mb-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-blue-200 dark:border-blue-900/50 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 dark:from-blue-600 dark:via-indigo-700 dark:to-blue-800 p-8">
            <div className="flex items-center gap-6 mb-4">
              {team.logo_url ? (
                <img
                  src={team.logo_url}
                  alt={`${team.name} logo`}
                  className="h-20 w-20 lg:h-24 lg:w-24 object-cover rounded-2xl shadow-lg border-2 border-white/30 flex-shrink-0"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              <div className={`p-4 lg:p-5 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 flex-shrink-0 ${team.logo_url ? 'hidden' : ''}`}>
                <svg className="h-12 w-12 lg:h-16 lg:w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-3 drop-shadow-lg">{team.name}</h2>
              </div>
            </div>
            {team.description && (
              <p className="text-lg text-blue-50 dark:text-blue-100 mb-4 leading-relaxed">{team.description}</p>
            )}
            <div className="flex flex-wrap gap-3">
              {team.score !== null && team.score !== undefined && (
                <div className="inline-flex items-center px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
                  <div className="p-2 bg-white/30 rounded-lg mr-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-white/80 font-medium uppercase tracking-wide">Score</p>
                    <p className="text-2xl font-bold text-white">
                      {Math.round(parseFloat(team.score))}
                    </p>
                  </div>
                </div>
              )}
              {averageRating !== null && (
                <div className="inline-flex items-center px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
                  <div className="p-2 bg-white/30 rounded-lg mr-3">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-white/80 font-medium uppercase tracking-wide">Rating</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-white">
                        {averageRating.toFixed(1)}
                      </p>
                      <div className="flex items-center space-x-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-4 w-4 ${star <= Math.round(averageRating) ? 'text-yellow-300' : 'text-white/30'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    {evaluations.length > 0 && (
                      <p className="text-xs text-white/60 mt-1">
                        {evaluations.length} {evaluations.length === 1 ? 'evaluation' : 'evaluations'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        {members.length > 0 && (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 mb-8 border-2 border-blue-200 dark:border-blue-900/50">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-4 shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Team Members <span className="text-blue-600 dark:text-blue-400">({members.length})</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-100 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg mr-4 shadow-md ring-2 ring-blue-200 dark:ring-blue-800">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 dark:text-white truncate text-lg">
                    {member.name}
                  </h4>
                  {member.role && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 truncate font-semibold mt-1">
                      {member.role}
                    </p>
                  )}
                  {member.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                      {member.email}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Notes List */}
        <div className="space-y-6">
        {notesLoading ? (
          <div className="text-center py-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-blue-200 dark:border-blue-900/50">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-blue-200 dark:border-blue-900/50">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold">No notes yet.</p>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Notes will appear here when available.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border-2 border-blue-100 dark:border-blue-900/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {note.category && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white mb-3 shadow-md">
                      {note.category}
                    </span>
                  )}
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed text-base">
                    {note.content}
                  </p>
                  <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(note.created_at).toLocaleString()}
                    {note.created_by && (
                      <span className="ml-3 inline-flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        By Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        </div>
      </div>
    </div>
  )
}


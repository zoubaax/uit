import { useMemo } from 'react'
import StarRating from './StarRating'

export default function WeeklySummary({ evaluations, weekStartDate }) {
  const weekEvaluations = useMemo(() => {
    if (!weekStartDate) return []
    return evaluations.filter(evaluation => evaluation.week_start_date === weekStartDate)
  }, [evaluations, weekStartDate])

  const stats = useMemo(() => {
    if (weekEvaluations.length === 0) return null

    const ratings = weekEvaluations
      .map(evaluation => evaluation.rating)
      .filter(r => r !== null && r !== undefined)
    
    if (ratings.length === 0) return null

    const average = ratings.reduce((a, b) => a + b, 0) / ratings.length
    const min = Math.min(...ratings)
    const max = Math.max(...ratings)
    const total = weekEvaluations.length

    return {
      average: average.toFixed(2),
      min,
      max,
      total,
      ratingsCount: ratings.length,
    }
  }, [weekEvaluations])

  if (!weekStartDate) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">Please select a week to view summary</p>
      </div>
    )
  }

  const weekDate = new Date(weekStartDate)
  const weekEndDate = new Date(weekDate)
  weekEndDate.setDate(weekEndDate.getDate() + 6)

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Weekly Summary
        </h3>
        <p className="text-sm text-gray-500">
          Week of {weekDate.toLocaleDateString()} - {weekEndDate.toLocaleDateString()}
        </p>
      </div>

      {weekEvaluations.length === 0 ? (
        <p className="text-gray-500">No evaluations for this week</p>
      ) : (
        <div className="space-y-4">
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Total Evaluations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Average Rating</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.average}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Highest Rating</p>
                <p className="text-2xl font-bold text-green-600">{stats.max}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Lowest Rating</p>
                <p className="text-2xl font-bold text-red-600">{stats.min}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Team Evaluations:</h4>
            {weekEvaluations.map((evaluation) => {
              const team = evaluation.teams
              return (
                <div
                  key={evaluation.id}
                  className="border-l-4 border-indigo-500 pl-4 py-2 bg-gray-50 rounded"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {team?.name || 'Unknown Team'}
                      </p>
                      <div className="mt-1">
                        <StarRating rating={evaluation.rating || 0} editable={false} />
                      </div>
                      {evaluation.feedback && (
                        <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                          {evaluation.feedback}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}


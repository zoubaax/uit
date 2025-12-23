export default function NotePreview({ note, teamName }) {
  if (!note) return null

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Preview</h3>
        <p className="text-sm text-gray-500">
          How this note will appear in the public view
        </p>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-start mb-2">
          {teamName && (
            <h4 className="text-sm font-medium text-gray-900">{teamName}</h4>
          )}
        </div>
        
        {note.category && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-2">
            {note.category}
          </span>
        )}
        
        <p className="text-gray-900 whitespace-pre-wrap mt-2">
          {note.content}
        </p>
        
        <p className="mt-4 text-sm text-gray-500">
          {new Date(note.created_at || Date.now()).toLocaleString()}
          {note.created_by && ' • By Admin'}
          {!note.created_by && ' • Anonymous'}
        </p>
      </div>
    </div>
  )
}


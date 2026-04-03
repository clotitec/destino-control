'use client'

type Props = {
  narrativa: string
  municipio?: string
  periodo?: string
}

export default function InformePreview({ narrativa, municipio, periodo }: Props) {
  // Simple markdown-to-HTML for headers, bold, tables
  const renderNarrativa = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-2xl font-bold text-gray-900 mt-6 mb-2">{line.slice(2)}</h1>
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-semibold text-gray-800 mt-5 mb-2">{line.slice(3)}</h2>
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-semibold text-gray-700 mt-4 mb-2">{line.slice(4)}</h3>
      }
      if (line.startsWith('- **') || line.startsWith('- ')) {
        const content = line.slice(2)
        return (
          <li key={i} className="text-sm text-gray-700 ml-4 my-1 list-disc"
            dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        )
      }
      if (line.startsWith('|')) {
        return (
          <div key={i} className="text-sm text-gray-600 font-mono whitespace-pre overflow-x-auto">
            {line}
          </div>
        )
      }
      if (line.match(/^\d+\.\s/)) {
        const content = line.replace(/^\d+\.\s/, '')
        return (
          <li key={i} className="text-sm text-gray-700 ml-4 my-1 list-decimal"
            dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        )
      }
      if (line.trim() === '') {
        return <br key={i} />
      }
      return (
        <p key={i} className="text-sm text-gray-700 my-1"
          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />
      )
    })
  }

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 p-8 shadow-lg shadow-black/5">
      <div className="max-w-3xl mx-auto">
        {municipio && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Informe de turismo digital</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">{municipio}</h2>
            {periodo && <p className="text-sm text-gray-500 mt-1">{periodo}</p>}
          </div>
        )}
        <div className="prose-sm">
          {renderNarrativa(narrativa)}
        </div>
      </div>
    </div>
  )
}

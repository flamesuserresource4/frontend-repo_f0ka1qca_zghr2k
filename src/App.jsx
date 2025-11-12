import { useState } from 'react'

function App() {
  const [prompt, setPrompt] = useState('A serene watercolor landscape of mountains at sunrise')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [provider, setProvider] = useState('auto')
  const [size, setSize] = useState('512')

  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const handleGenerate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setImage(null)

    const [w, h] = [parseInt(size), parseInt(size)]

    try {
      const res = await fetch(`${backend}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, width: w, height: h, provider: provider === 'auto' ? undefined : provider })
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to generate image')
      }

      const data = await res.json()
      setImage(`data:image/png;base64,${data.image_b64}`)
      if (data.note) {
        setError(data.note)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <header className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">AI Art Generator</h1>
        <p className="text-slate-600 mt-2">Type a prompt and create an image. Works with real AI if a key is set, otherwise shows a high-quality demo image.</p>
      </header>
      <main className="max-w-5xl mx-auto px-6 pb-12 grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleGenerate} className="bg-white/70 backdrop-blur rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Your prompt</label>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} className="w-full rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-3" placeholder="Describe the image you want..." />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Size</label>
              <select value={size} onChange={e => setSize(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2">
                <option value="256">256 x 256</option>
                <option value="512">512 x 512</option>
                <option value="768">768 x 768</option>
                <option value="1024">1024 x 1024</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Provider</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setProvider('auto')} className={`px-3 py-2 rounded-lg border ${provider==='auto' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300'}`}>Auto</button>
                <button type="button" onClick={() => setProvider('stability')} className={`px-3 py-2 rounded-lg border ${provider==='stability' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300'}`}>Stability</button>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition">
            {loading ? 'Generating...' : 'Generate Image'}
          </button>

          {error && (
            <p className="text-xs text-slate-600 bg-amber-50 border border-amber-200 p-2 rounded">{error}</p>
          )}
        </form>

        <div className="bg-white/70 backdrop-blur rounded-xl shadow p-6 flex items-center justify-center min-h-[400px]">
          {image ? (
            <img src={image} alt="Generated" className="max-w-full max-h-[600px] rounded-lg shadow" />
          ) : (
            <div className="text-center text-slate-500">
              <p className="font-medium">Your artwork will appear here</p>
              <p className="text-sm">Use a descriptive prompt for best results</p>
            </div>
          )}
        </div>
      </main>
      <footer className="text-center text-slate-500 text-sm pb-8">
        Tip: Add a Stability API key as an environment variable to enable real AI generation.
      </footer>
    </div>
  )
}

export default App

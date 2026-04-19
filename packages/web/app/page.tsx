'use client';

import { useState } from 'react';

interface GenerateResponse {
  feature: string;
  stepDefinitions?: string;
  model: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState(
    'Validar el formulario de contacto de la landing: nombre, email y mensaje obligatorios; email inválido muestra error; envío exitoso muestra confirmación.',
  );
  const [withSteps, setWithSteps] = useState(true);
  const [model, setModel] = useState('claude-haiku-4-5-20251001');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, withSteps, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generación falló.');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function download(filename: string, contents: string) {
    const blob = new Blob([contents], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main>
      <header className="hero">
        <h1>Kraken Lab — AI Feature Studio</h1>
        <p>
          Describe tu caso de prueba en español. Generamos un <code>.feature</code> en dialecto
          Kraken (tags <code>@user1 @web</code>, placeholders <code>&lt;VAR&gt;</code>, faker{' '}
          <code>$name_1</code>) y opcionalmente los step definitions WebdriverIO.
        </p>
      </header>

      <form onSubmit={onSubmit}>
        <div className="panel">
          <label htmlFor="prompt">Descripción del caso de prueba</label>
          <textarea
            id="prompt"
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: Validar login con credenciales válidas e inválidas."
            required
          />
          <div className="row">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={withSteps}
                onChange={(e) => setWithSteps(e.target.checked)}
              />
              Generar también step definitions (WebdriverIO)
            </label>
          </div>
          <div className="row">
            <label htmlFor="model" style={{ marginBottom: 0 }}>Modelo:</label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="claude-haiku-4-5-20251001">Haiku 4.5 (rápido)</option>
              <option value="claude-sonnet-4-6">Sonnet 4.6 (balance)</option>
              <option value="claude-opus-4-7">Opus 4.7 (máxima calidad)</option>
            </select>
            <button type="submit" disabled={loading || !prompt.trim()}>
              {loading ? 'Generando…' : 'Generar'}
            </button>
          </div>
          {error && <div className="error">{error}</div>}
        </div>
      </form>

      {result && (
        <div className="output">
          <div className="panel">
            <div className="output-header">
              <h3>
                <span className="badge">feature</span>&nbsp; .feature (Kraken dialect)
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => navigator.clipboard.writeText(result.feature)}
                >
                  Copiar
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => download('generated.feature', result.feature)}
                >
                  Descargar
                </button>
              </div>
            </div>
            <pre>{result.feature}</pre>
          </div>

          {result.stepDefinitions && (
            <div className="panel">
              <div className="output-header">
                <h3>
                  <span className="badge">steps</span>&nbsp; step definitions (WebdriverIO)
                </h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => navigator.clipboard.writeText(result.stepDefinitions!)}
                  >
                    Copiar
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => download('generated.steps.js', result.stepDefinitions!)}
                  >
                    Descargar
                  </button>
                </div>
              </div>
              <pre>{result.stepDefinitions}</pre>
            </div>
          )}

          <div style={{ color: '#8b949e', fontSize: 12, textAlign: 'right' }}>
            Generado con <strong>{result.model}</strong>
          </div>
        </div>
      )}
    </main>
  );
}

import React, { useEffect, useRef, useState } from 'react'
import './styles.css'

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : ''

export default function App() {
  const [tipo, setTipo] = useState('comum')
  const [preco, setPreco] = useState('')
  const [desconto, setDesconto] = useState('')
  const [resultado, setResultado] = useState(null)
  const [resultadoDetalhes, setResultadoDetalhes] = useState(null)
  const [historico, setHistorico] = useState([])
  const [loading, setLoading] = useState(false)
  const [historicoLoading, setHistoricoLoading] = useState(false)
  const [error, setError] = useState(null)
  const [historicoError, setHistoricoError] = useState(null)

  const pillRef = useRef(null)

  useEffect(() => { carregarHistorico() }, [])

  async function carregarHistorico() {
    setHistoricoLoading(true)
    setHistoricoError(null)
    try {
      const res = await fetch(`${API_BASE}/api/historico`)
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const data = await res.json()
      setHistorico(data)
    } catch (e) {
      console.error(e)
      setHistoricoError('Não foi possível carregar o histórico.')
      setHistorico([])
    } finally {
      setHistoricoLoading(false)
    }
  }

  async function calcular() {
    const p = parseFloat(String(preco).replace(',', '.'))
    const d = parseFloat(String(desconto).replace(',', '.')) || 0
    setError(null)
    setResultado(null)
    setResultadoDetalhes(null)

    if (isNaN(p) || p <= 0) {
      setError('Insira um valor de compra válido.')
      return
    }
    if (isNaN(d) || d < 0 || d > 100) {
      setError('Insira um desconto válido entre 0 e 100.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/cashback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_cliente: tipo === 'vip' ? 'vip' : 'normal',
          preco_original: p,
          desconto_percent: d,
        }),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const data = await res.json()
      const valorFinal = Number((p * (1 - d / 100)).toFixed(2))
      setResultado(data.cashback.toFixed(2))
      setResultadoDetalhes({
        tipo_cliente: tipo === 'vip' ? 'VIP' : 'Comum',
        preco_original: p,
        desconto_percent: d,
        valor_final: valorFinal,
        cashback: Number(data.cashback),
      })
      carregarHistorico()
    } catch (e) {
      console.error(e)
      setError('Não foi possível conectar à API.')
    } finally {
      setLoading(false)
    }
  }

  function formatBRL(val) {
    return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  }

  const sliderLeft = tipo === 'comum' ? '4px' : '50%'
  const sliderRight = tipo === 'comum' ? '50%' : '4px'

  return (
    <div className="layout">

      {/* ── LEFT CARD ── */}
      <div className="card">
        <div className="brand-title">Cashback<br />Rewards</div>
        <div className="brand-sub">Calcule o bônus da sua próxima compra</div>

        <div className="section-label">Tipo de Cliente</div>
        <div className="tipo-pill" ref={pillRef}>
          <div
            className="tipo-pill-slider"
            style={{ left: sliderLeft, right: sliderRight }}
          />
          <button
            className={tipo === 'comum' ? 'active' : ''}
            onClick={() => { setTipo('comum'); setResultado(null); setResultadoDetalhes(null) }}
          >
            Comum
          </button>
          <button
            className={tipo === 'vip' ? 'active' : ''}
            onClick={() => { setTipo('vip'); setResultado(null); setResultadoDetalhes(null) }}
          >
            VIP
          </button>
        </div>

        <div className="field">
          <label>Valor da Compra (R$)</label>
          <input
            type="number"
            placeholder="Ex: 600,00"
            value={preco}
            min="0"
            step="0.01"
            onChange={e => { setPreco(e.target.value); setResultado(null); setResultadoDetalhes(null) }}
          />
        </div>

        <div className="field">
          <label>Desconto (%) - Opcional</label>
          <input
            type="number"
            placeholder="Ex: 15,0"
            value={desconto}
            min="0"
            max="100"
            step="0.01"
            onChange={e => { setDesconto(e.target.value); setResultado(null); setResultadoDetalhes(null) }}
          />
        </div>

        <button
          className="btn-calc"
          onClick={calcular}
          disabled={loading}
        >
          {loading && <span className="spinner" />}
          {loading ? 'Calculando...' : 'Calcular Cashback'}
        </button>

        {error && <div className="error-msg">⚠️ {error}</div>}

        {resultado !== null && !error && resultadoDetalhes && (
          <div className="result-box">
            <div className="result-top">
              <div>
                <div className="result-label">Cashback a receber</div>
                <div className="result-val">R$ {formatBRL(resultado)}</div>
              </div>
              <span className="result-badge">{resultadoDetalhes.tipo_cliente}</span>
            </div>
            <div className="result-grid">
              <div className="result-item">
                <span>Valor original</span>
                <strong>R$ {formatBRL(resultadoDetalhes.preco_original)}</strong>
              </div>
              <div className="result-item">
                <span>Desconto aplicado</span>
                <strong>{resultadoDetalhes.desconto_percent.toFixed(2)}%</strong>
              </div>
              <div className="result-item">
                <span>Valor final</span>
                <strong>R$ {formatBRL(resultadoDetalhes.valor_final)}</strong>
              </div>
              <div className="result-item">
                <span>Cashback gerado</span>
                <strong>R$ {formatBRL(resultadoDetalhes.cashback)}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT CARD ── */}
      <div className="card-right">
        <div className="hist-header">
          <div>
            <div className="hist-title">Histórico (Seu IP)</div>
            <div className="hist-subtitle">
              {historicoLoading
                ? 'Carregando histórico...'
                : historicoError
                  ? historicoError
                  : historico.length
                    ? `${historico.length} consulta(s) registrada(s)`
                    : 'Ainda não há consultas no histórico.'}
            </div>
          </div>
          {!historicoLoading && !historicoError && historico.length > 0 && (
            <button className="reload-btn" onClick={carregarHistorico}>
              Atualizar
            </button>
          )}
        </div>

        {historicoLoading ? (
          <div className="empty-state">Carregando histórico...</div>
        ) : historicoError ? (
          <div className="error-msg">⚠️ {historicoError}</div>
        ) : historico.length === 0 ? (
          <div className="empty-state">Nenhuma consulta realizada ainda.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Preço</th>
                  <th>Desconto</th>
                  <th>Final</th>
                  <th>Cashback</th>
                </tr>
              </thead>
              <tbody>
                {historico.map(item => (
                  <tr key={item.id}>
                    <td>{item.data_consulta}</td>
                    <td>
                      <span className={`badge ${item.tipo_cliente === 'vip' ? 'badge-vip' : 'badge-comum'}`}>
                        {item.tipo_cliente === 'vip' ? 'VIP' : 'Comum'}
                      </span>
                    </td>
                    <td>R$ {formatBRL(item.valor_compra)}</td>
                    <td>{(item.desconto_percent || 0).toFixed(1)}%</td>
                    <td>R$ {formatBRL(item.valor_final || item.valor_compra)}</td>
                    <td className="cashback-val">R$ {formatBRL(item.cashback_gerado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

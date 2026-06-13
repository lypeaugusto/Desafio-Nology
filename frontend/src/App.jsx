import React, { useEffect, useRef, useState } from 'react'
import './styles.css'

const API_BASE = ''

export default function App() {
  const [tipo, setTipo] = useState('comum')
  const [preco, setPreco] = useState('')
  const [desconto, setDesconto] = useState('')
  const [resultado, setResultado] = useState(null)
  const [historico, setHistorico] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const pillRef = useRef(null)

  useEffect(() => { carregarHistorico() }, [])

  async function carregarHistorico() {
    try {
      const res = await fetch(`${API_BASE}/api/historico`)
      const data = await res.json()
      setHistorico(data)
    } catch (e) { console.error(e) }
  }

  async function calcular() {
    const p = parseFloat(preco)
    const d = parseFloat(desconto) || 0
    setError(null)
    setResultado(null)

    if (isNaN(p) || p <= 0) {
      setError('Insira um valor de compra válido.')
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
      setResultado(data.cashback.toFixed(2))
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

  // slider position
  const sliderLeft  = tipo === 'comum' ? '4px' : '50%'
  const sliderRight = tipo === 'comum' ? '50%' : '4px'

  return (
    <div className="layout">

      {/* ── LEFT CARD ── */}
      <div className="card">
        <div className="brand-title">Cashback<br />Rewards</div>
        <div className="brand-sub">Calcule o bônus da sua próxima compra</div>

        {/* Tipo toggle */}
        <div className="section-label">Tipo de Cliente</div>
        <div className="tipo-pill" ref={pillRef}>
          {/* animated slider */}
          <div
            className="tipo-pill-slider"
            style={{ left: sliderLeft, right: sliderRight }}
          />
          <button
            className={tipo === 'comum' ? 'active' : ''}
            onClick={() => { setTipo('comum'); setResultado(null) }}
          >
            Comum
          </button>
          <button
            className={tipo === 'vip' ? 'active' : ''}
            onClick={() => { setTipo('vip'); setResultado(null) }}
          >
            VIP
          </button>
        </div>

        {/* Preço */}
        <div className="field">
          <label>Valor da Compra (R$)</label>
          <input
            type="number"
            placeholder="Ex: 600,00"
            value={preco}
            min="0"
            step="0.01"
            onChange={e => { setPreco(e.target.value); setResultado(null) }}
          />
        </div>

        {/* Desconto */}
        <div className="field">
          <label>Desconto (%) - Opcional</label>
          <input
            type="number"
            placeholder="Ex: 15,0"
            value={desconto}
            min="0"
            max="100"
            step="0.01"
            onChange={e => { setDesconto(e.target.value); setResultado(null) }}
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

        {resultado !== null && !error && (
          <div className="result-box">
            <div>
              <div className="result-label">Cashback a receber</div>
            </div>
            <div className="result-val">R$ {formatBRL(resultado)}</div>
          </div>
        )}
      </div>

      {/* ── RIGHT CARD ── */}
      <div className="card-right">
        <div className="hist-title">Histórico (Seu IP)</div>

        {historico.length === 0 ? (
          <div className="empty-state">Nenhuma consulta realizada ainda.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Preço (R$)</th>
                  <th>Desconto</th>
                  <th>Final (R$)</th>
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
                    <td>{formatBRL(item.valor_compra)}</td>
                    <td>{(item.desconto_percent || 0).toFixed(1)}%</td>
                    <td>{formatBRL(item.valor_final || item.valor_compra)}</td>
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

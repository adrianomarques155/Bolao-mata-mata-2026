import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { calcPontos } from '../pontuacao'

export default function RaioX({ jogo, time1, time2, resultado, onClose }) {
  const [palpites, setPalpites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      const snapU = await getDocs(collection(db,'usuarios'))
      const us = {}
      snapU.forEach(d => { us[d.id] = d.data() })

      const todos = []
      for (const uid of Object.keys(us)) {
        const snapP = await getDocs(collection(db,'mm_palpites',uid,'jogos'))
        snapP.forEach(d => {
          if (d.id === String(jogo.id)) {
            todos.push({ uid, nome: us[uid]?.nome || '?', ...d.data() })
          }
        })
      }
      todos.sort((a,b) => a.nome.localeCompare(b.nome))
      setPalpites(todos)
      setLoading(false)
    }
    carregar()
  }, [jogo.id])

  function nomeCurto(nome) {
    const partes = nome.split(' ').filter(Boolean)
    if (partes.length === 1) return partes[0]
    return `${partes[0]} ${partes[1]}`
  }

  const grupos = {}
  palpites.forEach(p => {
    const key = `${p.g1}x${p.g2}`
    if (!grupos[key]) grupos[key] = []
    grupos[key].push(p)
  })

  const gruposOrdenados = Object.entries(grupos)
    .sort((a,b) => b[1].length - a[1].length)

  const total = palpites.length
  const maxCount = gruposOrdenados[0]?.[1].length || 1

  function corBarra(placar) {
    if (!resultado) return '#7b1fa2'
    const [pg1, pg2] = placar.split('x').map(Number)
    if (pg1 === resultado.g1 && pg2 === resultado.g2) return '#2e7d32'
    const pEmp = pg1 === pg2, rEmp = resultado.g1 === resultado.g2
    if (pEmp && rEmp) return '#1565c0'
    const pVenc = pg1 > pg2 ? 1 : pg1 < pg2 ? 2 : 0
    const rVenc = resultado.g1 > resultado.g2 ? 1 : resultado.g1 < resultado.g2 ? 2 : 0
    if (pVenc === rVenc && pVenc !== 0) return '#e65100'
    return '#c62828'
  }

  function ptsPlacar(placar) {
    if (!resultado) return null
    const [pg1, pg2] = placar.split('x').map(Number)
    return calcPontos({g1:pg1, g2:pg2}, resultado)
  }

  const s = {
    overlay: {position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:16},
    box: {background:'#fff',borderRadius:16,width:'100%',maxWidth:600,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'},
    header: {background:'#7b1fa2',color:'#fff',padding:'16px 20px',borderRadius:'16px 16px 0 0',display:'flex',justifyContent:'space-between',alignItems:'center'},
    body: {padding:20},
    placarCard: (cor) => ({background:'#fff',border:`2px solid ${cor}`,borderRadius:12,padding:'12px 16px',marginBottom:12}),
    barWrap: {display:'flex',alignItems:'center',gap:8,marginBottom:8},
    badge: (c) => ({display:'inline-block',padding:'2px 8px',borderRadius:99,background:c,color:'#fff',fontSize:11,fontWeight:600,marginLeft:6}),
    nomeTag: (pts) => ({
      display:'inline-block',padding:'4px 10px',borderRadius:99,fontSize:12,margin:'3px',
      background: pts===null?'#f5f5f5': pts===10?'#e8f5e9': pts>=6?'#e3f2fd': pts>=2?'#fff3e0':'#ffebee',
      color: pts===null?'#555': pts===10?'#2e7d32': pts>=6?'#1565c0': pts>=2?'#e65100':'#c62828',
      fontWeight: pts>0?600:400,
      border: pts===null?'1px solid #e0e0e0': pts===10?'1px solid #a5d6a7': pts>=6?'1px solid #90caf9': pts>=2?'1px solid #ffcc02':'1px solid #ef9a9a'
    }),
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.box} onClick={e=>e.stopPropagation()}>
        <div style={s.header}>
          <div>
            <div style={{fontSize:16,fontWeight:700}}>📊 Raio-X do Jogo</div>
            <div style={{fontSize:14,fontWeight:500,marginTop:2}}>{time1} × {time2}</div>
            {resultado && (
              <div style={{fontSize:13,opacity:0.85,marginTop:2}}>
                Resultado oficial: <strong>{resultado.g1}×{resultado.g2}</strong>
              </div>
            )}
          </div>
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'#fff',borderRadius:8,padding:'6px 12px',cursor:'pointer',fontSize:14}}>
            ✕ Fechar
          </button>
        </div>

        <div style={s.body}>
          {loading ? (
            <div style={{textAlign:'center',padding:40,color:'#888'}}>Carregando palpites...</div>
          ) : palpites.length === 0 ? (
            <div style={{textAlign:'center',padding:40,color:'#888'}}>Nenhum palpite registrado.</div>
          ) : (
            <>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:8}}>
                <div style={{fontSize:14,color:'#555'}}>
                  <strong>{total}</strong> palpite{total!==1?'s':''} no total
                </div>
                {resultado && (
                  <div style={{display:'flex',gap:8,fontSize:11,flexWrap:'wrap'}}>
                    <span style={{background:'#e8f5e9',color:'#2e7d32',padding:'2px 8px',borderRadius:99,fontWeight:600}}>🎯 10pts exato</span>
                    <span style={{background:'#e3f2fd',color:'#1565c0',padding:'2px 8px',borderRadius:99,fontWeight:600}}>🤝 6pts empate</span>
                    <span style={{background:'#fff3e0',color:'#e65100',padding:'2px 8px',borderRadius:99,fontWeight:600}}>✅ 2-4pts parcial</span>
                    <span style={{background:'#ffebee',color:'#c62828',padding:'2px 8px',borderRadius:99,fontWeight:600}}>❌ 0pts errou</span>
                  </div>
                )}
              </div>

              <h3 style={{fontSize:15,fontWeight:700,color:'#7b1fa2',marginBottom:12}}>📊 Distribuição dos palpites</h3>

              {gruposOrdenados.map(([placar, lista]) => {
                const pct = Math.round((lista.length / total) * 100)
                const barPct = Math.round((lista.length / maxCount) * 100)
                const cor = corBarra(placar)
                const pts = ptsPlacar(placar)
                return (
                  <div key={placar} style={s.placarCard(cor)}>
                    <div style={s.barWrap}>
                      <span style={{fontSize:17,fontWeight:800,minWidth:40,color:cor}}>{placar}</span>
                      <div style={{flex:1,background:'#f0f0f0',borderRadius:4,height:14,overflow:'hidden'}}>
                        <div style={{width:`${barPct}%`,height:'100%',background:cor,borderRadius:4,transition:'width 0.3s'}}/>
                      </div>
                      <span style={{fontSize:13,fontWeight:600,minWidth:70,textAlign:'right',color:cor}}>
                        {lista.length} ({pct}%)
                      </span>
                      {pts !== null && (
                        <span style={s.badge(cor)}>{pts}pts</span>
                      )}
                    </div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:2,marginTop:4}}>
                      {lista.map(p => (
                        <span key={p.uid} style={s.nomeTag(resultado ? calcPontos(p, resultado) : null)}>
                          {nomeCurto(p.nome)}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}

              <h3 style={{fontSize:15,fontWeight:700,color:'#7b1fa2',marginTop:20,marginBottom:12}}>👥 Lista alfabética completa</h3>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {palpites.map(p => {
                  const pts = resultado ? calcPontos(p, resultado) : null
                  return (
                    <div key={p.uid} style={{
                      background:'#f8f8f8',borderRadius:8,padding:'6px 12px',fontSize:13,
                      border:'0.5px solid #e0e0e0',display:'flex',alignItems:'center',gap:6
                    }}>
                      <span style={{fontWeight:500}}>{nomeCurto(p.nome)}</span>
                      <span style={{color:'#888',fontWeight:600}}>{p.g1}×{p.g2}</span>
                      {pts !== null && (
                        <span style={{
                          color: pts===10?'#2e7d32': pts>=6?'#1565c0': pts>=2?'#e65100':'#c62828',
                          fontWeight:700,fontSize:12
                        }}>({pts}pts)</span>
                      )}
                    </div>
                  )
                })}
              </div>

              {resultado && (
                <div style={{marginTop:16,background:'#f3e5f5',borderRadius:10,padding:'12px 16px'}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#7b1fa2',marginBottom:6}}>🏆 Resumo de pontuação</div>
                  <div style={{display:'flex',gap:12,flexWrap:'wrap',fontSize:13}}>
                    {[10,6,4,3,2,0].map(p => {
                      const count = palpites.filter(pp => calcPontos(pp,resultado)===p).length
                      if (count === 0) return null
                      return (
                        <div key={p} style={{textAlign:'center'}}>
                          <div style={{fontWeight:700,fontSize:18,color:'#7b1fa2'}}>{count}</div>
                          <div style={{fontSize:11,color:'#888'}}>{p}pts</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

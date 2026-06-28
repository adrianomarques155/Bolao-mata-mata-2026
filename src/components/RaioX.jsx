import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { calcPontos } from '../pontuacao'

export default function RaioX({ jogo, time1, time2, resultado, onClose }) {
  const [palpites, setPalpites] = useState([])
  const [usuarios, setUsuarios] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      const snapU = await getDocs(collection(db,'usuarios'))
      const us = {}
      snapU.forEach(d => { us[d.id] = d.data() })
      setUsuarios(us)

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

  // Agrupa por placar
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
    barWrap: {display:'flex',alignItems:'center',gap:8,marginBottom:4},
    bar: (pct,cor) => ({height:16,width:`${pct}%`,background:cor,borderRadius:4,minWidth:4,transition:'width 0.3s'}),
    badge: (c) => ({display:'inline-block',padding:'2px 8px',borderRadius:99,background:c,color:'#fff',fontSize:11,fontWeight:600,marginLeft:6}),
    nomeTag: (acertou) => ({display:'inline-block',padding:'3px 10px',borderRadius:99,fontSize:13,margin:'3px',background:acertou?'#e8f5e9':'#f5f5f5',color:acertou?'#2e7d32':'#555',fontWeight:acertou?600:400,border:acertou?'1px solid #a5d6a7':'1px solid #e0e0e0'}),
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.box} onClick={e=>e.stopPropagation()}>
        <div style={s.header}>
          <div>
            <div style={{fontSize:16,fontWeight:700}}>📊 Raio-X do Jogo</div>
            <div style={{fontSize:13,opacity:0.85}}>{time1} × {time2}</div>
            {resultado && <div style={{fontSize:13,opacity:0.85}}>Resultado: {resultado.g1}×{resultado.g2}</div>}
          </div>
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'#fff',borderRadius:8,padding:'6px 12px',cursor:'pointer',fontSize:14}}>✕ Fechar</button>
        </div>

        <div style={s.body}>
          {loading ? (
            <div style={{textAlign:'center',padding:40,color:'#888'}}>Carregando palpites...</div>
          ) : palpites.length === 0 ? (
            <div style={{textAlign:'center',padding:40,color:'#888'}}>Nenhum palpite registrado.</div>
          ) : (
            <>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <div style={{fontSize:14,color:'#555'}}><strong>{total}</strong> palpites no total</div>
                {resultado && (
                  <div style={{fontSize:12,color:'#888'}}>
                    🟢 Exato &nbsp; 🔵 Empate &nbsp; 🟠 Parcial &nbsp; 🔴 Errou
                  </div>
                )}
              </div>

              {gruposOrdenados.map(([placar, lista]) => {
                const pct = Math.round((lista.length / total) * 100)
                const barPct = Math.round((lista.length / maxCount) * 100)
                const cor = corBarra(placar)
                const pts = ptsPlacar(placar)
                return (
                  <div key={placar} style={s.placarCard(cor)}>
                    <div style={s.barWrap}>
                      <span style={{fontSize:16,fontWeight:700,minWidth:36,color:cor}}>{placar}</span>
                      <div style={{flex:1,background:'#f0f0f0',borderRadius:4,height:16}}>
                        <div style={s.bar(barPct,cor)}/>
                      </div>
                      <span style={{fontSize:13,fontWeight:600,minWidth:60,textAlign:'right',color:cor}}>
                        {lista.length} ({pct}%)
                      </span>
                      {pts !== null && (
                        <span style={s.badge(cor)}>{pts}pts</span>
                      )}
                    </div>
                    <div style={{flexWrap:'wrap',display:'flex'}}>
                      {lista.map(p => (
                        <span key={p.uid} style={s.nomeTag(pts > 0)}>
                          {p.nome.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}

              <div style={{marginTop:20,borderTop:'1px solid #f0f0f0',paddingTop:16}}>
                <div style={{fontSize:14,fontWeight:600,color:'#555',marginBottom:10}}>👥 Lista alfabética completa</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {palpites.map(p => {
                    const pts = resultado ? calcPontos(p, resultado) : null
                    const cor = pts === null ? '#888' : pts >= 6 ? '#2e7d32' : pts >= 2 ? '#e65100' : '#c62828'
                    return (
                      <div key={p.uid} style={{background:'#f8f8f8',borderRadius:8,padding:'6px 12px',fontSize:13,border:'0.5px solid #e0e0e0'}}>
                        <span style={{fontWeight:500}}>{p.nome.split(' ')[0]}</span>
                        <span style={{color:'#888',marginLeft:4}}>{p.g1}×{p.g2}</span>
                        {pts !== null && <span style={{color:cor,fontWeight:600,marginLeft:4}}>({pts}pts)</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

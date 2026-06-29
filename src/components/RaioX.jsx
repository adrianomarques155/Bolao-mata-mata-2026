import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { calcPontos } from '../pontuacao'

export default function RaioX({ jogo, time1, time2, resultado, onClose, modo }) {
  const [palpites, setPalpites] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState(modo || 'lista')

  useEffect(() => {
    async function carregar() {
      const snapU = await getDocs(collection(db,'usuarios'))
      const us = {}
      snapU.forEach(d => { us[d.id] = d.data() })
      const promises = Object.keys(us).map(uid =>
        getDocs(collection(db,'mm_palpites',uid,'jogos'))
          .then(snap => {
            const found = []
            snap.forEach(d => {
              if (d.id === String(jogo.id)) {
                found.push({ uid, nome: us[uid]?.nome || '?', ...d.data() })
              }
            })
            return found
          }).catch(() => [])
      )
      const results = await Promise.all(promises)
      const todos = results.flat().sort((a,b) => a.nome.localeCompare(b.nome))
      setPalpites(todos)
      setLoading(false)
    }
    carregar()
  }, [jogo.id])

  function nomeCurto(nome) {
    const partes = (nome||'?').split(' ').filter(Boolean)
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

  // Tendência
  const vit1 = palpites.filter(p=>p.g1>p.g2).length
  const emp  = palpites.filter(p=>p.g1===p.g2).length
  const vit2 = palpites.filter(p=>p.g1<p.g2).length

  function corPlacar(placar) {
    if (!resultado) return '#1565c0'
    const [pg1, pg2] = placar.split('x').map(Number)
    if (pg1 === resultado.g1 && pg2 === resultado.g2) return '#2e7d32'
    const pEmp = pg1===pg2, rEmp = resultado.g1===resultado.g2
    if (pEmp && rEmp) return '#f9a825'
    const pV = pg1>pg2?1:pg1<pg2?2:0
    const rV = resultado.g1>resultado.g2?1:resultado.g1<resultado.g2?2:0
    if (pV===rV && pV!==0) return '#e65100'
    if (pg1<pg2) return '#c62828'
    return '#1565c0'
  }

  function ptsPlacar(placar) {
    if (!resultado) return null
    const [pg1, pg2] = placar.split('x').map(Number)
    return calcPontos({g1:pg1,g2:pg2}, resultado)
  }

  function nomeTag(pts) {
    return {
      display:'inline-block',padding:'4px 10px',borderRadius:99,fontSize:12,margin:'3px',
      background: pts===null?'#f5f5f5':pts===10?'#e8f5e9':pts>=6?'#e3f2fd':pts>=2?'#fff3e0':'#ffebee',
      color: pts===null?'#555':pts===10?'#2e7d32':pts>=6?'#1565c0':pts>=2?'#e65100':'#c62828',
      fontWeight: pts>0?600:400,
      border: pts===null?'1px solid #e0e0e0':pts===10?'1px solid #a5d6a7':pts>=6?'1px solid #90caf9':pts>=2?'1px solid #ffcc02':'1px solid #ef9a9a'
    }
  }

  // Gráfico de rosca SVG
  function Rosca() {
    const cx=100, cy=100, r=70, ri=45
    const total2 = vit1+emp+vit2 || 1
    const dados = [
      {v:vit1, cor:'#1565c0', label:`Vitória ${time1}`, pct:Math.round(vit1/total2*100)},
      {v:emp,  cor:'#f9a825', label:'Empate',           pct:Math.round(emp/total2*100)},
      {v:vit2, cor:'#c62828', label:`Vitória ${time2}`, pct:Math.round(vit2/total2*100)},
    ]
    let angulo = -Math.PI/2
    const fatias = dados.map(d => {
      const a = (d.v/total2)*2*Math.PI
      const x1 = cx+r*Math.cos(angulo), y1 = cy+r*Math.sin(angulo)
      angulo += a
      const x2 = cx+r*Math.cos(angulo), y2 = cy+r*Math.sin(angulo)
      const xi1 = cx+ri*Math.cos(angulo-a), yi1 = cy+ri*Math.sin(angulo-a)
      const xi2 = cx+ri*Math.cos(angulo), yi2 = cy+ri*Math.sin(angulo)
      const large = a > Math.PI ? 1 : 0
      const path = `M${x1},${y1} A${r},${r},0,${large},1,${x2},${y2} L${xi2},${yi2} A${ri},${ri},0,${large},0,${xi1},${yi1} Z`
      return { ...d, path }
    })
    return (
      <div style={{textAlign:'center'}}>
        <div style={{fontWeight:700,fontSize:14,marginBottom:8,color:'#333'}}>Tendência de resultado</div>
        <svg viewBox="0 0 200 200" style={{width:180,height:180,display:'block',margin:'0 auto'}}>
          {fatias.map((f,i) => f.v>0 && <path key={i} d={f.path} fill={f.cor}/>)}
          <text x={cx} y={cy-6} textAnchor="middle" fontSize="11" fill="#333" fontWeight="600">{total}</text>
          <text x={cx} y={cy+8} textAnchor="middle" fontSize="9" fill="#888">palpites</text>
        </svg>
        <div style={{marginTop:8}}>
          {dados.map(d => d.v>0 && (
            <div key={d.label} style={{display:'flex',alignItems:'center',gap:6,justifyContent:'center',fontSize:12,marginBottom:3}}>
              <div style={{width:12,height:12,borderRadius:2,background:d.cor,flexShrink:0}}/>
              <span style={{color:'#333'}}>{d.label}</span>
              <span style={{color:'#666',fontWeight:600}}>{d.v} ({d.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Gráfico de barras horizontal SVG
  function Barras() {
    const maxW = 260
    return (
      <div>
        <div style={{fontWeight:700,fontSize:14,marginBottom:12,color:'#333',textAlign:'center'}}>Placares mais palpitados</div>
        {gruposOrdenados.map(([placar, lista]) => {
          const cor = corPlacar(placar)
          const w = Math.round((lista.length/maxCount)*maxW)
          return (
            <div key={placar} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              <span style={{fontSize:13,fontWeight:600,minWidth:36,textAlign:'right',color:'#333'}}>{placar}</span>
              <div style={{flex:1,background:'#f0f0f0',borderRadius:4,height:22,position:'relative',maxWidth:maxW}}>
                <div style={{width:w,height:'100%',background:cor,borderRadius:4}}/>
              </div>
              <span style={{fontSize:13,fontWeight:700,color:cor,minWidth:20}}>{lista.length}</span>
            </div>
          )
        })}
        <div style={{fontSize:11,color:'#888',textAlign:'center',marginTop:4}}>Nº de palpites</div>
      </div>
    )
  }

  const s = {
    overlay: {position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:12},
    box: {background:'#fff',borderRadius:16,width:'100%',maxWidth:640,maxHeight:'92vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'},
    header: {background:'#7b1fa2',color:'#fff',padding:'14px 18px',borderRadius:'16px 16px 0 0',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:1},
    body: {padding:16},
    tabBtn: (a) => ({padding:'7px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,background:a?'#7b1fa2':'#f0f0f0',color:a?'#fff':'#555'}),
  }

  const dataStr = new Date(jogo.data+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.box} onClick={e=>e.stopPropagation()}>
        <div style={s.header}>
          <div>
            <div style={{fontSize:15,fontWeight:700}}>{time1} × {time2}</div>
            <div style={{fontSize:12,opacity:0.85}}>J{jogo.id} • {jogo.fase} • {dataStr} • {jogo.hora}h • {total} palpites</div>
            {resultado && <div style={{fontSize:12,opacity:0.9,marginTop:2}}>Resultado: <strong>{resultado.g1}×{resultado.g2}</strong></div>}
          </div>
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'#fff',borderRadius:8,padding:'6px 12px',cursor:'pointer',fontSize:14}}>✕</button>
        </div>

        {!loading && (
          <div style={{display:'flex',gap:8,padding:'12px 16px 0',borderBottom:'1px solid #f0f0f0',paddingBottom:12}}>
            <button style={s.tabBtn(view==='lista')} onClick={()=>setView('lista')}>📋 Lista</button>
            <button style={s.tabBtn(view==='stats')} onClick={()=>setView('stats')}>📊 Estatísticas</button>
            <button style={s.tabBtn(view==='grid')} onClick={()=>setView('grid')}>🗂️ Por placar</button>
          </div>
        )}

        <div style={s.body}>
          {loading ? (
            <div style={{textAlign:'center',padding:40}}>
              <div style={{fontSize:32,marginBottom:12}}>⏳</div>
              <div style={{color:'#888',fontSize:14}}>Carregando palpites...</div>
            </div>
          ) : palpites.length === 0 ? (
            <div style={{textAlign:'center',padding:40,color:'#888'}}>Nenhum palpite registrado.</div>
          ) : (
            <>
              {view === 'stats' && (
                <div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
                    <Rosca/>
                    <Barras/>
                  </div>
                  {resultado && (
                    <div style={{background:'#f3e5f5',borderRadius:10,padding:'12px 16px'}}>
                      <div style={{fontSize:13,fontWeight:700,color:'#7b1fa2',marginBottom:8}}>🏆 Pontuação</div>
                      <div style={{display:'flex',gap:16,flexWrap:'wrap',fontSize:13}}>
                        {[10,6,4,3,2,0].map(p => {
                          const count = palpites.filter(pp=>calcPontos(pp,resultado)===p).length
                          if (!count) return null
                          return (
                            <div key={p} style={{textAlign:'center'}}>
                              <div style={{fontWeight:800,fontSize:22,color:'#7b1fa2'}}>{count}</div>
                              <div style={{fontSize:11,color:'#888'}}>{p} pts</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {view === 'grid' && (
                <div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10}}>
                    {gruposOrdenados.map(([placar, lista]) => {
                      const cor = corPlacar(placar)
                      const pts = ptsPlacar(placar)
                      return (
                        <div key={placar} style={{borderRadius:10,overflow:'hidden',border:`1.5px solid ${cor}`}}>
                          <div style={{background:cor,color:'#fff',padding:'8px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <span style={{fontSize:16,fontWeight:800}}>{placar}</span>
                            <div style={{textAlign:'right'}}>
                              <div style={{fontSize:13,fontWeight:600}}>{lista.length}</div>
                              {pts!==null && <div style={{fontSize:10,opacity:0.9}}>{pts}pts</div>}
                            </div>
                          </div>
                          <div style={{padding:'8px 10px',background:'#fafafa'}}>
                            {lista.map(p => (
                              <div key={p.uid} style={{fontSize:12,color:'#333',padding:'2px 0',borderBottom:'0.5px solid #f0f0f0'}}>
                                {p.nome}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {view === 'lista' && (
                <div>
                  {resultado && (
                    <div style={{display:'flex',gap:6,fontSize:11,flexWrap:'wrap',marginBottom:14}}>
                      <span style={{background:'#e8f5e9',color:'#2e7d32',padding:'2px 8px',borderRadius:99,fontWeight:600}}>🎯 10pts exato</span>
                      <span style={{background:'#e3f2fd',color:'#1565c0',padding:'2px 8px',borderRadius:99,fontWeight:600}}>🤝 6pts empate</span>
                      <span style={{background:'#fff3e0',color:'#e65100',padding:'2px 8px',borderRadius:99,fontWeight:600}}>✅ 2-4pts parcial</span>
                      <span style={{background:'#ffebee',color:'#c62828',padding:'2px 8px',borderRadius:99,fontWeight:600}}>❌ 0pts errou</span>
                    </div>
                  )}
                  {gruposOrdenados.map(([placar, lista]) => {
                    const cor = corPlacar(placar)
                    const pts = ptsPlacar(placar)
                    const barPct = Math.round((lista.length/maxCount)*100)
                    return (
                      <div key={placar} style={{border:`2px solid ${cor}`,borderRadius:12,padding:'12px 14px',marginBottom:10}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                          <span style={{fontSize:17,fontWeight:800,color:cor,minWidth:40}}>{placar}</span>
                          <div style={{flex:1,background:'#f0f0f0',borderRadius:4,height:12,overflow:'hidden'}}>
                            <div style={{width:`${barPct}%`,height:'100%',background:cor,borderRadius:4}}/>
                          </div>
                          <span style={{fontSize:13,fontWeight:600,color:cor,minWidth:60,textAlign:'right'}}>
                            {lista.length} ({Math.round(lista.length/total*100)}%)
                          </span>
                          {pts!==null && <span style={{background:cor,color:'#fff',padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:600}}>{pts}pts</span>}
                        </div>
                        <div style={{display:'flex',flexWrap:'wrap'}}>
                          {lista.map(p => (
                            <span key={p.uid} style={nomeTag(resultado?calcPontos(p,resultado):null)}>
                              {nomeCurto(p.nome)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  <div style={{marginTop:16}}>
                    <div style={{fontSize:13,fontWeight:600,color:'#555',marginBottom:8}}>👥 Lista alfabética ({total})</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                      {palpites.map(p => {
                        const pts = resultado?calcPontos(p,resultado):null
                        return (
                          <div key={p.uid} style={{background:'#f8f8f8',borderRadius:8,padding:'5px 10px',fontSize:12,border:'0.5px solid #e0e0e0',display:'flex',gap:5,alignItems:'center'}}>
                            <span style={{fontWeight:500}}>{nomeCurto(p.nome)}</span>
                            <span style={{color:'#888',fontWeight:600}}>{p.g1}×{p.g2}</span>
                            {pts!==null && <span style={{color:pts===10?'#2e7d32':pts>=6?'#1565c0':pts>=2?'#e65100':'#c62828',fontWeight:700,fontSize:11}}>({pts}pts)</span>}
                          </div>
                        )
                      })}
                    </div>
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

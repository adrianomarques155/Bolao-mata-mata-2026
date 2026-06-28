import { useState, useEffect } from 'react'
import { collection, onSnapshot, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { JOGOS } from '../jogos'
import { calcPontos } from '../pontuacao'

const CORES = [
  '#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6',
  '#1abc9c','#e67e22','#34495e','#e91e63','#00bcd4',
  '#8bc34a','#ff5722','#607d8b','#795548','#ff9800',
  '#03a9f4','#4caf50','#9c27b0','#f44336','#009688'
]

function corPontos(pts) {
  if (pts === null || pts === undefined) return '#f5f5f5'
  if (pts === 10) return '#7b1fa2'
  if (pts === 6)  return '#1565c0'
  if (pts === 4)  return '#2e7d32'
  if (pts === 3)  return '#e65100'
  if (pts === 2)  return '#f9a825'
  if (pts === 0)  return '#c62828'
  return '#f5f5f5'
}

export default function Ranking({ user }) {
  const [usuarios, setUsuarios] = useState([])
  const [resultados, setResultados] = useState({})
  const [timesJogos, setTimesJogos] = useState({})
  const [palpites, setPalpites] = useState({})
  const [loading, setLoading] = useState(true)
  const [aba, setAba] = useState('ranking')
  const [hover, setHover] = useState(null)
  const [topN, setTopN] = useState(10)

  useEffect(() => {
    const u1 = onSnapshot(collection(db,'usuarios'), snap => {
      setUsuarios(snap.docs.map(d=>({id:d.id,...d.data()})))
    })
    const u2 = onSnapshot(collection(db,'mm_resultados'), snap => {
      const r={}; snap.forEach(d=>{r[d.id]=d.data()}); setResultados(r)
    })
    const u3 = onSnapshot(collection(db,'mm_times'), snap => {
      const t={}; snap.forEach(d=>{t[d.id]=d.data()}); setTimesJogos(t)
    })
    return () => { u1(); u2(); u3() }
  }, [])

  useEffect(() => {
    if (usuarios.length === 0) { setLoading(false); return }
    Promise.all(usuarios.map(async u => {
      const snap = await getDocs(collection(db,'mm_palpites',u.id,'jogos'))
      const p={}; snap.forEach(d=>{p[d.id]=d.data()})
      return [u.id, p]
    })).then(entries => {
      setPalpites(Object.fromEntries(entries))
      setLoading(false)
    })
  }, [usuarios, resultados])

  function getTime1(jogo) { return timesJogos[String(jogo.id)]?.time1 || jogo.time1 }
  function getTime2(jogo) { return timesJogos[String(jogo.id)]?.time2 || jogo.time2 }

  const jogosComResultado = JOGOS.filter(j => resultados[String(j.id)])

  const ranking = usuarios
    .filter(u => u.pagoMM)
    .map(u => {
      let pts=0, acertos=0, total=0
      const evolucao = []
      const pontosPorJogo = {}
      let ptsCumulativo = 0
      JOGOS.forEach(j => {
        const p = (palpites[u.id]||{})[String(j.id)]
        const r = resultados[String(j.id)]
        if (r) {
          const pp = p ? calcPontos(p,r) : null
          pontosPorJogo[j.id] = pp
          if (pp !== null) {
            pts+=pp; if(pp>0) acertos++; total++
            ptsCumulativo += pp
            evolucao.push({ jogo: `J${j.id}`, pts: ptsCumulativo })
          }
        }
      })
      return {...u, pts, acertos, total, evolucao, pontosPorJogo}
    }).sort((a,b) => b.pts-a.pts || b.acertos-a.acertos)

  const medalhas = ['🥇','🥈','🥉']
  const topJogadores = ranking.slice(0, topN)

  function Grafico() {
    if (topJogadores.length === 0 || topJogadores.every(u=>u.evolucao.length===0)) {
      return <div style={{textAlign:'center',padding:40,color:'#888',fontSize:14}}>Nenhum resultado ainda.</div>
    }
    const maxPts = Math.max(...topJogadores.map(u=>u.pts), 10)
    const W=640, H=320, PL=44, PR=120, PT=20, PB=36
    const gW=W-PL-PR, gH=H-PT-PB
    function xPos(i,total) { return total<=1?PL+gW/2:PL+(i/total)*gW }
    function yPos(p) { return PT+gH-(p/maxPts)*gH }
    return (
      <div style={{overflowX:'auto'}}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',minWidth:360,maxWidth:700,display:'block',margin:'0 auto'}}>
          {[0,0.25,0.5,0.75,1].map(f => {
            const y=PT+gH*(1-f)
            return (
              <g key={f}>
                <line x1={PL} y1={y} x2={W-PR} y2={y} stroke="#f0f0f0" strokeWidth="1"/>
                <text x={PL-6} y={y+4} textAnchor="end" fontSize="10" fill="#bbb">{Math.round(maxPts*f)}</text>
              </g>
            )
          })}
          <line x1={PL} y1={PT} x2={PL} y2={PT+gH} stroke="#eee" strokeWidth="1"/>
          <line x1={PL} y1={PT+gH} x2={W-PR} y2={PT+gH} stroke="#eee" strokeWidth="1"/>
          {topJogadores.map((u,ui) => {
            if (u.evolucao.length===0) return null
            const cor = CORES[ui%CORES.length]
            const isHover = hover===u.id
            const pts = [{pts:0},...u.evolucao]
            const points = pts.map((p,i)=>`${xPos(i,pts.length-1)},${yPos(p.pts)}`).join(' ')
            return (
              <g key={u.id} onMouseEnter={()=>setHover(u.id)} onMouseLeave={()=>setHover(null)} style={{cursor:'pointer'}}>
                <polyline points={points} fill="none" stroke={cor} strokeWidth={isHover?3:1.5} strokeLinejoin="round" opacity={hover&&!isHover?0.15:1}/>
                {pts.map((p,i)=>i===0?null:(
                  <circle key={i} cx={xPos(i,pts.length-1)} cy={yPos(p.pts)} r={isHover?5:3} fill={cor} opacity={hover&&!isHover?0.15:1}/>
                ))}
              </g>
            )
          })}
          {topJogadores.map((u,ui) => {
            if (u.evolucao.length===0) return null
            const cor = CORES[ui%CORES.length]
            const isHover = hover===u.id
            return (
              <g key={'l'+u.id} opacity={hover&&!isHover?0.15:1}>
                <circle cx={W-PR+8} cy={yPos(u.pts)} r="4" fill={cor}/>
                <text x={W-PR+16} y={yPos(u.pts)+4} fontSize={isHover?12:10} fill={cor} fontWeight={isHover?700:400}>
                  {u.nome.split(' ')[0]} ({u.pts})
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  function TabelaPontos() {
    if (ranking.length === 0) return (
      <div style={{background:'#fff',borderRadius:12,padding:24,textAlign:'center',color:'#888'}}>
        Nenhum participante com pagamento confirmado ainda.
      </div>
    )
    if (jogosComResultado.length === 0) return (
      <div style={{background:'#fff',borderRadius:12,padding:24,textAlign:'center',color:'#888'}}>
        Nenhum resultado inserido ainda.
      </div>
    )
    const thStyle = {
      padding:'8px 6px',fontSize:10,fontWeight:700,color:'#fff',
      background:'#7b1fa2',whiteSpace:'nowrap',textAlign:'center',position:'sticky',top:0
    }
    return (
      <div style={{overflowX:'auto',borderRadius:12,boxShadow:'0 1px 4px rgba(0,0,0,0.07)'}}>
        <table style={{borderCollapse:'collapse',minWidth:400,width:'100%',fontSize:13}}>
          <thead>
            <tr>
              <th style={{...thStyle,left:0,minWidth:160,textAlign:'left',position:'sticky',zIndex:3}}>Participante</th>
              <th style={{...thStyle,minWidth:60,background:'#6a1b9a',position:'sticky',left:160,zIndex:3}}>Total</th>
              {jogosComResultado.map((j,i) => {
                const t1 = getTime1(j)
                const t2 = getTime2(j)
                const label1 = t1.startsWith('Vencedor')||t1.startsWith('Perdedor') ? `J${j.id}` : t1.substring(0,3)
                const label2 = t2.startsWith('Vencedor')||t2.startsWith('Perdedor') ? '' : t2.substring(0,3)
                return (
                  <th key={j.id} style={{...thStyle,minWidth:52,background:i%2===0?'#7b1fa2':'#6a1b9a'}}>
                    <div>{label1}</div>
                    {label2 && <div style={{fontSize:8,opacity:0.7}}>×</div>}
                    {label2 && <div>{label2}</div>}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {ranking.map((r,i) => {
              const isMe = user && r.id === user.uid
              return (
                <tr key={r.id} style={{background:isMe?'#f3e5f5':i%2===0?'#fff':'#fafafa'}}>
                  <td style={{padding:'8px 10px',fontWeight:600,whiteSpace:'nowrap',position:'sticky',left:0,background:isMe?'#f3e5f5':i%2===0?'#fff':'#fafafa',zIndex:1,borderRight:'2px solid #e0e0e0',minWidth:160}}>
                    <span style={{marginRight:6}}>{medalhas[i]||`${i+1}º`}</span>
                    {r.nome.split(' ')[0]} {isMe?'(você)':''}
                  </td>
                  <td style={{padding:'8px 10px',textAlign:'center',fontWeight:800,fontSize:15,color:'#7b1fa2',position:'sticky',left:160,background:isMe?'#f3e5f5':i%2===0?'#fff':'#fafafa',zIndex:1,borderRight:'2px solid #e0e0e0'}}>
                    {r.pts}
                  </td>
                  {jogosComResultado.map((j) => {
                    const pp = r.pontosPorJogo[j.id]
                    const p = (palpites[r.id]||{})[String(j.id)]
                    const res = resultados[String(j.id)]
                    const bg = pp===null||pp===undefined ? '#f5f5f5' : corPontos(pp)
                    const fg = pp===null||pp===undefined ? '#bbb' : '#fff'
                    return (
                      <td key={j.id} style={{padding:'6px 4px',textAlign:'center',background:bg,minWidth:52}}>
                        {pp !== null && pp !== undefined ? (
                          <div title={p?`Palpite: ${p.g1}×${p.g2} | Resultado: ${res.g1}×${res.g2}`:''}>
                            <div style={{fontSize:13,fontWeight:700,color:fg}}>{pp}</div>
                            {p && <div style={{fontSize:9,color:fg,opacity:0.85}}>{p.g1}×{p.g2}</div>}
                          </div>
                        ) : (
                          <div style={{fontSize:11,color:'#ccc'}}>—</div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{background:'#f5f5f5'}}>
              <td style={{padding:'6px 10px',fontSize:11,color:'#888',position:'sticky',left:0,background:'#f5f5f5',fontWeight:600}}>Resultado</td>
              <td style={{position:'sticky',left:160,background:'#f5f5f5',borderRight:'2px solid #e0e0e0'}}/>
              {jogosComResultado.map(j => {
                const r = resultados[String(j.id)]
                return (
                  <td key={j.id} style={{padding:'6px 4px',textAlign:'center',fontSize:11,fontWeight:700,color:'#7b1fa2'}}>
                    {r.g1}×{r.g2}
                  </td>
                )
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    )
  }

  if (loading) return <div style={{textAlign:'center',padding:40,color:'#888'}}>Carregando ranking...</div>

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {[
          {id:'ranking', label:'🏆 Classificação'},
          {id:'evolucao', label:'📈 Evolução'},
          {id:'tabela',  label:'📊 Tabela'},
        ].map(a => (
          <button key={a.id} onClick={()=>setAba(a.id)} style={{
            padding:'8px 20px',borderRadius:8,border:'none',cursor:'pointer',fontSize:14,fontWeight:600,
            background:aba===a.id?'#7b1fa2':'#e0e0e0',color:aba===a.id?'#fff':'#333'
          }}>{a.label}</button>
        ))}
      </div>

      {aba === 'ranking' && (
        <>
          <h2 style={{fontSize:20,fontWeight:700,marginBottom:4,color:'#7b1fa2'}}>🏆 Classificação</h2>
          <p style={{fontSize:13,color:'#888',marginBottom:16}}>Apenas participantes com pagamento confirmado</p>
          {ranking.length === 0 && (
            <div style={{background:'#fff',borderRadius:12,padding:24,textAlign:'center',color:'#888'}}>
              Nenhum participante com pagamento confirmado ainda.
            </div>
          )}
          {ranking.map((r,i) => (
            <div key={r.id} style={{
              background:'#fff',borderRadius:12,padding:'14px 16px',marginBottom:8,
              boxShadow:'0 1px 4px rgba(0,0,0,0.07)',display:'flex',alignItems:'center',gap:14,
              border:user&&r.id===user.uid?'2px solid #7b1fa2':'none'
            }}>
              <span style={{fontSize:24,width:36,textAlign:'center'}}>{medalhas[i]||`${i+1}º`}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:16}}>{r.nome} {user&&r.id===user.uid?'(você)':''}</div>
                <div style={{fontSize:12,color:'#888'}}>{r.total} jogos pontuados • {r.acertos} acertos</div>
              </div>
              <div style={{fontSize:24,fontWeight:800,color:'#7b1fa2'}}>
                {r.pts}<span style={{fontSize:14,fontWeight:400,color:'#888'}}> pts</span>
              </div>
            </div>
          ))}
        </>
      )}

      {aba === 'evolucao' && (
        <>
          <h2 style={{fontSize:20,fontWeight:700,marginBottom:4,color:'#7b1fa2'}}>📈 Evolução</h2>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16,flexWrap:'wrap'}}>
            <span style={{fontSize:13,color:'#555'}}>Mostrar top:</span>
            {[5,10,15,20].map(n => (
              <button key={n} onClick={()=>setTopN(n)} style={{
                padding:'4px 12px',borderRadius:99,border:'none',fontSize:13,cursor:'pointer',
                background:topN===n?'#7b1fa2':'#e0e0e0',color:topN===n?'#fff':'#333',fontWeight:topN===n?600:400
              }}>{n}</button>
            ))}
          </div>
          <div style={{background:'#fff',borderRadius:12,padding:'16px',boxShadow:'0 1px 4px rgba(0,0,0,0.07)',marginBottom:16}}>
            <Grafico />
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {topJogadores.map((u,i) => (
              <div key={u.id}
                style={{display:'flex',alignItems:'center',gap:6,background:hover===u.id?'#f0f0f0':'#fff',borderRadius:8,padding:'6px 12px',boxShadow:'0 1px 4px rgba(0,0,0,0.07)',cursor:'pointer'}}
                onMouseEnter={()=>setHover(u.id)} onMouseLeave={()=>setHover(null)}
              >
                <div style={{width:10,height:10,borderRadius:'50%',background:CORES[i%CORES.length]}}/>
                <span style={{fontSize:13,fontWeight:600}}>{i+1}. {u.nome.split(' ')[0]}</span>
                <span style={{fontSize:12,color:'#888'}}>{u.pts} pts</span>
              </div>
            ))}
          </div>
        </>
      )}

      {aba === 'tabela' && (
        <>
          <h2 style={{fontSize:20,fontWeight:700,marginBottom:4,color:'#7b1fa2'}}>📊 Tabela de pontos</h2>
          <p style={{fontSize:13,color:'#888',marginBottom:16}}>Pontuação detalhada por jogo • Passe o mouse para ver o palpite</p>
          <TabelaPontos />
        </>
      )}
    </div>
  )
}

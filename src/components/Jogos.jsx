import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { JOGOS } from '../jogos'
import { calcPontos, ptsColor, ptsLabel } from '../pontuacao'
import RaioX from './RaioX'

function getDeadline(jogo) {
  const [y,m,d] = jogo.data.split('-').map(Number)
  const [h,min] = jogo.hora.split(':').map(Number)
  const dt = new Date(y,m-1,d,h,min,0)
  dt.setMinutes(dt.getMinutes()-120)
  return dt
}

function faseLabel(fase) {
  if (fase==='16avos')    return '16 avos de final'
  if (fase==='oitavas')   return 'Oitavas de final'
  if (fase==='quartas')   return 'Quartas de final'
  if (fase==='semifinal') return 'Semifinal'
  if (fase==='terceiro')  return '3º lugar'
  if (fase==='final')     return 'FINAL'
  return fase
}

function faseCor(fase) {
  if (fase==='16avos')    return '#7b1fa2'
  if (fase==='oitavas')   return '#1565c0'
  if (fase==='quartas')   return '#e65100'
  if (fase==='semifinal') return '#c62828'
  if (fase==='terceiro')  return '#558b2f'
  if (fase==='final')     return '#f9a825'
  return '#888'
}

const s = {
  filtros: {display:'flex',gap:6,flexWrap:'wrap',marginBottom:16},
  fBtn: (a) => ({padding:'5px 12px',borderRadius:99,border:a?'2px solid #7b1fa2':'1px solid #ccc',background:a?'#7b1fa2':'#fff',color:a?'#fff':'#333',cursor:'pointer',fontSize:13,fontWeight:a?600:400}),
  card: {background:'#fff',borderRadius:12,padding:'14px 16px',marginBottom:10,boxShadow:'0 1px 4px rgba(0,0,0,0.07)'},
  time: {fontSize:16,fontWeight:600,flex:1},
  placar: {padding:'4px 16px',fontSize:22,fontWeight:700,color:'#7b1fa2',textAlign:'center',minWidth:80},
  vs: {padding:'0 16px',fontSize:14,color:'#999',textAlign:'center',minWidth:80},
  inp: {width:44,padding:'6px',borderRadius:6,border:'1px solid #ddd',fontSize:16,textAlign:'center'},
  saveBtn: {padding:'6px 14px',borderRadius:8,border:'none',background:'#7b1fa2',color:'#fff',cursor:'pointer',fontSize:13,fontWeight:600},
  raioxBtn: {padding:'6px 14px',borderRadius:8,border:'none',background:'#f3e5f5',color:'#7b1fa2',cursor:'pointer',fontSize:13,fontWeight:600},
  badge: (c) => ({display:'inline-block',padding:'3px 10px',borderRadius:99,background:c,color:'#fff',fontSize:12,fontWeight:600}),
  info: {fontSize:12,color:'#888',marginTop:4},
  palpRow: {display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginTop:10,paddingTop:10,borderTop:'1px solid #f0f0f0'},
  faseTag: (fase) => ({fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:99,background:faseCor(fase)+'22',color:faseCor(fase)}),
}

export default function Jogos({ user, isAdmin }) {
  const [resultados, setResultados] = useState({})
  const [timesJogos, setTimesJogos] = useState({})
  const [meusPalpites, setMeusPalpites] = useState({})
  const [editando, setEditando] = useState({})
  const [fase, setFase] = useState('TODOS')
  const [msg, setMsg] = useState('')
  const [raioxJogo, setRaioxJogo] = useState(null)

  useEffect(() => {
    const ultima = localStorage.getItem('ultima_atualizacao_mm')
    const agora = Date.now()
    if (!ultima || agora - parseInt(ultima) > 5 * 60 * 1000) {
      fetch('/api/resultados')
        .then(() => localStorage.setItem('ultima_atualizacao_mm', String(agora)))
        .catch(() => {})
    }
  }, [])

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db,'mm_resultados'), snap => {
      const r={}; snap.forEach(d=>{r[d.id]=d.data()}); setResultados(r)
    })
    const unsub2 = onSnapshot(collection(db,'mm_times'), snap => {
      const t={}; snap.forEach(d=>{t[d.id]=d.data()}); setTimesJogos(t)
    })
    return () => { unsub1(); unsub2() }
  }, [])

  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(collection(db,'mm_palpites',user.uid,'jogos'), snap => {
      const p={}; snap.forEach(d=>{p[d.id]=d.data()}); setMeusPalpites(p)
    })
    return unsub
  }, [user])

  const fases = ['TODOS','16avos','oitavas','quartas','semifinal','terceiro','final']
  const filtrados = fase==='TODOS' ? JOGOS : JOGOS.filter(j=>j.fase===fase)

  function getTime1(jogo) { return timesJogos[String(jogo.id)]?.time1 || jogo.time1 }
  function getTime2(jogo) { return timesJogos[String(jogo.id)]?.time2 || jogo.time2 }
  function jogoDefinido(jogo) {
    const t1 = getTime1(jogo)
    const t2 = getTime2(jogo)
    return !t1.startsWith('Vencedor') && !t1.startsWith('Perdedor') &&
           !t2.startsWith('Vencedor') && !t2.startsWith('Perdedor')
  }

  function showMsg(m) { setMsg(m); setTimeout(()=>setMsg(''),2500) }

  async function salvarPalpite(jogoId) {
    const key = String(jogoId)
    const ep = editando[key]
    const meuP = meusPalpites[key]
    const g1val = ep?.g1 !== undefined ? String(ep.g1) : (meuP !== undefined ? String(meuP.g1) : '')
    const g2val = ep?.g2 !== undefined ? String(ep.g2) : (meuP !== undefined ? String(meuP.g2) : '')
    if (g1val === '' || g2val === '') return showMsg('Preencha o placar.')
    const g1 = parseInt(g1val), g2 = parseInt(g2val)
    if (isNaN(g1) || isNaN(g2) || g1 < 0 || g2 < 0) return showMsg('Placar inválido.')
    await setDoc(doc(db,'mm_palpites',user.uid,'jogos',key),{g1,g2,uid:user.uid,jogoId})
    setEditando(p=>{const n={...p};delete n[key];return n})
    showMsg('Palpite salvo! ✓')
  }

  return (
    <div>
      {msg && <div style={{position:'fixed',top:72,left:'50%',transform:'translateX(-50%)',background:'#7b1fa2',color:'#fff',padding:'8px 20px',borderRadius:99,zIndex:999,fontSize:14,fontWeight:600,boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}>{msg}</div>}

      {raioxJogo && (
        <RaioX
          jogo={raioxJogo}
          time1={getTime1(raioxJogo)}
          time2={getTime2(raioxJogo)}
          resultado={resultados[String(raioxJogo.id)]}
          onClose={() => setRaioxJogo(null)}
        />
      )}

      <div style={s.filtros}>
        {fases.map(f=><button key={f} style={s.fBtn(fase===f)} onClick={()=>setFase(f)}>{f==='TODOS'?'Todos':faseLabel(f)}</button>)}
      </div>

      {filtrados.map(jogo => {
        const key = String(jogo.id)
        const res = resultados[key]
        const meuP = meusPalpites[key]
        const aberto = new Date() < getDeadline(jogo)
        const definido = jogoDefinido(jogo)
        const ep = editando[key] || {}
        const pts = meuP && res ? calcPontos(meuP,res) : null
        const t1 = getTime1(jogo)
        const t2 = getTime2(jogo)
        const prazoFechou = new Date() >= getDeadline(jogo)

        return (
          <div key={jogo.id} style={s.card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
              <span style={s.faseTag(jogo.fase)}>{faseLabel(jogo.fase)}</span>
              <span style={{fontSize:12,color:'#888'}}>
                {new Date(jogo.data+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short'})} • {jogo.hora}h • {jogo.cidade}
              </span>
            </div>

            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',margin:'8px 0'}}>
              <span style={{...s.time,color:definido?'#1a1a1a':'#aaa'}}>{t1}</span>
              {res
                ? <span style={s.placar}>{res.g1} — {res.g2}</span>
                : <span style={s.vs}>×</span>
              }
              <span style={{...s.time,textAlign:'right',color:definido?'#1a1a1a':'#aaa'}}>{t2}</span>
            </div>

            {!definido && (
              <div style={{fontSize:12,color:'#aaa',textAlign:'center',marginBottom:4}}>
                ⏳ Aguardando definição dos times
              </div>
            )}

            {user && !isAdmin && definido && (
              <div style={s.palpRow}>
                <span style={{fontSize:13,color:'#666',marginRight:4}}>Palpite:</span>
                {aberto && !res ? (
                  <>
                    <input style={s.inp} type="number" min="0" placeholder="0"
                      value={ep.g1 !== undefined ? ep.g1 : (meuP !== undefined ? String(meuP.g1) : '')}
                      onChange={e=>setEditando(p=>({...p,[key]:{...ep,g1:e.target.value}}))} />
                    <span style={{color:'#999'}}>×</span>
                    <input style={s.inp} type="number" min="0" placeholder="0"
                      value={ep.g2 !== undefined ? ep.g2 : (meuP !== undefined ? String(meuP.g2) : '')}
                      onChange={e=>setEditando(p=>({...p,[key]:{...ep,g2:e.target.value}}))} />
                    <button style={s.saveBtn} onClick={()=>salvarPalpite(jogo.id)}>Salvar</button>
                    {meuP && <span style={{fontSize:12,color:'#888'}}>Salvo: {meuP.g1}×{meuP.g2}</span>}
                  </>
                ) : meuP ? (
                  <span style={{fontWeight:600,fontSize:15}}>{meuP.g1} × {meuP.g2}</span>
                ) : (
                  <span style={{fontSize:13,color:'#c62828'}}>{res?'Não palpitado':'Prazo encerrado'}</span>
                )}
                {pts !== null && (
                  <span style={{...s.badge(ptsColor(pts)),marginLeft:'auto'}}>{pts} pts — {ptsLabel(pts)}</span>
                )}
                {aberto && !res && (
                  <div style={{...s.info,width:'100%'}}>⏰ Palpite até: {getDeadline(jogo).toLocaleString('pt-BR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                )}
              </div>
            )}

            {!user && definido && (
              <div style={{...s.palpRow,color:'#888',fontSize:13}}>Entre para fazer seu palpite</div>
            )}

            {prazoFechou && definido && user && (
              <div style={{marginTop:8,paddingTop:8,borderTop:'1px solid #f0f0f0'}}>
                <button style={s.raioxBtn} onClick={()=>setRaioxJogo(jogo)}>
                  📊 Ver Raio-X dos palpites
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

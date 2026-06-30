import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { JOGOS } from '../jogos'
import { calcPontos } from '../pontuacao'

const s = {
  card: {background:'#fff',borderRadius:12,padding:'14px 16px',marginBottom:10,boxShadow:'0 1px 4px rgba(0,0,0,0.07)'},
  inp: {width:44,padding:'6px',borderRadius:6,border:'1px solid #ddd',fontSize:16,textAlign:'center'},
  inpText: {padding:'8px 12px',borderRadius:8,border:'1px solid #ddd',fontSize:14,width:'100%',marginBottom:8},
  btn: (c) => ({padding:'6px 14px',borderRadius:8,border:'none',background:c||'#7b1fa2',color:'#fff',cursor:'pointer',fontSize:13,fontWeight:600}),
  badge: (c) => ({display:'inline-block',padding:'3px 10px',borderRadius:99,background:c||'#7b1fa2',color:'#fff',fontSize:12,fontWeight:600}),
  tab: (a) => ({padding:'8px 20px',borderRadius:8,border:'none',background:a?'#7b1fa2':'#e0e0e0',color:a?'#fff':'#333',cursor:'pointer',fontSize:14,fontWeight:600}),
  userCard: {background:'#fff',borderRadius:12,padding:'14px 16px',marginBottom:8,boxShadow:'0 1px 4px rgba(0,0,0,0.07)'},
  fBtn: (a) => ({padding:'5px 12px',borderRadius:99,border:a?'2px solid #7b1fa2':'1px solid #ccc',background:a?'#7b1fa2':'#fff',color:a?'#fff':'#333',cursor:'pointer',fontSize:13,fontWeight:a?600:400}),
}

function faseLabel(fase) {
  if (fase==='16avos')    return '16 avos'
  if (fase==='oitavas')   return 'Oitavas'
  if (fase==='quartas')   return 'Quartas'
  if (fase==='semifinal') return 'Semi'
  if (fase==='terceiro')  return '3º lugar'
  if (fase==='final')     return 'FINAL'
  return fase
}

export default function Admin() {
  const [resultados, setResultados] = useState({})
  const [timesJogos, setTimesJogos] = useState({})
  const [dadosJogos, setDadosJogos] = useState({})
  const [usuarios, setUsuarios] = useState({})
  const [palpites, setPalpites] = useState({})
  const [editando, setEditando] = useState({})
  const [editTimes, setEditTimes] = useState({})
  const [editJogo, setEditJogo] = useState({})
  const [fase, setFase] = useState('16avos')
  const [msg, setMsg] = useState('')
  const [aba, setAba] = useState('resultados')
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    const u1 = onSnapshot(collection(db,'mm_resultados'), snap => {
      const r={}; snap.forEach(d=>{r[d.id]=d.data()}); setResultados(r)
    })
    const u2 = onSnapshot(collection(db,'mm_times'), snap => {
      const t={}; snap.forEach(d=>{t[d.id]=d.data()}); setTimesJogos(t)
    })
    const u3 = onSnapshot(collection(db,'usuarios'), snap => {
      const u={}; snap.forEach(d=>{u[d.id]=d.data()}); setUsuarios(u)
    })
    const u4 = onSnapshot(collection(db,'mm_jogos'), snap => {
      const j={}; snap.forEach(d=>{j[d.id]=d.data()}); setDadosJogos(j)
    })
    return () => { u1(); u2(); u3(); u4() }
  }, [])

  useEffect(() => {
    Object.keys(usuarios).forEach(async uid => {
      const snap = await getDocs(collection(db,'mm_palpites',uid,'jogos'))
      const p={}; snap.forEach(d=>{p[d.id]=d.data()})
      setPalpites(prev=>({...prev,[uid]:p}))
    })
  }, [usuarios])

  const fases = ['16avos','oitavas','quartas','semifinal','terceiro','final']

  // Pega dados do jogo — prioriza Firestore sobre o arquivo jogos.js
  function getJogoData(jogo) {
    const override = dadosJogos[String(jogo.id)]
    return {
      data: override?.data || jogo.data,
      hora: override?.hora || jogo.hora,
    }
  }

  const filtrados = JOGOS.filter(j=>j.fase===fase)

  function showMsg(m) { setMsg(m); setTimeout(()=>setMsg(''),2500) }
  function getTime1(jogo) { return timesJogos[String(jogo.id)]?.time1 || jogo.time1 }
  function getTime2(jogo) { return timesJogos[String(jogo.id)]?.time2 || jogo.time2 }

  async function salvarResultado(jogoId) {
    const ep = editando['r_'+jogoId]
    if (!ep||ep.g1===''||ep.g2==='') return showMsg('Preencha o resultado.')
    const g1=parseInt(ep.g1),g2=parseInt(ep.g2)
    if(isNaN(g1)||isNaN(g2)||g1<0||g2<0) return showMsg('Resultado inválido.')
    await setDoc(doc(db,'mm_resultados',String(jogoId)),{g1,g2,manual:true})
    setEditando(p=>{const n={...p};delete n['r_'+jogoId];return n})
    showMsg('Resultado salvo! ✓')
  }

  async function apagarResultado(jogoId) {
    await deleteDoc(doc(db,'mm_resultados',String(jogoId)))
    setConfirmDelete(null)
    showMsg('Resultado apagado!')
  }

  async function salvarTimes(jogoId) {
    const et = editTimes[jogoId]
    if (!et?.time1 || !et?.time2) return showMsg('Preencha os dois times.')
    await setDoc(doc(db,'mm_times',String(jogoId)),{time1:et.time1,time2:et.time2})
    setEditTimes(p=>{const n={...p};delete n[jogoId];return n})
    showMsg('Times atualizados! ✓')
  }

  async function salvarDadosJogo(jogoId, data, hora) {
    if (!data || !hora) return showMsg('Preencha data e hora.')
    await setDoc(doc(db,'mm_jogos',String(jogoId)),{data, hora}, {merge:true})
    setEditJogo(p=>{const n={...p};delete n[jogoId];return n})
    showMsg('Data/hora atualizada! ✓')
  }

  async function togglePagamento(uid, pagoMM) {
    await updateDoc(doc(db,'usuarios',uid), { pagoMM: !pagoMM })
    showMsg(!pagoMM ? '✅ Pagamento confirmado!' : '⚠️ Pagamento removido.')
  }

  const pagos = Object.entries(usuarios).filter(([,u])=>u.pagoMM)
  const nPagos = Object.entries(usuarios).filter(([,u])=>!u.pagoMM)
  const totalArrecadado = pagos.length * 100

  return (
    <div>
      {msg && <div style={{position:'fixed',top:72,left:'50%',transform:'translateX(-50%)',background:'#7b1fa2',color:'#fff',padding:'8px 20px',borderRadius:99,zIndex:999,fontSize:14,fontWeight:600}}>{msg}</div>}

      {confirmDelete && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:998}}>
          <div style={{background:'#fff',borderRadius:16,padding:'24px',width:340,maxWidth:'90vw',textAlign:'center'}}>
            <div style={{fontSize:32,marginBottom:12}}>⚠️</div>
            <div style={{fontWeight:700,fontSize:16,marginBottom:8}}>Apagar resultado?</div>
            <div style={{fontSize:13,color:'#888',marginBottom:20}}>
              Resultado: {confirmDelete.res.g1} × {confirmDelete.res.g2}<br/>
              <strong>Os pontos serão recalculados.</strong>
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'center'}}>
              <button style={s.btn('#c62828')} onClick={()=>apagarResultado(confirmDelete.id)}>Sim, apagar</button>
              <button style={s.btn('#888')} onClick={()=>setConfirmDelete(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        <button style={s.tab(aba==='resultados')} onClick={()=>setAba('resultados')}>⚽ Resultados</button>
        <button style={s.tab(aba==='times')} onClick={()=>setAba('times')}>👥 Times</button>
        <button style={s.tab(aba==='pagamentos')} onClick={()=>setAba('pagamentos')}>💰 Pagamentos</button>
        <button style={s.tab(aba==='participantes')} onClick={()=>setAba('participantes')}>📋 Participantes</button>
      </div>

      {(aba==='resultados'||aba==='times') && (
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
          {fases.map(f=><button key={f} style={s.fBtn(fase===f)} onClick={()=>setFase(f)}>{faseLabel(f)}</button>)}
        </div>
      )}

      {aba === 'resultados' && (
        <>
          {filtrados.map(jogo => {
            const res = resultados[String(jogo.id)]
            const ep = editando['r_'+jogo.id]||{}
            const modoEdicao = ep.g1 !== undefined
            const t1 = getTime1(jogo)
            const t2 = getTime2(jogo)
            const {data, hora} = getJogoData(jogo)
            return (
              <div key={jogo.id} style={s.card}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#888',marginBottom:6}}>
                  <span>J{jogo.id} • {faseLabel(jogo.fase)}</span>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    {res?.automatico && <span style={s.badge('#1565c0')}>🤖 Auto</span>}
                    {res?.manual && <span style={s.badge('#2e7d32')}>✋ Manual</span>}
                    <span>{new Date(data+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})} {hora}h</span>
                  </div>
                </div>
                <div style={{fontWeight:700,fontSize:16,marginBottom:10}}>{t1} × {t2}</div>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                  <input style={s.inp} type="number" min="0" placeholder="0"
                    value={ep.g1!==undefined?ep.g1:(res?res.g1:'')}
                    onChange={e=>setEditando(p=>({...p,['r_'+jogo.id]:{...ep,g1:e.target.value}}))} />
                  <span style={{color:'#999'}}>×</span>
                  <input style={s.inp} type="number" min="0" placeholder="0"
                    value={ep.g2!==undefined?ep.g2:(res?res.g2:'')}
                    onChange={e=>setEditando(p=>({...p,['r_'+jogo.id]:{...ep,g2:e.target.value}}))} />
                  <button style={s.btn()} onClick={()=>salvarResultado(jogo.id)}>{res?'Atualizar':'Salvar'}</button>
                  {res && !modoEdicao && <button style={s.btn('#1565c0')} onClick={()=>setEditando(p=>({...p,['r_'+jogo.id]:{g1:String(res.g1),g2:String(res.g2)}}))}>✏️ Editar</button>}
                  {res && <button style={s.btn('#c62828')} onClick={()=>setConfirmDelete({id:jogo.id,res})}>🗑️ Apagar</button>}
                  {modoEdicao && <button style={s.btn('#888')} onClick={()=>setEditando(p=>{const n={...p};delete n['r_'+jogo.id];return n})}>Cancelar</button>}
                </div>
                <div style={{marginTop:10,fontSize:12,color:'#666',display:'flex',flexWrap:'wrap',gap:8}}>
                  {Object.keys(usuarios).map(uid => {
                    const p=(palpites[uid]||{})[String(jogo.id)]
                    if(!p) return null
                    const pts = res ? calcPontos(p,res) : null
                    return (
                      <span key={uid} style={{background:'#f5f5f5',padding:'3px 8px',borderRadius:6}}>
                        {usuarios[uid].nome}: {p.g1}×{p.g2} {pts!==null?`(${pts}pts)`:''}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </>
      )}

      {aba === 'times' && (
        <>
          <p style={{fontSize:13,color:'#888',marginBottom:12}}>Atualize os times e datas conforme os resultados saírem</p>
          {filtrados.map(jogo => {
            const t1 = getTime1(jogo)
            const t2 = getTime2(jogo)
            const et = editTimes[jogo.id] || {}
            const ej = editJogo[jogo.id] || {}
            const {data, hora} = getJogoData(jogo)
            const definido = !t1.startsWith('Vencedor') && !t1.startsWith('Perdedor')
            return (
              <div key={jogo.id} style={s.card}>
                <div style={{fontSize:12,color:'#888',marginBottom:8}}>
                  J{jogo.id} • {faseLabel(jogo.fase)} • {new Date(data+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})} {hora}h • {jogo.cidade}
                </div>
                <div style={{fontWeight:600,marginBottom:12,color:definido?'#1a1a1a':'#aaa'}}>{t1} × {t2}</div>

                <div style={{marginBottom:12}}>
                  <div style={{fontSize:12,fontWeight:600,color:'#555',marginBottom:6}}>✏️ Atualizar times:</div>
                  <input style={s.inpText} placeholder="Time 1" value={et.time1!==undefined?et.time1:t1} onChange={e=>setEditTimes(p=>({...p,[jogo.id]:{...et,time1:e.target.value}}))} />
                  <input style={s.inpText} placeholder="Time 2" value={et.time2!==undefined?et.time2:t2} onChange={e=>setEditTimes(p=>({...p,[jogo.id]:{...et,time2:e.target.value}}))} />
                  <button style={s.btn()} onClick={()=>salvarTimes(jogo.id)}>Salvar times</button>
                </div>

                <div>
                  <div style={{fontSize:12,fontWeight:600,color:'#555',marginBottom:6}}>🕐 Ajustar data/hora:</div>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                    <input type="date" style={{padding:'8px 12px',borderRadius:8,border:'1px solid #ddd',fontSize:14}}
                      value={ej.data !== undefined ? ej.data : data}
                      onChange={e=>setEditJogo(p=>({...p,[jogo.id]:{...ej,data:e.target.value,hora:ej.hora!==undefined?ej.hora:hora}}))} />
                    <input type="time" style={{padding:'8px 12px',borderRadius:8,border:'1px solid #ddd',fontSize:14}}
                      value={ej.hora !== undefined ? ej.hora : hora}
                      onChange={e=>setEditJogo(p=>({...p,[jogo.id]:{...ej,hora:e.target.value,data:ej.data!==undefined?ej.data:data}}))} />
                    <button style={s.btn('#e65100')} onClick={()=>salvarDadosJogo(jogo.id, ej.data||data, ej.hora||hora)}>
                      Salvar data/hora
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </>
      )}

      {aba === 'pagamentos' && (
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:20}}>
            <div style={{background:'#f3e5f5',borderRadius:12,padding:'16px',textAlign:'center'}}>
              <div style={{fontSize:28,fontWeight:800,color:'#7b1fa2'}}>{pagos.length}</div>
              <div style={{fontSize:13,color:'#555'}}>Confirmados</div>
            </div>
            <div style={{background:'#fff3e0',borderRadius:12,padding:'16px',textAlign:'center'}}>
              <div style={{fontSize:28,fontWeight:800,color:'#e65100'}}>{nPagos.length}</div>
              <div style={{fontSize:13,color:'#555'}}>Pendentes</div>
            </div>
            <div style={{background:'#e8f5e9',borderRadius:12,padding:'16px',textAlign:'center'}}>
              <div style={{fontSize:28,fontWeight:800,color:'#2e7d32'}}>R$ {totalArrecadado}</div>
              <div style={{fontSize:13,color:'#555'}}>Arrecadado</div>
            </div>
            <div style={{background:'#e3f2fd',borderRadius:12,padding:'16px',textAlign:'center'}}>
              <div style={{fontSize:16,fontWeight:800,color:'#1565c0'}}>
                R${Math.round(totalArrecadado*0.6)} / R${Math.round(totalArrecadado*0.3)} / R${Math.round(totalArrecadado*0.1)}
              </div>
              <div style={{fontSize:13,color:'#555'}}>1º / 2º / 3º</div>
            </div>
          </div>

          <h3 style={{fontSize:16,fontWeight:700,marginBottom:10,color:'#c62828'}}>⏳ Pendentes ({nPagos.length})</h3>
          {nPagos.map(([uid,u]) => (
            <div key={uid} style={s.userCard}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
                <div>
                  <div style={{fontWeight:600}}>{u.nome}</div>
                  <div style={{fontSize:12,color:'#888'}}>{u.email} {u.telefone?`• ${u.telefone}`:''}</div>
                  {u.cpf && <div style={{fontSize:12,color:'#888'}}>CPF: {u.cpf}</div>}
                  {u.pago && <div style={{fontSize:11,color:'#2e7d32'}}>✅ Pagou fase de grupos</div>}
                </div>
                <button style={s.btn('#2e7d32')} onClick={()=>togglePagamento(uid,u.pagoMM)}>✅ Confirmar</button>
              </div>
            </div>
          ))}

          <h3 style={{fontSize:16,fontWeight:700,margin:'20px 0 10px',color:'#2e7d32'}}>✅ Confirmados ({pagos.length})</h3>
          {pagos.map(([uid,u]) => (
            <div key={uid} style={s.userCard}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
                <div>
                  <div style={{fontWeight:600}}>{u.nome}</div>
                  <div style={{fontSize:12,color:'#888'}}>{u.email} {u.telefone?`• ${u.telefone}`:''}</div>
                  {u.cpf && <div style={{fontSize:12,color:'#888'}}>CPF: {u.cpf}</div>}
                </div>
                <button style={s.btn('#c62828')} onClick={()=>togglePagamento(uid,u.pagoMM)}>❌ Remover</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {aba === 'participantes' && (
        <div>
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:12,color:'#7b1fa2'}}>📋 Todos ({Object.keys(usuarios).length})</h3>
          {Object.entries(usuarios).map(([uid,u]) => (
            <div key={uid} style={s.userCard}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                    <span style={{fontWeight:600,fontSize:15}}>{u.nome}</span>
                    <span style={s.badge(u.pagoMM?'#2e7d32':'#e65100')}>{u.pagoMM?'✅ Pago MM':'⏳ Pendente MM'}</span>
                    {u.pago && <span style={s.badge('#1565c0')}>✅ Pago GF</span>}
                  </div>
                  <div style={{fontSize:12,color:'#888',marginTop:2}}>{u.email}</div>
                  {u.telefone && <div style={{fontSize:12,color:'#888'}}>📱 {u.telefone}</div>}
                  {u.cpf && <div style={{fontSize:12,color:'#888'}}>🪪 {u.cpf}</div>}
                  <div style={{fontSize:12,color:'#888'}}>Palpites MM: {Object.keys((palpites[uid]||{})).length} jogos</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

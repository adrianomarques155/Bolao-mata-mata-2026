import { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const s = {
  overlay: {position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999},
  box: {background:'#fff',borderRadius:16,padding:'2rem',width:400,maxWidth:'92vw',boxShadow:'0 20px 60px rgba(0,0,0,0.3)',maxHeight:'90vh',overflowY:'auto'},
  title: {fontSize:22,fontWeight:700,marginBottom:4,color:'#7b1fa2'},
  sub: {fontSize:13,color:'#888',marginBottom:20},
  inp: {width:'100%',padding:'10px 14px',borderRadius:8,border:'1px solid #ddd',fontSize:15,marginBottom:12,outline:'none'},
  btn: (c) => ({width:'100%',padding:'11px',borderRadius:8,border:'none',background:c||'#7b1fa2',color:'#fff',fontSize:15,fontWeight:600,cursor:'pointer',marginBottom:8}),
  link: {fontSize:13,color:'#7b1fa2',cursor:'pointer',textDecoration:'underline',textAlign:'center',display:'block',marginTop:4},
  err: {fontSize:13,color:'#c62828',marginBottom:10,padding:'8px 12px',background:'#ffebee',borderRadius:6},
  ok: {fontSize:13,color:'#2e7d32',marginBottom:10,padding:'8px 12px',background:'#e8f5e9',borderRadius:6},
  opt: {fontSize:12,color:'#888',marginBottom:8,fontStyle:'italic'},
  pix: {background:'#f3e5f5',border:'1px solid #ce93d8',borderRadius:8,padding:'12px',marginBottom:16,fontSize:13},
  pixTitle: {fontWeight:700,color:'#7b1fa2',marginBottom:4},
}

export default function AuthModal({ mode, onClose, onSwitch }) {
  const [form, setForm] = useState({})
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [loading, setLoading] = useState(false)
  const [telaReset, setTelaReset] = useState(false)
  const f = (k) => (e) => setForm(p => ({...p,[k]:e.target.value}))

  async function handleLogin() {
    if (!form.email || !form.senha) return setErr('Preencha email e senha.')
    setLoading(true); setErr('')
    try {
      await signInWithEmailAndPassword(auth, form.email, form.senha)
      onClose()
    } catch (e) {
      setErr('Email ou senha incorretos.')
    }
    setLoading(false)
  }

  async function handleCadastro() {
    if (!form.nome || !form.email || !form.senha || !form.senha2) return setErr('Preencha os campos obrigatórios.')
    if (form.senha !== form.senha2) return setErr('Senhas não conferem.')
    if (form.senha.length < 6) return setErr('Senha mínima: 6 caracteres.')
    setLoading(true); setErr('')
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.senha)
      await setDoc(doc(db, 'usuarios', cred.user.uid), {
        nome: form.nome,
        email: form.email,
        telefone: form.telefone || '',
        cpf: form.cpf || '',
        pago: false,
        criadoEm: new Date()
      })
      onClose()
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') setErr('Email já cadastrado.')
      else setErr('Erro ao cadastrar. Tente novamente.')
    }
    setLoading(false)
  }

  async function handleReset() {
    if (!form.emailReset) return setErr('Digite seu email.')
    setLoading(true); setErr(''); setOk('')
    try {
      await sendPasswordResetEmail(auth, form.emailReset)
      setOk('Email enviado! Verifique sua caixa de entrada.')
    } catch (e) {
      if (e.code === 'auth/user-not-found') setErr('Email não encontrado.')
      else setErr('Erro ao enviar email. Tente novamente.')
    }
    setLoading(false)
  }

  if (telaReset) return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.box} onClick={e => e.stopPropagation()}>
        <div style={s.title}>Recuperar senha</div>
        <div style={s.sub}>Digite seu email para receber o link de redefinição</div>
        {err && <div style={s.err}>{err}</div>}
        {ok && <div style={s.ok}>{ok}</div>}
        <input style={s.inp} placeholder="Seu email *" type="email" value={form.emailReset||''} onChange={f('emailReset')} onKeyDown={e=>e.key==='Enter'&&handleReset()} />
        <button style={s.btn()} onClick={handleReset} disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar link de recuperação'}
        </button>
        <span style={s.link} onClick={()=>{setTelaReset(false);setErr('');setOk('')}}>
          Voltar ao login
        </span>
      </div>
    </div>
  )

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.box} onClick={e => e.stopPropagation()}>
        <div style={s.title}>{mode === 'login' ? 'Entrar no Bolão' : 'Criar conta'}</div>
        <div style={s.sub}>{mode === 'login' ? 'Bem-vindo de volta!' : 'Cadastre-se para participar'}</div>

        {mode === 'cadastro' && (
          <div style={s.pix}>
            <div style={s.pixTitle}>💰 Inscrição: R$ 100,00 via PIX</div>
            <div>Chave PIX: <strong>olavosmlima@gmail.com</strong></div>
            <div style={{marginTop:4,color:'#555'}}>
              Após o cadastro, envie o comprovante via WhatsApp <strong>(85) 98851-8874</strong>.
            </div>
          </div>
        )}

        {err && <div style={s.err}>{err}</div>}

        {mode === 'cadastro' && (
          <>
            <input style={s.inp} placeholder="Nome completo *" value={form.nome||''} onChange={f('nome')} />
            <input style={s.inp} placeholder="(xx) xxxxx-xxxx" value={form.telefone||''} onChange={e => {
              let v = e.target.value.replace(/\D/g,'').substring(0,11)
              if (v.length > 6) v = `(${v.substring(0,2)}) ${v.substring(2,7)}-${v.substring(7)}`
              else if (v.length > 2) v = `(${v.substring(0,2)}) ${v.substring(2)}`
              else if (v.length > 0) v = `(${v}`
              setForm(p=>({...p,telefone:v}))
            }} />
            <input style={s.inp} placeholder="xxx.xxx.xxx-xx" value={form.cpf||''} onChange={e => {
              let v = e.target.value.replace(/\D/g,'').substring(0,11)
              if (v.length > 9) v = `${v.substring(0,3)}.${v.substring(3,6)}.${v.substring(6,9)}-${v.substring(9)}`
              else if (v.length > 6) v = `${v.substring(0,3)}.${v.substring(3,6)}.${v.substring(6)}`
              else if (v.length > 3) v = `${v.substring(0,3)}.${v.substring(3)}`
              setForm(p=>({...p,cpf:v}))
            }} />
            <div style={s.opt}>* Telefone e CPF são opcionais mas ajudam na confirmação do pagamento</div>
          </>
        )}

        <input style={s.inp} placeholder="Email *" type="email" value={form.email||''} onChange={f('email')} />
        <input style={s.inp} placeholder="Senha *" type="password" value={form.senha||''} onChange={f('senha')} onKeyDown={e=>e.key==='Enter'&&mode==='login'&&handleLogin()} />
        {mode === 'cadastro' && (
          <input style={s.inp} placeholder="Confirmar senha *" type="password" value={form.senha2||''} onChange={f('senha2')} />
        )}

        <button style={s.btn()} onClick={mode==='login' ? handleLogin : handleCadastro} disabled={loading}>
          {loading ? 'Aguarde...' : mode==='login' ? 'Entrar' : 'Cadastrar'}
        </button>

        {mode === 'login' && (
          <span style={s.link} onClick={()=>{setTelaReset(true);setErr('')}}>
            Esqueci minha senha
          </span>
        )}

        {mode === 'login'
          ? <span style={{...s.link,marginTop:8}} onClick={() => onSwitch('cadastro')}>Não tem conta? Cadastre-se</span>
          : <span style={s.link} onClick={() => onSwitch('login')}>Já tem conta? Entre aqui</span>
        }
      </div>
    </div>
  )
}

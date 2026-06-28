import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import Header from './components/Header'
import AuthModal from './components/AuthModal'
import Jogos from './components/Jogos'
import Ranking from './components/Ranking'
import Admin from './components/Admin'
import Landing from './components/Landing'

const ADMIN_EMAIL = 'admin@bolao2026.com'

export default function App() {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [view, setView] = useState('jogos')
  const [authModal, setAuthModal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const snap = await getDoc(doc(db, 'usuarios', u.uid))
        if (snap.exists()) setPerfil(snap.data())
        setIsAdmin(u.email === ADMIN_EMAIL)
      } else {
        setPerfil(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })
  }, [])

  function handleLogout() {
    signOut(auth)
    setView('jogos')
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontSize:18,color:'#555'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:16}}>🏆</div>
        <div>Carregando...</div>
      </div>
    </div>
  )

  if (!user) return (
    <>
      <Landing
        onLogin={() => setAuthModal('login')}
        onCadastro={() => setAuthModal('cadastro')}
      />
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSwitch={(m) => setAuthModal(m)}
        />
      )}
    </>
  )

  return (
    <div style={{minHeight:'100vh',background:'#f0f2f5'}}>
      <Header
        user={user} perfil={perfil} isAdmin={isAdmin} view={view}
        setView={setView} onLogout={handleLogout}
        onLogin={() => setAuthModal('login')}
        onCadastro={() => setAuthModal('cadastro')}
      />
      <div style={{maxWidth:780,margin:'0 auto',padding:'16px 12px 40px'}}>
        {!perfil?.pago && !isAdmin && (
          <div style={{background:'#fff3e0',border:'1px solid #ffb74d',borderRadius:12,padding:'14px 16px',marginBottom:16,fontSize:14}}>
            ⚠️ <strong>Pagamento pendente.</strong> Seus palpites não contam no ranking até a confirmação do PIX.
            <div style={{marginTop:4,color:'#888'}}>Chave PIX: <strong>olavosmlima@gmail.com</strong> — R$ 100,00</div>
          </div>
        )}
        {view === 'jogos'   && <Jogos user={user} isAdmin={isAdmin} />}
        {view === 'ranking' && <Ranking user={user} />}
        {view === 'admin'   && isAdmin && <Admin />}
      </div>
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSwitch={(m) => setAuthModal(m)}
        />
      )}
    </div>
  )
}
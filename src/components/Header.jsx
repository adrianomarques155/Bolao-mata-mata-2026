const s = {
  header: {background:'#7b1fa2',padding:'0 16px',position:'sticky',top:0,zIndex:100,boxShadow:'0 2px 8px rgba(0,0,0,0.2)'},
  inner: {maxWidth:780,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',height:56},
  logo: {color:'#fff',fontSize:18,fontWeight:700,letterSpacing:'-0.5px'},
  nav: {display:'flex',gap:4,alignItems:'center'},
  navBtn: (a) => ({padding:'6px 12px',borderRadius:8,border:'none',background:a?'rgba(255,255,255,0.2)':'transparent',color:'#fff',cursor:'pointer',fontSize:14,fontWeight:a?600:400}),
  authBtn: (primary) => ({padding:'6px 14px',borderRadius:8,border:primary?'none':'1px solid rgba(255,255,255,0.5)',background:primary?'#fff':'transparent',color:primary?'#7b1fa2':'#fff',cursor:'pointer',fontSize:13,fontWeight:600,marginLeft:4}),
  user: {color:'rgba(255,255,255,0.85)',fontSize:13,marginRight:8}
}

export default function Header({ user, perfil, isAdmin, view, setView, onLogout, onLogin, onCadastro }) {
  return (
    <div style={s.header}>
      <div style={s.inner}>
        <div style={s.logo}>🏆 Bolão Mata-Mata 2026</div>
        <div style={s.nav}>
          {!isAdmin && <button style={s.navBtn(view==='jogos')} onClick={() => setView('jogos')}>Jogos</button>}
          <button style={s.navBtn(view==='ranking')} onClick={() => setView('ranking')}>Ranking</button>
          {isAdmin && <button style={s.navBtn(view==='admin')} onClick={() => setView('admin')}>Admin</button>}
          {user ? (
            <>
              <span style={s.user}>{perfil?.nome || user.email}</span>
              <button style={s.authBtn(false)} onClick={onLogout}>Sair</button>
            </>
          ) : (
            <>
              <button style={s.authBtn(false)} onClick={onLogin}>Entrar</button>
              <button style={s.authBtn(true)} onClick={onCadastro}>Cadastrar</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

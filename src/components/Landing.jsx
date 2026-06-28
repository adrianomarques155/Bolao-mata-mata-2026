const s = {
  wrap: {minHeight:'100vh',background:'linear-gradient(135deg,#4a148c 0%,#7b1fa2 50%,#6a1b9a 100%)'},
  hero: {maxWidth:780,margin:'0 auto',padding:'60px 20px 40px',textAlign:'center'},
  titulo: {fontSize:44,fontWeight:800,color:'#fff',marginBottom:8,letterSpacing:'-1px'},
  sub: {fontSize:18,color:'rgba(255,255,255,0.85)',marginBottom:40},
  btnWrap: {display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:60},
  btnPrimary: {padding:'14px 36px',borderRadius:12,border:'none',background:'#fff',color:'#7b1fa2',fontSize:16,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 20px rgba(0,0,0,0.2)'},
  btnSecondary: {padding:'14px 36px',borderRadius:12,border:'2px solid rgba(255,255,255,0.7)',background:'transparent',color:'#fff',fontSize:16,fontWeight:700,cursor:'pointer'},
  section: {background:'#fff',borderRadius:20,padding:'32px',marginBottom:20,boxShadow:'0 4px 20px rgba(0,0,0,0.1)'},
  sectionTitle: {fontSize:22,fontWeight:700,color:'#7b1fa2',marginBottom:20,display:'flex',alignItems:'center',gap:8},
  grid: {display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12},
  ruleCard: {background:'#f8f9fa',borderRadius:12,padding:'16px',textAlign:'center'},
  pts: {fontSize:32,fontWeight:800,color:'#7b1fa2'},
  ruleDesc: {fontSize:13,color:'#555',marginTop:4},
  premioCard: {background:'#f8f9fa',borderRadius:12,padding:'20px',textAlign:'center'},
  pixBox: {background:'#f3e5f5',border:'2px solid #ce93d8',borderRadius:12,padding:'20px',textAlign:'center'},
  pixChave: {fontSize:20,fontWeight:700,color:'#7b1fa2',margin:'8px 0'},
  pixValor: {fontSize:28,fontWeight:800,color:'#6a1b9a'},
  infoGrid: {display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:32},
  infoCard: {background:'rgba(255,255,255,0.15)',borderRadius:12,padding:'16px',textAlign:'center'},
  infoNum: {fontSize:28,fontWeight:800,color:'#fff'},
  infoLabel: {fontSize:12,color:'rgba(255,255,255,0.8)',marginTop:4},
  footer: {textAlign:'center',padding:'20px',color:'rgba(255,255,255,0.6)',fontSize:13},
}

export default function Landing({ onLogin, onCadastro }) {
  return (
    <div style={s.wrap}>
      <div style={s.hero}>
        <div style={{fontSize:64,marginBottom:8}}>🏆</div>
        <div style={s.titulo}>Bolão Mata-Mata 2026</div>
        <div style={s.sub}>Das oitavas até a grande final • 28 de junho a 19 de julho</div>

        <div style={s.infoGrid}>
          <div style={s.infoCard}>
            <div style={s.infoNum}>32</div>
            <div style={s.infoLabel}>Seleções</div>
          </div>
          <div style={s.infoCard}>
            <div style={s.infoNum}>31</div>
            <div style={s.infoLabel}>Jogos</div>
          </div>
          <div style={s.infoCard}>
            <div style={s.infoNum}>R$100</div>
            <div style={s.infoLabel}>Inscrição</div>
          </div>
          <div style={s.infoCard}>
            <div style={s.infoNum}>10pts</div>
            <div style={s.infoLabel}>Placar exato</div>
          </div>
        </div>

        <div style={s.btnWrap}>
          <button style={s.btnPrimary} onClick={onCadastro}>Quero participar!</button>
          <button style={s.btnSecondary} onClick={onLogin}>Já tenho conta</button>
        </div>

        <div style={{maxWidth:680,margin:'0 auto',display:'flex',flexDirection:'column',gap:20}}>

          <div style={s.section}>
            <div style={s.sectionTitle}>⚽ Regras de pontuação</div>
            <div style={s.grid}>
              {[
                {pts:10, emoji:'🎯', desc:'Placar exato'},
                {pts:6,  emoji:'🤝', desc:'Empate certo na prorrogação'},
                {pts:4,  emoji:'✅', desc:'Vencedor + placar do vencedor'},
                {pts:3,  emoji:'👍', desc:'Vencedor + placar do perdedor'},
                {pts:2,  emoji:'👌', desc:'Só o vencedor certo'},
                {pts:0,  emoji:'❌', desc:'Errou tudo'},
              ].map(r => (
                <div key={r.pts+r.emoji} style={s.ruleCard}>
                  <div style={{fontSize:28}}>{r.emoji}</div>
                  <div style={s.pts}>{r.pts} pts</div>
                  <div style={s.ruleDesc}>{r.desc}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:16,fontSize:13,color:'#888',textAlign:'center'}}>
              ⏰ Palpites aceitos até 2 horas antes de cada jogo<br/>
              🥅 Se o jogo foi para pênaltis → empate no palpite conta como acerto
            </div>
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>🏅 Premiação</div>
            <div style={s.grid}>
              {[
                {pos:'🥇 1º lugar', perc:'60%', cor:'#f39c12'},
                {pos:'🥈 2º lugar', perc:'30%', cor:'#95a5a6'},
                {pos:'🥉 3º lugar', perc:'10%', cor:'#e67e22'},
              ].map(p => (
                <div key={p.pos} style={{...s.premioCard,borderTop:`4px solid ${p.cor}`}}>
                  <div style={{fontSize:20,marginBottom:4}}>{p.pos}</div>
                  <div style={{fontSize:28,fontWeight:800,color:p.cor}}>{p.perc}</div>
                  <div style={s.ruleDesc}>do total arrecadado</div>
                </div>
              ))}
            </div>
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>💰 Como se inscrever</div>
            <div style={{fontSize:14,color:'#555',marginBottom:16,lineHeight:1.7}}>
              1. Faça seu cadastro clicando em <strong>"Quero participar!"</strong><br/>
              2. Envie R$ 100,00 via PIX para a chave abaixo<br/>
              3. Envie o comprovante via WhatsApp <strong>(85) 98851-8874</strong><br/>
              4. Aguarde a confirmação do pagamento pelo administrador<br/>
              5. Seus palpites passarão a valer no ranking após a confirmação
            </div>
            <div style={s.pixBox}>
              <div style={{fontSize:13,color:'#555',marginBottom:4}}>Chave PIX</div>
              <div style={s.pixChave}>olavosmlima@gmail.com</div>
              <div style={{fontSize:13,color:'#555',margin:'8px 0 4px'}}>Valor da inscrição</div>
              <div style={s.pixValor}>R$ 100,00</div>
            </div>
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>📋 Regras gerais</div>
            <ul style={{fontSize:14,color:'#555',lineHeight:2,paddingLeft:20}}>
              <li>Palpites devem ser feitos até <strong>2 horas antes</strong> do jogo</li>
              <li>O resultado considera 90 minutos + prorrogação</li>
              <li>Se o jogo foi para pênaltis, empate no palpite = acerto do resultado</li>
              <li>Apenas participantes com pagamento confirmado aparecem no ranking</li>
              <li>Em caso de empate no ranking, o critério de desempate é o número de acertos</li>
              <li>A premiação será distribuída ao final do torneio</li>
            </ul>
          </div>

        </div>
      </div>
      <div style={s.footer}>Bolão Mata-Mata Copa 2026 • Boa sorte a todos! 🍀</div>
    </div>
  )
}

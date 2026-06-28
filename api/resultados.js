const { initializeApp, getApps } = require('firebase/app')
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore')

const firebaseConfig = {
  apiKey: "AIzaSyCnYXpvqLyGJKHALxHCzKkL5BJPPrubgB8",
  authDomain: "bolao-copa-2026-62061.firebaseapp.com",
  projectId: "bolao-copa-2026-62061",
  storageBucket: "bolao-copa-2026-62061.firebasestorage.app",
  messagingSenderId: "1005682229645",
  appId: "1:1005682229645:web:31fdb8c5e94826dd497dc4"
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const db = getFirestore(app)

const FOOTBALL_API_KEY = '67553079ea0041ad9b895dd31018b4b4'
const COMPETITION_ID = 2000

const MAPA_TIMES = {
  'Brazil': 'Brasil', 'Morocco': 'Marrocos', 'Japan': 'Japão',
  'Germany': 'Alemanha', 'Paraguay': 'Paraguai', 'Netherlands': 'Países Baixos',
  "Côte d'Ivoire": 'Costa do Marfim', 'Norway': 'Noruega', 'France': 'França',
  'Sweden': 'Suécia', 'Mexico': 'México', 'Ecuador': 'Equador',
  'England': 'Inglaterra', 'DR Congo': 'Congo (RD)', 'Belgium': 'Bélgica',
  'Senegal': 'Senegal', 'USA': 'Estados Unidos', 'Bosnia and Herzegovina': 'Bósnia-Herzegovina',
  'Spain': 'Espanha', 'Austria': 'Áustria', 'Portugal': 'Portugal',
  'Croatia': 'Croácia', 'Switzerland': 'Suíça', 'Algeria': 'Argélia',
  'Australia': 'Austrália', 'Egypt': 'Egito', 'Argentina': 'Argentina',
  'Cabo Verde': 'Cabo Verde', 'Colombia': 'Colômbia', 'Ghana': 'Gana',
  'South Africa': 'África do Sul', 'Canada': 'Canadá',
}

const JOGOS = [
  { id:101, time1:"África do Sul",  time2:"Canadá" },
  { id:102, time1:"Brasil",          time2:"Japão" },
  { id:103, time1:"Alemanha",        time2:"Paraguai" },
  { id:104, time1:"Países Baixos",   time2:"Marrocos" },
  { id:105, time1:"Costa do Marfim", time2:"Noruega" },
  { id:106, time1:"França",          time2:"Suécia" },
  { id:107, time1:"México",          time2:"Equador" },
  { id:108, time1:"Inglaterra",      time2:"Congo (RD)" },
  { id:109, time1:"Bélgica",         time2:"Senegal" },
  { id:110, time1:"Estados Unidos",  time2:"Bósnia-Herzegovina" },
  { id:111, time1:"Espanha",         time2:"Áustria" },
  { id:112, time1:"Portugal",        time2:"Croácia" },
  { id:113, time1:"Suíça",           time2:"Argélia" },
  { id:114, time1:"Austrália",       time2:"Egito" },
  { id:115, time1:"Argentina",       time2:"Cabo Verde" },
  { id:116, time1:"Colômbia",        time2:"Gana" },
]

function normalizar(nome) {
  return (MAPA_TIMES[nome] || nome).toLowerCase().trim()
}

function encontrarJogo(time1Api, time2Api) {
  const t1 = normalizar(time1Api)
  const t2 = normalizar(time2Api)
  return JOGOS.find(j => {
    const jt1 = j.time1.toLowerCase().trim()
    const jt2 = j.time2.toLowerCase().trim()
    return (jt1===t1 && jt2===t2) || (jt1===t2 && jt2===t1)
  })
}

module.exports = async function handler(req, res) {
  try {
    const response = await fetch(
      `https://api.football-data.org/v4/competitions/${COMPETITION_ID}/matches?status=FINISHED`,
      { headers: { 'X-Auth-Token': FOOTBALL_API_KEY } }
    )

    if (!response.ok) {
      return res.status(500).json({ error: 'Erro ao buscar dados da API' })
    }

    const data = await response.json()
    const matches = data.matches || []

    let atualizados = 0
    let ignorados = 0

    for (const match of matches) {
      const t1Api = match.homeTeam.name
      const t2Api = match.awayTeam.name
      const g1 = match.score.fullTime.home
      const g2 = match.score.fullTime.away

      if (g1 === null || g2 === null) { ignorados++; continue }

      const jogo = encontrarJogo(t1Api, t2Api)
      if (!jogo) { ignorados++; continue }

      const jogoInvertido = normalizar(t1Api) === jogo.time2.toLowerCase().trim()
      const g1Final = jogoInvertido ? g2 : g1
      const g2Final = jogoInvertido ? g1 : g2

      const ref = doc(db, 'mm_resultados', String(jogo.id))
      const snap = await getDoc(ref)

      if (!snap.exists() || snap.data()?.automatico === true) {
        await setDoc(ref, { g1: g1Final, g2: g2Final, automatico: true })
        atualizados++
      } else {
        ignorados++
      }
    }

    return res.status(200).json({ ok: true, atualizados, ignorados, total: matches.length })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

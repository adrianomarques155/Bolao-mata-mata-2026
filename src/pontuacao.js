export function calcPontos(palpite, resultado) {
  if (!resultado || resultado.g1 === undefined || resultado.g2 === undefined) return null
  const pg1 = parseInt(palpite.g1), pg2 = parseInt(palpite.g2)
  const rg1 = parseInt(resultado.g1), rg2 = parseInt(resultado.g2)
  if (isNaN(pg1) || isNaN(pg2)) return null

  if (pg1 === rg1 && pg2 === rg2) return 10

  const pEmp = pg1 === pg2, rEmp = rg1 === rg2
  if (pEmp && rEmp) return 6

  const pVenc = pg1 > pg2 ? 1 : pg1 < pg2 ? 2 : 0
  const rVenc = rg1 > rg2 ? 1 : rg1 < rg2 ? 2 : 0

  if (pVenc === rVenc && pVenc !== 0) {
    if (pg1 === rg1) return 4
    if (pg2 === rg2) return 3
    return 2
  }
  return 0
}

export function ptsColor(pts) {
  if (pts === 10) return '#2e7d32'
  if (pts === 6)  return '#1565c0'
  if (pts >= 2)   return '#e65100'
  return '#c62828'
}

export function ptsLabel(pts) {
  if (pts === 10) return '🎯 Placar exato'
  if (pts === 6)  return '🤝 Empate certo'
  if (pts === 4)  return '✅ Placar do vencedor'
  if (pts === 3)  return '👍 Placar do perdedor'
  if (pts === 2)  return '👌 Vencedor certo'
  return '❌ Errou'
}

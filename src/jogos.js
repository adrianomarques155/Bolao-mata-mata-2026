export const JOGOS = [
  // 16 avos de final
  { id:101, fase:"16avos", data:"2026-06-28", hora:"16:00", time1:"África do Sul",  time2:"Canadá",             cidade:"Los Angeles",     jogo1:null, jogo2:null },
  { id:102, fase:"16avos", data:"2026-06-29", hora:"14:00", time1:"Brasil",          time2:"Japão",              cidade:"Houston",          jogo1:null, jogo2:null },
  { id:103, fase:"16avos", data:"2026-06-29", hora:"17:30", time1:"Alemanha",        time2:"Paraguai",           cidade:"Boston",           jogo1:null, jogo2:null },
  { id:104, fase:"16avos", data:"2026-06-29", hora:"22:00", time1:"Países Baixos",   time2:"Marrocos",           cidade:"Monterrey",        jogo1:null, jogo2:null },
  { id:105, fase:"16avos", data:"2026-06-30", hora:"14:00", time1:"Costa do Marfim", time2:"Noruega",            cidade:"Dallas",           jogo1:null, jogo2:null },
  { id:106, fase:"16avos", data:"2026-06-30", hora:"18:00", time1:"França",          time2:"Suécia",             cidade:"Atlanta",          jogo1:null, jogo2:null },
  { id:107, fase:"16avos", data:"2026-06-30", hora:"22:00", time1:"México",          time2:"Equador",            cidade:"Cidade do México", jogo1:null, jogo2:null },
  { id:108, fase:"16avos", data:"2026-07-01", hora:"13:00", time1:"Inglaterra",      time2:"Congo (RD)",         cidade:"Nova York/NJ",     jogo1:null, jogo2:null },
  { id:109, fase:"16avos", data:"2026-07-01", hora:"17:00", time1:"Bélgica",         time2:"Senegal",            cidade:"Miami",            jogo1:null, jogo2:null },
  { id:110, fase:"16avos", data:"2026-07-01", hora:"21:00", time1:"Estados Unidos",  time2:"Bósnia-Herzegovina", cidade:"Kansas City",      jogo1:null, jogo2:null },
  { id:111, fase:"16avos", data:"2026-07-02", hora:"16:00", time1:"Espanha",         time2:"Áustria",            cidade:"Philadelphia",     jogo1:null, jogo2:null },
  { id:112, fase:"16avos", data:"2026-07-02", hora:"20:00", time1:"Portugal",        time2:"Croácia",            cidade:"Boston",           jogo1:null, jogo2:null },
  { id:113, fase:"16avos", data:"2026-07-03", hora:"00:00", time1:"Suíça",           time2:"Argélia",            cidade:"Toronto",          jogo1:null, jogo2:null },
  { id:114, fase:"16avos", data:"2026-07-03", hora:"15:00", time1:"Austrália",       time2:"Egito",              cidade:"San Francisco",    jogo1:null, jogo2:null },
  { id:115, fase:"16avos", data:"2026-07-03", hora:"19:00", time1:"Argentina",       time2:"Cabo Verde",         cidade:"Vancouver",        jogo1:null, jogo2:null },
  { id:116, fase:"16avos", data:"2026-07-03", hora:"22:30", time1:"Colômbia",        time2:"Gana",               cidade:"Monterrey",        jogo1:null, jogo2:null },

  // Oitavas de final
  { id:201, fase:"oitavas", data:"2026-07-04", hora:"14:00", time1:"Vencedor J101", time2:"Vencedor J104", cidade:"Houston",          jogo1:101, jogo2:104 },
  { id:202, fase:"oitavas", data:"2026-07-04", hora:"18:00", time1:"Vencedor J103", time2:"Vencedor J106", cidade:"Philadelphia",     jogo1:103, jogo2:106 },
  { id:203, fase:"oitavas", data:"2026-07-05", hora:"17:00", time1:"Vencedor J102", time2:"Vencedor J105", cidade:"Nova York/NJ",     jogo1:102, jogo2:105 },
  { id:204, fase:"oitavas", data:"2026-07-05", hora:"21:00", time1:"Vencedor J107", time2:"Vencedor J108", cidade:"Cidade do México", jogo1:107, jogo2:108 },
  { id:205, fase:"oitavas", data:"2026-07-06", hora:"16:00", time1:"Vencedor J112", time2:"Vencedor J111", cidade:"Dallas",           jogo1:112, jogo2:111 },
  { id:206, fase:"oitavas", data:"2026-07-06", hora:"21:00", time1:"Vencedor J110", time2:"Vencedor J109", cidade:"Seattle",          jogo1:110, jogo2:109 },
  { id:207, fase:"oitavas", data:"2026-07-07", hora:"13:00", time1:"Vencedor J115", time2:"Vencedor J114", cidade:"Atlanta",          jogo1:115, jogo2:114 },
  { id:208, fase:"oitavas", data:"2026-07-07", hora:"17:00", time1:"Vencedor J113", time2:"Vencedor J116", cidade:"Vancouver",        jogo1:113, jogo2:116 },

  // Quartas de final
  { id:301, fase:"quartas", data:"2026-07-09", hora:"21:00", time1:"Vencedor J201", time2:"Vencedor J202", cidade:"Dallas",      jogo1:201, jogo2:202 },
  { id:302, fase:"quartas", data:"2026-07-10", hora:"21:00", time1:"Vencedor J203", time2:"Vencedor J204", cidade:"Los Angeles", jogo1:203, jogo2:204 },
  { id:303, fase:"quartas", data:"2026-07-11", hora:"18:00", time1:"Vencedor J205", time2:"Vencedor J206", cidade:"Miami",       jogo1:205, jogo2:206 },
  { id:304, fase:"quartas", data:"2026-07-11", hora:"22:00", time1:"Vencedor J207", time2:"Vencedor J208", cidade:"Boston",      jogo1:207, jogo2:208 },

  // Semifinais
  { id:401, fase:"semifinal", data:"2026-07-14", hora:"16:00", time1:"Vencedor J301", time2:"Vencedor J302", cidade:"Dallas",   jogo1:301, jogo2:302 },
  { id:402, fase:"semifinal", data:"2026-07-15", hora:"16:00", time1:"Vencedor J303", time2:"Vencedor J304", cidade:"Atlanta",  jogo1:303, jogo2:304 },

  // Terceiro lugar
  { id:501, fase:"terceiro", data:"2026-07-18", hora:"17:00", time1:"Perdedor J401", time2:"Perdedor J402", cidade:"Miami",      jogo1:401, jogo2:402 },

  // Final
  { id:601, fase:"final", data:"2026-07-19", hora:"16:00", time1:"Vencedor J401", time2:"Vencedor J402", cidade:"Nova York/NJ", jogo1:401, jogo2:402 },
]

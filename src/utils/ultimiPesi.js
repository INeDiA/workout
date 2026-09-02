// Chiave usata per indicizzare lo storico pesi: il catalogId (id stabile del
// database esercizi, indipendente da nome/lingua/rinomine) se presente,
// altrimenti il nome risolto — unico riferimento possibile per gli esercizi
// personalizzati, che non hanno un catalogId.
export function chiaveStorico(esercizio) {
  return esercizio.catalogId || esercizio.nome
}

// Trova, per ogni esercizio non a corpo libero, l'ultima voce registrata nello
// storico pesi (indicizzato per chiaveStorico, indipendente da quale scheda/
// sessione/id lo ha generato) — usato sia per pre-compilare una sessione appena
// iniziata sia per l'anteprima prima di iniziarla.
export function trovaUltimiPesi(esercizi, storicoPesi) {
  const risultato = {}
  for (const esercizio of esercizi) {
    if (esercizio.isBodyweight) continue
    const storico = storicoPesi[chiaveStorico(esercizio)]
    if (storico && storico.length > 0) {
      risultato[esercizio.id] = storico[storico.length - 1].sets
    }
  }
  return risultato
}

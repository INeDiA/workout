// Trova, per ogni esercizio non a corpo libero, i set dell'ultima sessione
// completata in cui è stato registrato un peso — usato sia per pre-compilare
// una sessione appena iniziata sia per l'anteprima prima di iniziarla.
export function trovaUltimiPesi(esercizi, sessioniCompletate) {
  const sessioni = [...sessioniCompletate].reverse() // più recenti prima
  const risultato = {}
  for (const esercizio of esercizi) {
    if (esercizio.isBodyweight) continue
    const ultima = sessioni.find(
      (s) => s.exercises[esercizio.id]?.sets?.some((set) => set.weight)
    )
    if (ultima) risultato[esercizio.id] = ultima.exercises[esercizio.id].sets
  }
  return risultato
}

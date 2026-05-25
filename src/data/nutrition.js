
export const NUTRIZIONE = {
  A: {
    preAllenamento: {
      titolo: 'Pre-allenamento (60-90 min prima)',
      alimenti: [
        '🍚 80-100g riso basmati + 200g tofu alla piastra',
        '🫐 Manciata di frutti di bosco o una banana matura',
        '☕ Caffè nero (opzionale, 30 min prima per il focus)',
      ],
    },
    postAllenamento: {
      titolo: 'Post-allenamento (entro 30-60 min)',
      alimenti: [
        '🥛 Shake proteico vegetale con latte di soia (30g proteine)',
        '🍌 1-2 banane o frutta ad alto indice glicemico',
        '🥜 30g burro di arachidi su fetta di pane integrale',
      ],
    },
    integratori: [
      { nome: 'Creatina monoidrata', dose: '5g', quando: 'Post-allenamento con il shake' },
      { nome: 'Vitamina B12', dose: '1000 mcg', quando: 'Mattina a digiuno' },
      { nome: 'Vitamina D3 + K2', dose: '2000 UI', quando: 'Con il pasto principale' },
      { nome: 'Omega 3 da alghe', dose: '2 capsule', quando: 'Con il pasto principale' },
      { nome: 'Pea protein / Whey', dose: '30-35g', quando: 'Post-allenamento' },
    ],
  },

  B: {
    preAllenamento: {
      titolo: 'Pre-allenamento (60-90 min prima)',
      alimenti: [
        '🥣 100g fiocchi d\'avena + latte vegetale + frutta fresca',
        '🥚 150g tempeh alla piastra o 3 uova strapazzate',
        '🍯 1 cucchiaio miele per energia rapida disponibile',
      ],
    },
    postAllenamento: {
      titolo: 'Post-allenamento (entro 30-60 min)',
      alimenti: [
        '🥛 Shake proteico vegetale con latte di soia (30g proteine)',
        '🍠 200g patata dolce al forno o 150g riso',
        '🥦 Verdure a piacere + 100g legumi misti',
      ],
    },
    integratori: [
      { nome: 'Creatina monoidrata', dose: '5g', quando: 'Post-allenamento con il shake' },
      { nome: 'Zinco + Magnesio (ZMA)', dose: 'Come da confezione', quando: 'Sera, 30 min prima di dormire' },
      { nome: 'Vitamina D3 + K2', dose: '2000 UI', quando: 'Con il pasto principale' },
      { nome: 'Omega 3 da alghe', dose: '2 capsule', quando: 'Con il pasto principale' },
      { nome: 'Pea protein / Hemp protein', dose: '30-35g', quando: 'Post-allenamento' },
    ],
  },

  C: {
    preAllenamento: {
      titolo: 'Pre-allenamento (60-90 min prima)',
      alimenti: [
        '🍝 80g pasta integrale + 200g legumi misti (ceci, lenticchie)',
        '🥗 Insalata con semi di canapa e semi di zucca (proteine)',
        '🍋 Succo di barbabietola (migliora resistenza muscolare)',
      ],
    },
    postAllenamento: {
      titolo: 'Post-allenamento (entro 30-60 min)',
      alimenti: [
        '🥛 Shake proteico vegetale con latte di soia (30g proteine)',
        '🍚 150g riso integrale + 150g seitan o tofu affumicato',
        '🥑 Mezzo avocado per grassi sani e recupero infiammazione',
      ],
    },
    integratori: [
      { nome: 'Creatina monoidrata', dose: '5g', quando: 'Post-allenamento con il shake' },
      { nome: 'BCAA o EAA', dose: '5-10g', quando: "Durante l'allenamento (gambe = sforzo maggiore)" },
      { nome: 'Beta-alanina', dose: '3.2g', quando: 'Pre-allenamento (può dare formicolio, normale)' },
      { nome: 'Vitamina D3 + K2', dose: '2000 UI', quando: 'Con il pasto principale' },
      { nome: 'Ferro + Vitamina C', dose: 'Come da confezione', quando: 'Lontano da caffè e tè' },
    ],
  },
}

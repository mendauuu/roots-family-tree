'use strict';
/* =========================================================
   Roots — the old handwritten family tree (Uzbek Cyrillic),
   transcribed to Latin. Merged once into the saved tree;
   run it again any time from ⋯ → "Merge old paper tree".

   n  name as read (keep "(?)" on uncertain readings)
   c  the original Cyrillic, where it was given
   x  ⊗ on the paper (probably died / no descendants — a note, not a fact)
   est  a rough birth year, only to place someone on the river
   k  children
   ========================================================= */

const PAPER_TREE = {
  id: 'paper-1',
  homeland: 'Uzbekistan',   // the paper is in Uzbek; set once if the tree has no homeland
  lookFor: {
    names: ['Toshqul', 'Тошқул'],
    note: 'Not found on the old paper tree. Possible matches to check: Toshbura (?) (Тошбура), son of Jo\'ra in the Qobil branch, or Toshbuva (?) (Тошбува), son of Do\'smamat.'
  },
  roots: [
    { n: 'Boyqushayboy', c: 'Бойқушайбой', est: 1650,
      note: 'Birth year unknown — about 1650 is only a guess to place the tree on the river (about nine generations before the early 1900s).',
      k: [
        { n: 'Jabbor', c: 'Жаббор',
          note: 'Read as one line: Boyqushayboy → Jabbor → Amir → Murod. If they were brothers instead, change the parents.',
          k: [
            { n: 'Amir', c: 'Амир', k: [
              { n: 'Murod', c: 'Мурод', note: 'Had 4 sons.', k: [

                /* 1 ─ Muhammadi */
                { n: 'Muhammadi', c: 'Мухаммади', k: [
                  { n: 'Boyitboy (?)', c: 'Бойитбой', k: [
                    { n: 'Qurdaboy (?)', k: [
                      { n: 'Eshmamat', c: 'Эшмамат', k: [
                        { n: 'Qulim (?)' }, { n: 'Amir' }, { n: "Qo'chim" }, { n: "Bo'ron" }, { n: 'Qudrat' }
                      ] },
                      { n: "Do'smamat", c: 'Дўсмамат', k: [
                        { n: 'Lapa (?)' }, { n: 'Ergash' },
                        { n: 'Toshbuva (?)', c: 'Тошбува?', note: 'Possible match for Toshqul (Тошқул) — to check.' }
                      ] },
                      { n: 'Qurbonqul', c: 'Қурбонқул', k: [
                        { n: 'Nurali' }, { n: 'Sherali' }, { n: 'Shermon' }, { n: 'Sherboy' }
                      ] }
                    ] }
                  ] },
                  { n: 'Qurbonboy', c: 'Қурбонбой', k: [
                    { n: 'Ahmad', c: 'Аҳмад', k: [{ n: 'Avazboy' }, { n: 'Xushmurod' }] },
                    { n: "Jo'ra", c: 'Жўра', k: [{ n: 'Xushboq (?)' }, { n: "G'ani (?)" }] },
                    { n: "To'ra" }
                  ] },
                  { n: 'Qobil', c: 'Қобил', k: [
                    { n: 'Toshmat devona (?)', c: 'Тошмат девона', k: [
                      { n: 'Aliboy', c: 'Алибой', k: [
                        { n: 'Xudoyberdi', c: 'Худойберди', k: [{ n: 'Norboy' }, { n: 'Asqar' }] },
                        { n: "Jo'ra", c: 'Жўра', k: [
                          { n: 'Toshbura (?)', c: 'Тошбура', note: 'Possible match for Toshqul (Тошқул) — to check.' }
                        ] }
                      ] }
                    ] },
                    { n: 'Hasan', x: true }
                  ] },
                  { n: 'Davur', c: 'Давур', k: [
                    { n: 'Aman (?)', k: [
                      { n: 'Rajab', x: true },
                      { n: 'Xonim (?)', g: 'o', note: 'Gender not marked — Xonim is often a woman\'s name.', k: [
                        { n: 'Quli (?)' }, { n: "To'la (?)" }
                      ] }
                    ] },
                    { n: 'Turmamat', c: 'Турмамат', k: [
                      { n: 'Qurbonali (?)', note: "The line on the paper could also come from To'ra." }
                    ] }
                  ] }
                ] },

                /* 2 ─ Mamatqul */
                { n: 'Mamatqul', c: 'Маматқул', k: [
                  { n: 'Normurod', x: true },
                  { n: 'Begmurod', c: 'Бегмурод', k: [
                    { n: 'Usmon', c: 'Усмон', k: [
                      { n: 'Xolboy', c: 'Холбой', k: [
                        { n: 'Sherbek', k: [{ n: 'Ermamat' }, { n: 'Boymamat' }, { n: 'Nurmamat' }, { n: 'Shaymamat' }] }
                      ] },
                      { n: 'Bolboy', c: 'Болбой', k: [{ n: 'Ummat', k: [{ n: 'Yoqub' }] }] },
                      { n: "Boyto'ra", c: 'Бойтўра', k: [{ n: 'Begbuta', x: true }] }
                    ] },
                    { n: "Jo'ra", k: [{ n: "Bo'ron", k: [{ n: 'Sherboy' }, { n: 'Nurboy' }] }] }
                  ] }
                ] },

                /* 3 ─ Xolmurod */
                { n: 'Xolmurod', c: 'Холмурод', k: [
                  { n: "Mullog'ulboyer (?)", k: [
                    { n: "Mullag'ulomdin (?)" },
                    { n: 'Yunusxalfa', c: 'Юнусхалфа', k: [
                      { n: 'Egamqul', note: 'The paper says "Sarbozorda" — this may mean he died as a soldier (not confirmed).' }
                    ] }
                  ] }
                ] },

                /* 4 ─ Japar */
                { n: 'Japar', c: 'Жапар', k: [
                  { n: 'Bobobek', x: true },
                  { n: "Bo'ri", c: 'Бўри', k: [
                    { n: 'Mamatqul', k: [
                      { n: 'Xushmurod', k: [{ n: 'Norbek' }, { n: 'Ochil' }, { n: 'Davur' }, { n: 'Hayitboy' }, { n: 'Soat' }] }
                    ] },
                    { n: 'Anda', c: 'Анда', k: [{ n: 'Alimurod' }] }
                  ] },
                  { n: 'Butunboy', c: 'Бутунбой', k: [{ n: 'Iroy (?)' }] },
                  { n: 'Hatam', c: 'Ҳатам', k: [{ n: 'Shodon (?)' }] }
                ] }
              ] }
            ] }
          ] }
      ] },

    /* Near the Xolmurod branch on the paper, parent unclear — left unattached */
    { n: 'Xudoyqul', c: 'Худойқул', est: 1775,
      note: 'Connected to the Xolmurod branch on the paper; exact parent unclear, so not attached yet.',
      k: [
        { n: "Ro'zi" },
        { n: "Ulug'", c: 'Улуғ', k: [{ n: 'Kunchor (?)' }, { n: 'Eliboy' }] }
      ] },
    { n: "O'rol", c: 'Ўрол', est: 1775,
      note: 'Written in the Xolmurod area of the paper; parent unclear, so not attached yet.' }
  ]
};

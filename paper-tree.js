'use strict';
/* =========================================================
   Roots — the old handwritten family tree (Uzbek Cyrillic),
   transcribed to Latin. Merged once into the saved tree;
   run it again any time from ⋯ → "Merge old paper tree".

   n  name as read (keep "(?)" on uncertain readings)
   c  the original Cyrillic, where it was given
   x  ⊗ on the paper (probably died / no descendants — a note, not a fact)
   est  a rough birth year, only to place someone on the river
   added  not on the paper — added by the family
   was  an earlier reading { n, c, note }: matched and updated in place
   k  children
   ========================================================= */

const PAPER_TREE = {
  id: 'paper-2',            // bump to merge changes again (paper-2: Toshbura → Toshqul + his line)
  homeland: 'Uzbekistan',   // the paper is in Uzbek; set once if the tree has no homeland
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
                        { n: 'Toshbuva (?)', c: 'Тошбува?', was: { note: 'Possible match for Toshqul (Тошқул) — to check.' } }
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
                          { n: 'Toshqul',
                            note: 'On the paper this name was read as Toshbura (?) (Тошбура); the family confirms he is Toshqul (Тошқул).',
                            was: { n: 'Toshbura (?)', c: 'Тошбура', note: 'Possible match for Toshqul (Тошқул) — to check.' },
                            k: [
                              { n: 'Saidrasul', added: true, k: [
                                { n: 'Baxtiyor', added: true },
                                { n: 'Ixtiyor', added: true },
                                { n: 'Ilxom', added: true, k: [{ n: 'Abdulatif', added: true }] }
                              ] },
                              { n: 'Abdurasul', added: true }
                            ] }
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

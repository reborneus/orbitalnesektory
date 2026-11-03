SÚBORY HRY (načítavajú sa v tomto poradí, pozri index.html)

  util.js     pomocné funkcie ($, V3, clamp, rng…)
  i18n.js     == 1. JAZYK – všetky texty SK/EN, funkcia t('kľúč')
  data.js     == 2. HERNÉ DÁTA – suroviny, zóny, sektory, ceny, vylepšenia, obtiažnosť  <- TU SA LADÍ BALANS
  items.js    == 11. PREDMETY – rarity, typy modulov, náhodné vlastnosti, padanie koristi
  state.js    == 3. STAV HRY – čo sa ukladá, ukladanie do prehliadača, prevod starších uložení
  scene.js    == 4. 3D SCÉNA – renderer, kamera, svetlá, materiály
  ship.js     == 5. LOĎ – 3D model "Klepeto", štít, laser, častice
  world.js    == 6. SEKTOR – zóny, asteroidy, stanica, brána, drony, korisť vo vesmíre
  control.js  == 7. OVLÁDANIE LODE – pohyb, ťažba, kolízie, radiácia, automatizácia
  input.js    == 8. VSTUP – dotyk/myš, minimapa, klávesnica, ovládač
  ui.js       == 9. ROZHRANIE – HUD, nápovedy, menu Stanica/Loď/Mapa/Brána, úvod
  gear.js     == 12. VÝBAVA – obrazovka inventára a predmetov
  main.js     == 10. HERNÁ SLUČKA – frame() každý snímok, start()

Všetky súbory zdieľajú jeden spoločný priestor premenných (bežné <script>, nie moduly),
takže hra funguje aj po otvorení index.html priamo zo stiahnutého priečinka.
Jednotky: vzdialenosti v metroch herného sveta, čas v sekundách.

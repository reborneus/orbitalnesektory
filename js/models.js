'use strict';
/* ==================== v0.40: VLASTNÉ 3D MODELY A PROSTREDIE ====================
   Tu sa dá vymeniť ktorýkoľvek model v hre za hotový 3D model (.glb) – bez zásahu do kódu.

   AKO PRIDAŤ MODEL:
   1. Súbor .glb nahraj do priečinka assets/models/ (napr. assets/models/bizon.glb).
   2. Nižšie do ASSETS.models pridaj riadok s kľúčom objektu, napr.:
        'ship.bizon': {file:'assets/models/bizon.glb'},
   3. Hotovo. Hra model sama zmenší/zväčší na veľkosť pôvodného modelu a vycentruje ho.
      Ak sa súbor nenačíta (chyba, zlá cesta), hra ticho použije pôvodný model.

   VOĽBY PRI MODELI (všetky nepovinné):
     rot:[x,y,z]   otočenie v stupňoch – loď musí nosom mieriť dopredu (+z); napr. rot:[0,180,0] ju otočí dozadu
     scale:1.2     doladenie veľkosti (1 = presne ako pôvodný model)
     size:12       pevná veľkosť najdlhšej strany v metroch hry (namiesto automatickej)
     pos:[x,y,z]   posun po prispôsobení
     glows:false   skryje aj pôvodné svetelné body (motory, svetlá) – keď ich má model vlastné

   KĽÚČE OBJEKTOV:
     ship.bizon  ship.sokol  ship.klepeto                    – lode hráča (klepeto = Pincer)
     pirate.swarm  pirate.fighter  pirate.corsair  pirate.frigate  pirate.dread  pirate.carrier
     pirate.turret  pirate.cmod                              – piráti, veža a modul pirátskej základne
     station                                                 – stanica (jadro a moduly ostanú)
     module.tower  module.towerGun                           – obranná veža: podstavec / otočné delo
     module.dock   module.sensor                             – dok dronov, senzorové pole
     drone  escort.gun  escort.mine                          – ťažobný dron, sprievodné lode
     npc.trader  npc.giver                                   – obchodník, zadávateľ misií
     gate                                                    – skoková brána

   PROSTREDIE (odrazy na kovoch):
     env: ''                     – vstavané vesmírne prostredie
     env: 'assets/env/nazov.hdr' – vlastná HDRI mapa (.hdr) alebo panoráma (.jpg / .png, pomer 2:1)
     envStrength: 1              – sila odrazov (0,5 = slabšie, 2 = silnejšie)

   Odporúčané: model do 2–5 MB, textúry 1024–2048 px, komprimované (gltf.report → Draco alebo Meshopt).
   Licencie: CC0 bez podmienok; CC-BY → doplň autora do príručky (wiki). */
const ASSETS={
  env:'',
  envStrength:1,
  models:{
     'ship.klepeto': {file:'assets/models/pincer_clean_50k.glb'},
     'ship.sokol': {file:'assets/models/falcon.glb'},
    // 'ship.bizon':   {file:'assets/models/bizon.glb'},
    // 'pirate.fighter':{file:'assets/models/pirat.glb', rot:[0,180,0]},
  }
};

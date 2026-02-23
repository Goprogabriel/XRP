# XRP Ledger Live Visualization

En real-time 3D-visualisering af XRP Ledger (XRPL) netværket bygget med Three.js. Se transaktioner live på globussen direkte fra kilden.

### [Se Live Demo Her!](https://goprogabriel.github.io/XRP/)

---

## Funktioner
- **Live 3D Globe**: Visualisering af transaktioner som lysende buer over hele verden.
- **Netværksstatistik**: Live TPS (Transactions Per Second) og Ledger Close Time (LCT).
- **Adresse Søgning**: Fremhæv transaktioner for specifikke XRP-adresser.
- **Whale Filter**: Mulighed for kun at se store bevægelser (>10.000 XRP).
- **Validator Netværk**: Se lokationer for de vigtigste XRP validator nodes.
- **Kontroller**: Auto-rotation, manuel zoom og nulstilling af fokus.

## Teknologier
- **Three.js**: 3D rendering.
- **WebSockets**: Live data-forbindelse til `xrplcluster.com`.
- **Vanilla CSS/JS**: Hurtig indlæsning uden frameworks.

## Setup & Hosting
Dette er en statisk applikation, der kører direkte i browseren.

1. **Lokalt**: Åbn `index.html` i en browser.
2. **Hosting**: Kan hostes direkte på GitHub Pages ved at vælge `main` branch under indstillinger.

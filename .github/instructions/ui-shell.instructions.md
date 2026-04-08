---
applyTo: "src/components/**/*.ts,src/components/**/*.tsx,src/app/globals.css"
---

# UI Shell Instructions

Toda alteração visual deve respeitar o design operacional do Command Center:

- dark/OLED
- accent cyan
- Inter
- Material Symbols
- superfícies escuras por camadas
- bordas finas e sutis
- contraste alto
- glow controlado
- animações discretas

Regras:

- preserve a estrutura de sidebar fixa + topbar fixa + conteúdo com offsets consistentes
- não quebrar altura útil das páginas
- revisar overflow e scroll
- /support é rota especial e não deve receber tratamento genérico de página comum
- preferir melhorar spacing, hierarquia e legibilidade em vez de adicionar componentes novos
- toda UI nova deve parecer parte do mesmo produto

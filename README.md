# AML/KYC Academy

Интерактивный учебный курс **AML/KYC Compliance + OSINT** — полностью в браузере, без установки.

**Сайт:** [https://ptrvalina.github.io/aml-kyc-academy/](https://ptrvalina.github.io/aml-kyc-academy/)

**Репозиторий:** [github.com/ptrvalina/aml-kyc-academy](https://github.com/ptrvalina/aml-kyc-academy)

## Что внутри

| Трек | Содержание |
|------|------------|
| **AML** | 14 модулей → тест (80%) → финальный экзамен (40 теория + 10 практика) |
| **OSINT** | 6 модулей → финальный экзамен + **50 практических кейсов** |
| **Практика** | 300+ кейсов, English-модуль, Crypto AML |
| **Карьера** | Тренажёр собеседования, поиск работы, CV & pitch |

Прогресс сохраняется в браузере (localStorage).

## Локальный запуск

```bash
git clone https://github.com/ptrvalina/aml-kyc-academy.git
cd aml-kyc-academy
npm install
npm run dev
```

Сборка для production:

```bash
npm run build
npm run preview
```

## Деплой (GitHub Pages)

После push в `main` GitHub Actions собирает приложение и кладёт результат в папку `docs/`.

**Settings → Pages:**
- **Source:** Deploy from a branch
- **Branch:** `main`
- **Folder:** `/docs`

Сайт: [https://ptrvalina.github.io/aml-kyc-academy/](https://ptrvalina.github.io/aml-kyc-academy/)

> Не используй `/ (root)` — там лежат исходники для разработки, не собранный сайт.

```
src/
  App.tsx          # основное приложение курса
  lib/ui.tsx       # UI-компоненты
  lib/dag-layout.ts
index.html
vite.config.ts
```

## Лицензия

MIT

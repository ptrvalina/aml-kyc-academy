# AML/KYC Academy

Интерактивный учебный курс **AML/KYC Compliance + OSINT** для подготовки к роли Financial Crime Analyst.

**Публичная страница:** после публикации на GitHub Pages —  
`https://<ваш-username>.github.io/aml-kyc-academy/`

## Что внутри

| Трек | Содержание |
|------|------------|
| **AML** | 14 модулей → тест после каждого (80%) → финальный экзамен (40 теория + 10 практика) |
| **OSINT** | 6 модулей → тест → финальный экзамен + **50 практических кейсов** |
| **Практика** | 300+ кейсов в Case Manager, English-модуль, Crypto AML |
| **Карьера** | Тренажёр собеседования, поиск работы, CV & pitch |

## Как открыть (Cursor)

Курс — это **Cursor Canvas** (`.canvas.tsx`). Полная интерактивность — только в [Cursor](https://cursor.com).

1. Склонируй репозиторий:
   ```bash
   git clone https://github.com/<username>/aml-kyc-academy.git
   ```
2. Открой папку в Cursor.
3. Скопируй canvas в workspace Cursor:
   ```
   .cursor/projects/<your-workspace>/canvases/aml-kyc-training.canvas.tsx
   ```
   Или положи файл из `canvas/aml-kyc-training.canvas.tsx` в `canvases/` своего проекта.
4. Открой файл `aml-kyc-training.canvas.tsx` — canvas откроется рядом с чатом.

## GitHub Pages (публичная ссылка)

1. Создай репозиторий на GitHub: **aml-kyc-academy** (Public).
2. Запушь этот проект:
   ```bash
   cd aml-kyc-academy
   git remote add origin https://github.com/<username>/aml-kyc-academy.git
   git branch -M main
   git push -u origin main
   ```
3. **Settings → Pages → Build from branch:** `main`, folder **`/docs`**.
4. Через 1–2 минуты сайт будет доступен по адресу:
   ```
   https://<username>.github.io/aml-kyc-academy/
   ```

## Структура репозитория

```
aml-kyc-academy/
├── README.md
├── docs/
│   └── index.html          # лендинг для GitHub Pages
└── canvas/
    └── aml-kyc-training.canvas.tsx   # исходник курса
```

## Лицензия

MIT — свободное использование с указанием авторства.

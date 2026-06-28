# AML/KYC Academy

Интерактивный учебный курс **AML/KYC Compliance + OSINT** для подготовки к роли Financial Crime Analyst.

**Репозиторий:** [github.com/ptrvalina/aml-kyc-academy](https://github.com/ptrvalina/aml-kyc-academy)

**Публичная страница (GitHub Pages):**  
[https://ptrvalina.github.io/aml-kyc-academy/](https://ptrvalina.github.io/aml-kyc-academy/)

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
   git clone https://github.com/ptrvalina/aml-kyc-academy.git
   ```
2. Открой папку в Cursor.
3. Скопируй canvas в workspace:
   ```
   .cursor/projects/<your-workspace>/canvases/aml-kyc-training.canvas.tsx
   ```
   Файл лежит в репозитории: `canvas/aml-kyc-training.canvas.tsx`
4. Открой `aml-kyc-training.canvas.tsx` — курс запустится рядом с чатом.

## GitHub Pages

Если Pages ещё не включён:

1. **Settings → Pages → Build from branch:** `main`, folder **`/docs`**
2. Сайт: [https://ptrvalina.github.io/aml-kyc-academy/](https://ptrvalina.github.io/aml-kyc-academy/)

## Структура

```
aml-kyc-academy/
├── README.md
├── docs/index.html              # лендинг (GitHub Pages)
└── canvas/aml-kyc-training.canvas.tsx
```

## Лицензия

MIT

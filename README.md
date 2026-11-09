# Devosoft lead survey

React + TypeScript + Vite asosida tayyorlangan, UZ / EN / RU tillaridagi lead so'rovnomasi.

## Lokal ishga tushirish

```bash
npm ci
npm run dev
```

## GitHub orqali build olish

Loyihani GitHub repository'ga `main` yoki `master` branch orqali yuklang. Har bir push va pull request'da GitHub Actions testlarni ishga tushirib, production build qiladi.

Build tugagach, repository ichidagi **Actions** bo'limidan muvaffaqiyatli workflow'ni oching va `devosoft-survey-dist` artifact'ini yuklab oling. Arxiv ichidagi fayllar serverga yuklashga tayyor.

## `devosoft-landing.devosoft.uz` serveriga joylash

1. Domen/subdomen hostingda yaratilgan va uning document root papkasi mavjud bo'lsin.
2. `devosoft-survey-dist` arxivini oching.
3. Arxiv ichidagi barcha fayl va papkalarni, jumladan `.htaccess` faylini, subdomenning document root papkasiga yuklang. `dist` papkasini o'zini emas, ichidagi tarkibni yuklang.
4. Saytni `https://devosoft-landing.devosoft.uz` orqali ochib tekshiring.

`public/.htaccess` build vaqtida `dist/.htaccess` sifatida ko'chadi. Apache hostingda SPA yo'nalishlari ushbu fayl orqali `index.html` ga yo'naltiriladi. Nginx ishlatilsa, server konfiguratsiyasiga `try_files $uri $uri/ /index.html;` qoidasini qo'shing.

## Lead API / CRM sozlamasi

Leadlarni CRM'ga yuborish uchun build qilishdan oldin `VITE_LEAD_API_URL` ni CRM API'ning haqiqiy HTTPS manziliga sozlang:

```env
VITE_LEAD_API_URL=https://your-api-domain.example/api/leads
```

Lokal build uchun `.env.production.local` faylidan foydalanish mumkin. Bu fayl `.gitignore` orqali GitHub'ga kiritilmaydi. GitHub Actions build'ida endpoint ishlatish uchun repository'ning **Settings → Secrets and variables → Actions → Variables** bo'limida `VITE_LEAD_API_URL` nomli variable yarating. Workflow variable'ni build vaqtida avtomatik ishlatadi.

Hozircha CRM API manzili sozlanmagan. Manzil sozlanmasa, forma yuborilganda foydalanuvchiga xato ko'rsatiladi; lead muvaffaqiyatli yuborilgandek noto'g'ri holat chiqmaydi. API key kabi maxfiy qiymatlarni `VITE_` variable ichiga yozmang: bu qiymat brauzer kodida ko'rinadi. CRM maxfiy ma'lumotlari faqat backend'da saqlanishi kerak.

## Buyruqlar

```bash
npm run test
npm run build
npm run lint
```

So'rovnoma jarayoni `sessionStorage` da saqlanadi. `1–5` xodimli kompaniyalar shaxsiy ma'lumot so'ralishidan oldin maxsus yakuniy ekranga o'tadi. Frontend honeypot himoyasidan foydalanadi; rate limiting backend API'da bo'lishi kerak.

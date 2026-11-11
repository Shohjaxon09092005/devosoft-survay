import { expect, test } from '@playwright/test'

test('survey page renders the first question', async ({ page }) => {
  await page.goto('/survey?lang=uz')
  await expect(page.getByText('Biznesingiz qaysi yo\'nalishda?')).toBeVisible()
})

test('choice questions advance on selection without letter prefixes or a continue button', async ({ page }) => {
  await page.goto('/survey?lang=uz')
  await page.getByPlaceholder('Masalan: Chakana savdo').fill('Chakana savdo')
  await page.getByRole('button', { name: 'Davom etish' }).click()

  await page.getByRole('button', { name: '6–10' }).click()
  await expect(page.getByText('Biznesingiz qanchalik tizimlashtirilgan?')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Davom etish' })).toHaveCount(0)

  await page.getByRole('button', { name: "Hech qanday tizim yo'q (Excel yoki qo'lda)" }).click()
  await expect(page.getByText('Hozirda sizdagi eng katta muammo qaysi?')).toBeVisible()
  await expect(page.getByPlaceholder('Yozing')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Davom etish' })).toBeVisible()
})

test('returning home after submission restarts the survey', async ({ page }) => {
  await page.route('/api/lead', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, leadId: 12345 }),
    })
  })

  await page.goto('/survey?lang=uz')
  await page.getByPlaceholder('Masalan: Chakana savdo').fill('Chakana savdo')
  await page.getByRole('button', { name: 'Davom etish' }).click()
  await page.getByRole('button', { name: '6–10' }).click()
  await page.getByRole('button', { name: 'Qisman avtomatlashtirilgan' }).click()
  await page.getByPlaceholder('Yozing').fill('Ombor nazorati')
  await page.getByRole('button', { name: 'Davom etish' }).click()
  await page.getByRole('button', { name: 'Shu oy' }).click()
  await page.getByPlaceholder('Yozing').fill('Ali Valiyev')
  await page.getByRole('button', { name: 'Davom etish' }).click()
  await page.getByPlaceholder('+998 (XX) XXX-XX-XX').fill('901234567')
  await page.getByRole('button', { name: 'Davom etish' }).click()
  await page.getByRole('button', { name: 'Toshkent shahri' }).click()
  await page.getByRole('button', { name: 'Yuborish' }).click()

  await expect(page.getByRole('heading', { name: 'Rahmat, Ali Valiyev!' })).toBeVisible()
  await page.getByRole('link', { name: 'Bosh sahifaga' }).click()

  await expect(page).toHaveURL(/\/survey\?lang=uz$/)
  await expect(page.getByText("Biznesingiz qaysi yo'nalishda?")).toBeVisible()
  await expect(page.getByPlaceholder('Masalan: Chakana savdo')).toHaveValue('')

  await page.reload()
  await expect(page.getByText("Biznesingiz qaysi yo'nalishda?")).toBeVisible()
  await expect(page.getByPlaceholder('Masalan: Chakana savdo')).toHaveValue('')
})

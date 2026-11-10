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

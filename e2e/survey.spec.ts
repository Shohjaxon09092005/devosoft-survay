import { expect, test } from '@playwright/test'

test('survey page renders the first question', async ({ page }) => {
  await page.goto('/survey?lang=uz')
  await expect(page.getByText('Biznesingiz qaysi yo\'nalishda?')).toBeVisible()
})

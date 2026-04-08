import { test, expect } from '@playwright/test';
import { prisma } from '../../src/lib/prisma';

test.describe('Payment Failures & Inventory Integrity', () => {

  test('Test Case 1 & 2: Declined Card Rejection & Inventory Rollback', async ({ page }) => {
    
    // Target an explicitly known product
    const targetProduct = await prisma.product.findFirst({
        where: { name: 'Intel Core i9-14900K', isActive: true }
    });

    if (!targetProduct) throw new Error('No test product found');

    const initialStock = targetProduct.stock;
    
    // Simulate navigation and cart loading
    await page.goto(`/catalog/CPU?builder=false`);
    await page.waitForLoadState('networkidle');

    // Add item to loose cart
    const productCard = page.locator('.group').filter({ hasText: 'Intel Core i9-14900K' });
    const addToCartBtn = productCard.getByRole('button', { name: 'Add to Cart' });
    await addToCartBtn.click();

    // Navigate strictly to checkout using soft router
    await page.getByRole('link', { name: /Checkout Securely/i }).click();

    // Fill contact details
    await page.getByLabel(/First Name/i).fill('Test Payment');
    await page.getByLabel(/Last Name/i).fill('Failure');
    await page.getByLabel('Email Address', { exact: true }).fill('declined@test.com');
    await page.getByLabel(/Phone Number/i).fill('12345678');
    
    // Fill Shipping (Ensuring { exact: true } to prevent strict mode violation on Address vs Email Address)
    await page.getByLabel(/^Address$/i, { exact: true }).fill('123 Reject Lane');
    await page.getByLabel(/Postal Code/i).fill('9999');
    await page.getByLabel(/City/i).fill('Test City');

    // Select Credit Card
    await page.getByText('Credit Card', { exact: true }).click();
    
    // Mock the card details
    await page.getByLabel(/Card Number/i).fill('4000 0000 0000 0028');
    await page.getByPlaceholder('MM/YY').fill('12/30');
    await page.getByPlaceholder('123').fill('123');

    // Accept legal terms
    await page.locator('input[type="checkbox"]').check();

    // Confirm that place order does NOT redirect, but shows an error inline.
    await page.getByRole('button', { name: /Place Order/i }).click();

    // Test Case 1 Assertion: UI Error rendering
    const errorBanner = page.locator('text="Your card was declined."');
    await expect(errorBanner).toBeVisible({ timeout: 5000 });
    
    // Ensure URL has NOT changed (They didn't reach success page)
    expect(page.url()).toContain('/checkout');

    // Test Case 2 Assertion: DB verification proving transaction rollback
    const rehydratedProduct = await prisma.product.findUnique({
        where: { id: targetProduct.id }
    });

    // Despite place order being clicked (which ran the internal decrement sequence),
    // because the mocked payment failed, Prisma aborted the decrement block.
    // Making it completely immutable!
    expect(rehydratedProduct?.stock).toBe(initialStock);

  });
});

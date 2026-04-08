import { test, expect } from '@playwright/test';
import { prisma } from '../../src/lib/prisma';


test.describe('Database Concurrency & Transaction Locks', () => {

  // We explicitly skip the default `page` fixture so we can manually drive two raw distinct contexts
  test('Prevents race conditions when two users fight for the last item', async ({ browser }) => {
    
    // ----------------------------------------------------
    // Context Setup
    // ----------------------------------------------------
    const targetProduct = "AMD Ryzen 7 7800X3D";
    
    // Wait for the DB to stabilize, then ruthlessly hardcode stock to EXACTLY 1.
    const product = await prisma.product.findFirst({ where: { name: targetProduct }});
    if (!product) throw new Error("Target product missing from DB seed.");

    await prisma.product.update({
      where: { id: product.id },
      data: { stock: 1 }
    });

    // Spin up two completely mathematically isolated contexts that share NO data 
    // They appear to the server as two wildly different IPs/Clients
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // ----------------------------------------------------
    // User A & B Traversal Iteration
    // ----------------------------------------------------
    // Have them both navigate to the motherboard catalog specifically for the Ryzen
    await pageA.goto('/catalog/CPU?builder=false');
    await pageB.goto('/catalog/CPU?builder=false');

    // Add to cart
    await pageA.locator('.group').filter({ hasText: targetProduct }).getByRole('button', { name: 'Add to Cart' }).click();
    await pageB.locator('.group').filter({ hasText: targetProduct }).getByRole('button', { name: 'Add to Cart' }).click();

    // Fast-Forward to checkout logic 
    await pageA.getByRole('link', { name: /Checkout Securely/i }).click();
    await pageB.getByRole('link', { name: /Checkout Securely/i }).click();

    // Helper to rapidly fill mock shipping to get to the "Place Order" button
    const fillCheckout = async (p: any, prefix: string) => {
        await p.getByLabel('First Name').fill(prefix);
        await p.getByLabel('Last Name').fill('Tester');
        await p.getByLabel('Email Address').fill(`${prefix}@test.com`);
        await p.getByLabel('Phone Number').fill('98765432');
        await p.getByLabel('Address', { exact: true }).fill('123 Street');
        await p.getByLabel('Postal Code').fill('0000');
        await p.getByLabel('City').fill('Test City');
        await p.getByRole('checkbox').check();
    };

    await fillCheckout(pageA, 'UserA');
    await fillCheckout(pageB, 'UserB');

    // ----------------------------------------------------
    // The Collision execution
    // ----------------------------------------------------
    // Instead of sequentially clicking, we fire the precise millisecond overlapping Promises!
    // This perfectly emulates the simultaneous REST requests.
    const submitBtnA = pageA.getByRole('button', { name: 'Place Order' });
    const submitBtnB = pageB.getByRole('button', { name: 'Place Order' });

    // Sync them exactly!
    await Promise.all([
      submitBtnA.click(),
      submitBtnB.click()
    ]);

    // ----------------------------------------------------
    // Resolution Assertions
    // ----------------------------------------------------
    // Wait for the UI processing loop to mathematically settle
    await pageA.waitForLoadState('networkidle');
    await pageB.waitForLoadState('networkidle');

    // Determine mathematically who WON the lock and who LOST the lock via current URL
    const urlA = pageA.url();
    const urlB = pageB.url();

    const AWon = urlA.includes('/checkout/success/');
    const BWon = urlB.includes('/checkout/success/');

    // PROOF 1: We must have precisely ONE absolute winner and ONE absolute loser.
    // If BOTH won, the stock went negative. If NEITHER won, the lock is completely deadlocked.
    expect(AWon !== BWon).toBeTruthy(); // Mutually Exclusive Winner constraint!

    if (AWon) {
       // A survived, B must show the error
       await expect(pageB.getByText('went out of stock')).toBeVisible();
    } else {
       // B survived, A must show the error
       await expect(pageA.getByText('went out of stock')).toBeVisible();
    }

    // PROOF 2: The Final Database Authority
    // We fetch the Prisma stock and assert it is precisely 0.
    const finalProductState = await prisma.product.findUnique({ where: { id: product.id } });
    
    // If it equals -1, the atomic boundary was shattered.
    // If it equals 0, the interactive transaction securely held the mathematical lock!
    expect(finalProductState?.stock).toEqual(0);
  });

});

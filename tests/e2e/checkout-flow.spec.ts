import { test, expect } from '@playwright/test';

test.describe('Hardware Store E2E Critical Path', () => {

  test('Test Case 1: Cart Persistence & Operations', async ({ page }) => {
    // Navigate to CPU catalog in loose cart mode
    await page.goto('/catalog/CPU?builder=false');

    // Add Intel Core i9-14900K to cart using robust semantic locators
    const productCard = page.locator('.group').filter({ hasText: 'Intel Core i9-14900K' });
    const addToCartBtn = productCard.getByRole('button', { name: 'Add to Cart' });
    await addToCartBtn.click();


    // Assert cart indicator increments to 1
    // The mobile/desktop structure uses a View Cart drawer toggle
    const cartToggle = page.getByRole('button', { name: /View Cart/i });
    await expect(cartToggle).toContainText('1');

    // Navigate to homepage, then to checkout
    await page.goto('/');
    
    // There is no /cart page, the checkout page loads the cart items via global Zustand store
    await page.goto('/checkout');
    await expect(page.getByText('Intel Core i9-14900K')).toBeVisible();
  });

  test('Test Case 2: Promotion Logic', async ({ page }) => {
    // Pre-seed the cart with an item so checkout isn't empty
    await page.goto('/catalog/CPU?builder=false');
    const productCard = page.locator('.group').filter({ hasText: 'Intel Core i9-14900K' });
    await productCard.getByRole('button', { name: 'Add to Cart' }).click();

    // Navigate to the checkout (cart)
    await page.goto('/checkout');

    // Since the promo code input is required by specifications
    const promoInput = page.getByPlaceholder('Enter discount code');
    const applyBtn = page.getByRole('button', { name: 'Apply' });

    // Attempt to apply invalid code
    await promoInput.fill('FAKECODE99');
    await applyBtn.click();
    await expect(page.getByText('Invalid discount code')).toBeVisible();

    // Extract subtotal string before applying valid code
    // Assuming structure based on OrderSummary: <span>Subtotal</span> <span>XXX Kr</span>
    const subtotalText = await page.locator('span', { hasText: 'Subtotal' }).locator('~ span').innerText();
    const rawSubtotalStr = subtotalText.replace(/[^\d]/g, '');
    const subtotalInt = parseInt(rawSubtotalStr, 10);

    // Apply valid code
    await promoInput.fill('WINTER26');
    await applyBtn.click();

    // Assert successful application
    await expect(page.getByText('Discount applied!')).toBeVisible();

    // Extract newly calculated total
    const totalText = await page.locator('span', { hasText: 'Total' }).locator('~ span').innerText();
    const rawTotalStr = totalText.replace(/[^\d]/g, '');
    const totalInt = parseInt(rawTotalStr, 10);

    // Assert mathematical correctness (discount operates on subtotal)
    const expectedDiscounted = Math.floor(subtotalInt * 0.85); // 15% discount
    // We expect the total to equal the discounted subtotal + shipping (default standard = 99kr) 
    expect(totalInt).toEqual(expectedDiscounted + 99);
  });

  test('Test Case 3: Checkout to Admin Synchronization', async ({ page, context }) => {
    // Prep cart
    await page.goto('/catalog/CPU?builder=false');
    await page.locator('.group').filter({ hasText: 'Intel Core i9-14900K' }).getByRole('button', { name: 'Add to Cart' }).click();

    // Navigate to checkout
    await page.goto('/checkout');

    // Fill contact details
    await page.getByLabel('First Name').fill('Playwright');
    await page.getByLabel('Last Name').fill('Tester');
    await page.getByLabel('Email Address').fill('test@playwright.com');
    await page.getByLabel('Phone Number').fill('12345678');
    
    // Fill shipping details
    await page.getByLabel('Address', { exact: true }).fill('123 Test Street');
    await page.getByLabel('Postal Code').fill('0000');
    await page.getByLabel('City').fill('Testville');

    // Agree to terms
    await page.getByRole('checkbox').check();

    // Submit via explicit test-id or semantic role
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Wait for redirection to Success Page
    await page.waitForURL(/\/checkout\/success\/(.+)/);

    // Extract the orderId from the URL
    const urlMatches = page.url().match(/\/checkout\/success\/(.+)$/);
    expect(urlMatches).not.toBeNull();
    const orderId = urlMatches![1];

    // ----- [ CRITICAL AUTHENTICATION MOCKING ] ----- 
    // Inject mock session cookie to bypass Next.js middleware protection
    await context.addCookies([
      {
        name: 'admin-session',
        value: 'mock-auth-token-123',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false, // Since this is localhost testing
        sameSite: 'Lax',
      }
    ]);

    // Navigate backward (directly to Admin)
    await page.goto('/admin/orders');

    // Search the orders table to verify synchronization
    // The table rows represent orders. We look for the cell containing the specific orderId.
    const orderRow = page.locator('tr').filter({ hasText: orderId.split('-')[0].toUpperCase() }).first();
    
    // Verify it exists AND has 'Pending' status
    await expect(orderRow).toBeVisible();
    await expect(orderRow).toContainText('Pending');
  });

});

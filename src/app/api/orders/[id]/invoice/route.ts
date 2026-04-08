import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const customerSession = cookieStore.get('customer-session');
  
  if (!customerSession || !customerSession.value) {
    return new NextResponse('Unauthorized access to order data', { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { 
      id,
      customerId: customerSession.value
    },
    include: {
      customer: true,
      items: {
        include: { product: true }
      }
    }
  });

  if (!order) {
    return new NextResponse('Order not found', { status: 404 });
  }

  const isLocal = process.env.NODE_ENV === 'development';
  let browser;

  try {
    const executablePath = isLocal 
      ? process.env.LOCAL_CHROMIUM_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' // Local OS-agnostic fallback
      : await chromium.executablePath();

    browser = await puppeteerCore.launch({
      args: isLocal ? [] : chromium.args,
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    const htmlContent = `
      <html>
        <head>
          <style>
             body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #111; line-height: 1.5; }
             h1 { border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 30px; color: #0a0a0a; font-size: 32px; font-weight: 800; tracking-tight: -0.025em; }
             .summary { margin-bottom: 40px; display: flex; justify-content: space-between; }
             .summary > div { width: 48%; }
             p { margin: 4px 0; font-size: 14px; }
             table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
             th, td { border-bottom: 1px solid #e5e7eb; padding: 16px 12px; text-align: left; }
             th { background-color: #fafafa; font-weight: 600; color: #4b5563; font-size: 12px; letter-spacing: 0.05em; }
             td.money { text-align: right; }
             th.money { text-align: right; }
             .total-row { border-top: 2px solid #e5e7eb; }
             .total-row td { font-weight: 700; font-size: 18px; padding-top: 24px; }
             .footer { margin-top: 60px; font-size: 12px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <h1>TAX INVOICE</h1>
          
          <div class="summary">
            <div>
              <p style="color: #6b7280; font-size: 11px; font-weight: bold; letter-spacing: 0.05em;">Billed To</p>
              <p style="font-weight: bold; font-size: 16px; margin-top: 4px;">${order.customer?.name || 'Guest'}</p>
              <p>${order.customer?.email || 'N/A'}</p>
              <p style="white-space: pre-line; margin-top: 8px; color: #4b5563;">${order.shippingAddress || 'No shipping address provided'}</p>
            </div>
            <div style="text-align: right;">
              <p><span style="color: #6b7280; font-weight: 600;">Order ID:</span> <span style="font-family: monospace; font-size: 15px;">${order.id.split('-')[0].toUpperCase()}</span></p>
              <p><span style="color: #6b7280; font-weight: 600;">Date:</span> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><span style="color: #6b7280; font-weight: 600;">Payment Status:</span> <span style="text-transform: capitalize;">${order.status}</span></p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="width: 100px;">Quantity</th>
                <th class="money" style="width: 120px;">Unit Price</th>
                <th class="money" style="width: 120px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>
                    <div style="font-weight: 600; color: #111;">${item.product.name}</div>
                    <div style="color: #6b7280; font-size: 12px; margin-top: 2px;">${item.product.brand}</div>
                  </td>
                  <td>${item.quantity}</td>
                  <td class="money">Kr ${item.priceAtTime.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td class="money">Kr ${(item.quantity * item.priceAtTime).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                 <td colspan="3" class="money" style="border: none;">Grand Total (NOK)</td>
                 <td class="money" style="border: none; color: #0a0a0a;">Kr ${order.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
             This is a computer-generated document. No signature is required.<br/>
             Hardware Store E-Commerce System
          </div>
        </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ 
      format: 'A4', 
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm' }
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.id.split('-')[0].toUpperCase()}.pdf"`,
      },
    });

  } catch (error) {
    if (browser) await browser.close();
    console.error('PDF Generation Error:', error);
    return new NextResponse('Internal Server Error while generating PDF', { status: 500 });
  }
}

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Mock Order Received:", data);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate a random mock order number
    const orderNumber = `NOK-${Math.floor(Math.random() * 90000) + 10000}`;

    return NextResponse.json({ success: true, orderNumber });
  } catch (error) {
    console.error("Error processing order:", error);
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
  }
}

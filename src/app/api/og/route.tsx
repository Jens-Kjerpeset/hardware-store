import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Provide default fallback values if query params are missing
    const title = searchParams.get('title') || 'Hardware Store Builder';
    const hasCategory = searchParams.get('category');
    const cpu = searchParams.get('cpu');
    const gpu = searchParams.get('gpu');
    const price = searchParams.get('price');

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to bottom, #0f0f0f, #1f1614)',
            color: 'white',
            fontFamily: 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            padding: '40px',
            position: 'relative',
          }}
        >
          {/* Subtle grid background pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.05,
              backgroundImage: 'linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              border: '2px solid rgba(249, 115, 22, 0.4)',
              borderRadius: '24px',
              padding: '60px',
              backgroundColor: 'rgba(0,0,0,0.4)',
              boxShadow: '0 20px 40px rgba(249,115,22,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <svg 
                viewBox="0 0 24 24" 
                width="64" 
                height="64" 
                stroke="#f97316" 
                strokeWidth="2" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                <rect x="9" y="9" width="6" height="6"></rect>
                <line x1="9" y1="1" x2="9" y2="4"></line>
                <line x1="15" y1="1" x2="15" y2="4"></line>
                <line x1="9" y1="20" x2="9" y2="23"></line>
                <line x1="15" y1="20" x2="15" y2="23"></line>
                <line x1="20" y1="9" x2="23" y2="9"></line>
                <line x1="20" y1="14" x2="23" y2="14"></line>
                <line x1="1" y1="9" x2="4" y2="9"></line>
                <line x1="1" y1="14" x2="4" y2="14"></line>
              </svg>
              <h2 style={{ fontSize: '72px', fontWeight: 'bold', margin: '0', letterSpacing: '-0.02em' }}>
                Hardware Store
              </h2>
            </div>

            <h1
              style={{
                fontSize: title.length > 30 ? '48px' : '64px',
                fontWeight: 900,
                color: '#f97316',
                textAlign: 'center',
                marginBottom: '40px',
                lineHeight: 1.1,
              }}
            >
              {title}
            </h1>

            {!hasCategory && cpu && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', marginBottom: '30px', fontSize: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#a1a1aa' }}>CPU:</span>
                  <span style={{ fontWeight: '600' }}>{cpu}</span>
                </div>
                {gpu && (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <span style={{ color: '#a1a1aa' }}>GPU:</span>
                     <span style={{ fontWeight: '600' }}>{gpu}</span>
                   </div>
                )}
              </div>
            )}

            {price && (
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  background: '#f97316',
                  color: 'white',
                  padding: '10px 30px',
                  borderRadius: '99px',
                  fontSize: '36px',
                  fontWeight: 'bold',
                }}
              >
                {price} Kr
              </div>
            )}
            
            {hasCategory && !price && (
               <div style={{ display: 'flex', fontSize: '36px', color: '#a1a1aa', marginTop: '20px' }}>
                 Explore all products in {title.toLowerCase()}
               </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response('Failed to generate image', { status: 500 });
  }
}

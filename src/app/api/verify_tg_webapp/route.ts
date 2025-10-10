const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
export async function POST(request: Request) {
  const { rawInitData } = await request.json();

  const backendResponse = await fetch(`${BACKEND_URL}/webapp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawInitData }),
  });

  const cookieHeader = backendResponse.headers.get('set-cookie');

  const body = await backendResponse.json();
  
  return new Response(JSON.stringify(body), {
    status: backendResponse.status,
    headers: {
       'Content-Type': 'application/json',
      ...(cookieHeader ? { 'Set-Cookie': cookieHeader } : {}),
    }
  });
}
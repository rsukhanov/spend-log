const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

export async function POST(request: Request) {
  const { preferred_currency } = await request.json();
  const cookie = request.headers.get("cookie");

  const res = await fetch(`${BACKEND_URL}/expenses/${preferred_currency}`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json', 
      'Cookie': cookie ?? '' 
    },
  });
  
  const body = await res.json();
  
  return new Response(JSON.stringify(body), {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
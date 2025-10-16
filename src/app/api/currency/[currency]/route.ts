const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

export async function PATCH(request: Request, {params}: {params:  Promise<{ currency: string }>}) {
  const { currency } = await params;
  const cookie = request.headers.get("cookie");

  const res = await fetch(`${BACKEND_URL}/user/currency/${currency}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json', 
      'Cookie': cookie ?? ''
    },
  })
  const body = await res.json();
  
  return new Response(JSON.stringify(body), {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
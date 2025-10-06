const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

export async function POST(request: Request) {
  const {userId, preferred_currency} = await request.json();
  const res = await fetch(`${BACKEND_URL}/expenses/${userId}/${preferred_currency}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  return res;
}
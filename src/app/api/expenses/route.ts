const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

export async function GET(request: Request) {
  const userId = request.headers.get('userId');
  const res = await fetch(`${BACKEND_URL}/expenses/${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return res;
}
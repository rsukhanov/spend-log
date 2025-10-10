const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

export async function PATCH(request: Request) {
  const { currency } = await request.json();
  const cookie = request.headers.get("cookie");

  const res = await fetch(`${BACKEND_URL}/user/currency/${currency}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json', 
      'Cookie': cookie ?? ''
    },
  })
  return res;
}
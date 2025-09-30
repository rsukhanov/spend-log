export async function PATCH(request: Request) {
  const { userId, currency } = await request.json();

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/currency/${userId}/${currency}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  })
  return res;
}
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

export async function PATCH(request: Request) {
  const {id, merchant, sub_category} = await request.json();
  const res = await fetch(`${BACKEND_URL}/expenses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ merchant, sub_category })
  });
  return res;
}
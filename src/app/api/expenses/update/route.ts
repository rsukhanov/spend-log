const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

export async function PATCH(request: Request) {
  const {id, merchant, sub_category} = await request.json();
  const cookie = request.headers.get("cookie");
  const res = await fetch(`${BACKEND_URL}/expenses/${id}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json', 
      'Cookie': cookie ?? ''
    },
    body: JSON.stringify({ merchant, sub_category }),
  });
  return res;
}
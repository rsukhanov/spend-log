const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

export async function DELETE(
  request: Request, 
  { params }: { params: { id: string } }) 
{
  const { id } = await params;
  const cookie = request.headers.get("cookie");

  const res = await fetch(`${BACKEND_URL}/expenses/${id}`, {
    method: 'DELETE',
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
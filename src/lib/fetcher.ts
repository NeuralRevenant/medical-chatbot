export async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    console.error(data.error || "API error");
  }
  return res.json();
}

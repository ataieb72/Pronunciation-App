export async function assessPronunciation(
  attemptId: number,
  referenceText: string,
  language: string
): Promise<any> {
  const res = await fetch('/api/assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attemptId, referenceText, language }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Assess failed: ${res.status} - ${msg}`);
  }

  return res.json();
}

export function getTtsUrl(text: string, lang: string, rate: number): string {
  const params = new URLSearchParams({
    text,
    lang,
    rate: rate.toString(),
  });
  return `/api/tts?${params.toString()}`;
}

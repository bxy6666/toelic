export function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function readJson(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

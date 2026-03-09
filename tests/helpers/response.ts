export async function readJson<T>(response: Response) {
  return (await response.json()) as T;
}

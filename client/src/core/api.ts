export async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { message?: string }).message ?? `Request failed: ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  const body = await res.json()
  return (body as { data: T }).data
}

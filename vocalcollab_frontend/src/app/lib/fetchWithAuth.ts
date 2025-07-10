export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
  const accessToken = localStorage.getItem('access_token')
  const refreshToken = localStorage.getItem('refresh_token')

  // 如果是 FormData，不手动设置 Content-Type，浏览器会自动添加正确的 boundary
  const isFormData = init.body instanceof FormData

  const headers: HeadersInit = {
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),  // 只对非 FormData 设置
    ...(init.headers || {}),
  }

  const response = await fetch(input, {
    ...init,
    headers,
  })

  if (response.status === 401 && refreshToken) {
    const refreshRes = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (refreshRes.ok) {
      const data = await refreshRes.json()
      localStorage.setItem('access_token', data.access)

      const retryHeaders: HeadersInit = {
        ...(init.headers || {}),
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        Authorization: `Bearer ${data.access}`,
      }

      return fetch(input, {
        ...init,
        headers: retryHeaders,
      })
    } else {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }

  return response
}

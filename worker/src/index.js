// Worker stateless: scambia authorization code / refresh token con Google,
// tenendo il client_secret al sicuro lato server. Nessun database, nessuno
// stato persistito — ogni richiesta è indipendente.

const GOOGLE_CLIENT_ID = '218821816699-othhqj9dngod4imr2qkiichno2jfn1v1.apps.googleusercontent.com'
const ALLOWED_ORIGIN = 'https://inedia.github.io'

function cors(resp) {
  resp.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
  resp.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  resp.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return resp
}

async function tokenRequest(env, params) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      ...params,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || data.error || 'token_request_failed')
  return data
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }))
    if (request.method !== 'POST') return cors(new Response('Method not allowed', { status: 405 }))

    const url = new URL(request.url)
    try {
      const body = await request.json()

      if (url.pathname === '/exchange') {
        const data = await tokenRequest(env, {
          code: body.code,
          redirect_uri: body.redirect_uri,
          grant_type: 'authorization_code',
        })
        return cors(Response.json({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_in: data.expires_in,
        }))
      }

      if (url.pathname === '/refresh') {
        const data = await tokenRequest(env, {
          refresh_token: body.refresh_token,
          grant_type: 'refresh_token',
        })
        // Google non restituisce un nuovo refresh_token ad ogni refresh: si riusa quello esistente
        return cors(Response.json({ access_token: data.access_token, expires_in: data.expires_in }))
      }

      return cors(new Response('Not found', { status: 404 }))
    } catch (err) {
      return cors(Response.json({ error: err.message }, { status: 400 }))
    }
  },
}

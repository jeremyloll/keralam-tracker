export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body = await request.json();
    const { promiseId, promiseTitle, updateText, sourceUrl, cfTurnstileResponse } = body;

    // 1. Validate inputs
    if (!promiseId || !updateText || !cfTurnstileResponse) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers }
      );
    }

    if (updateText.length < 20 || updateText.length > 1000) {
      return new Response(
        JSON.stringify({ success: false, error: 'Update must be 20–1000 characters' }),
        { status: 400, headers }
      );
    }

    // 2. Verify Turnstile token
    const turnstileRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET,
          response: cfTurnstileResponse,
        }),
      }
    );
    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      return new Response(
        JSON.stringify({ success: false, error: 'Bot check failed. Please try again.' }),
        { status: 403, headers }
      );
    }

    // 3. Store in KV
    const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const submission = {
      id,
      promiseId,
      promiseTitle,
      updateText,
      sourceUrl: sourceUrl || null,
      submittedAt: new Date().toISOString(),
      status: 'pending', // pending | approved | rejected
    };

    await env.SUBMISSIONS.put(id, JSON.stringify(submission));

    // Also maintain an index of all submission IDs for easy listing
    const indexRaw = await env.SUBMISSIONS.get('__index__');
    const index = indexRaw ? JSON.parse(indexRaw) : [];
    index.unshift(id); // newest first
    await env.SUBMISSIONS.put('__index__', JSON.stringify(index));

    return new Response(
      JSON.stringify({ success: true, id }),
      { status: 200, headers }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: 'Server error' }),
      { status: 500, headers }
    );
  }
}

// Handle preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

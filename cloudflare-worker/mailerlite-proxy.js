const MAILERLITE_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiMTc3Yzk5ODY1OWY1ZmQ0ZDRiMzkzYzE3NTAwNGQ4MGQ2MmU2YTY1MWY3MmM3NmVhNTU1OTQxM2QwOGQwNTQ5MGI3NTAyZGM5ZjMxN2VhMmMiLCJpYXQiOjE3Nzk4MjQ4MzIuOTI5Njg4LCJuYmYiOjE3Nzk4MjQ4MzIuOTI5NjkyLCJleHAiOjQ5MzU0OTg0MzIuOTIyMzkzLCJzdWIiOiIxNDQxMTA1Iiwic2NvcGVzIjpbXX0.gT_1Ud2GbPbGJmzPG2z9dzKyqVrUi2BjB3LHp8qoPad_y7qglNG3EjRYy70N3ku3bx7HP85iwfXzjJvrkHCqwZ-Y6HVA-fBudwXoP5Wfld8qYlQ25YscgC6tpNHOG0mSRXY-XBNjawNVbgJw30ouUf1AkB7JViN2QHyqnqElaG88mcIrhs77YvBlhP19n8RlsZPSFALhTwsr-0b0NOH7EDtiNCIZXHW66XXNNHDQvJM2tSRQ9_pXwkkRhBL5Hi3EYpTGEBGhJ4gxYfcQ2yqt1UTIWWSvGrEpafYKTYZCqEtLjN4FMHw0I34wNKQS2Kgc3rVtTLnfTTw0RekL4gU6rFkHlNhNWFx0HZocHo1ZeB3HE8wIfmRjoU4ev3ijcR0UD51acT5oPnlrtGmqRD3toLpsdbzy9Td5iW7MgMsDs8LdOxyJW07qOp_4NP7JzGm_rG6-K5woIwxL4vyOe4CnhFjuJrbaCfFST3Dp4ujAAYVK_l2BD_F9q1O1x0w0-SGpv2B3WEt1rh29uQ8CXLXB3JsInmeBq2JwsLbXWc1uoEOZ-4J8DqyFAxA-SMusdOQa_QbNfhTov-RBFIgG6cmPXziaB2Wkzyjkds43xgNURdkUnC4IJu2mkDagDRn6l4hLG7zMOdx2DDS-bnQul74JGle84CX7ra6JOdMHA2zdt5I';
const GROUP_NAME = 'Liste Victor Lenormand';
const ALLOWED_ORIGIN = 'https://enigmes-criminelles.fr';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const body = await request.json();
    const { email, pseudo } = body;

    if (!email || !pseudo) {
      return new Response(
        JSON.stringify({ error: 'Missing fields' }),
        { status: 400, headers: corsHeaders }
      );
    }

    let groupId = null;
    const resGroups = await fetch('https://connect.mailerlite.com/api/groups', {
      headers: {
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (resGroups.ok) {
      const dataGroups = await resGroups.json();
      const group = dataGroups.data?.find(g => g.name === GROUP_NAME);
      groupId = group?.id || null;
    }

    const subscriberBody = { email, fields: { name: pseudo } };
    if (groupId) subscriberBody.groups = [groupId];

    const resSub = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscriberBody)
    });

    const dataSub = await resSub.json();

    return new Response(
      JSON.stringify({ success: resSub.ok, status: resSub.status, data: dataSub }),
      { status: resSub.ok ? 200 : resSub.status, headers: corsHeaders }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

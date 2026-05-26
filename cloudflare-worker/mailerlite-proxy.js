/*
DÉPLOIEMENT DU WORKER CLOUDFLARE :

1. Créer un compte gratuit sur
   https://cloudflare.com

2. Dans le dashboard Cloudflare :
   Workers & Pages → Create Worker

3. Copier-coller ce fichier dans l'éditeur du Worker

4. Remplacer METTRE_LA_NOUVELLE_CLE_ICI
   par ta nouvelle clé API MailerLite
   (penser à régénérer la clé sur
   dashboard.mailerlite.com → Integrations)

5. Cliquer sur "Deploy"

6. Copier l'URL du Worker affichée
   (format : https://xxx.xxx.workers.dev)

7. Remplacer WORKER_URL dans js/mailerlite.js
   par cette URL

8. Pousser sur GitHub

Le Worker Cloudflare est gratuit jusqu'à
100 000 requêtes par jour.
*/

const MAILERLITE_API_KEY = 'METTRE_LA_NOUVELLE_CLE_ICI';
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

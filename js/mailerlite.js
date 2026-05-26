/*
  MailerLite — proxy via Worker Cloudflare (contourne le CORS de GitHub Pages)

  URL à remplacer après déploiement du Worker :
  Voir cloudflare-worker/mailerlite-proxy.js pour les instructions.
*/
const WORKER_URL = 'https://mailerlite-proxy.TON_SOUS_DOMAINE.workers.dev';

async function subscribeToMailerLite(email, pseudo) {
  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pseudo })
    });
    const data = await response.json();
    if (response.ok && data.success) {
      console.log('MailerLite OK via proxy:', email);
    } else {
      console.warn('MailerLite proxy réponse:', data);
    }
  } catch (error) {
    console.warn('MailerLite proxy erreur (non bloquant):', error);
  }
}

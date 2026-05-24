const MAILERLITE_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiM2U1M2U4ODA4NTdhMWFjOWFhNWRmNDE4MDkyYzQwOWE2YzA1YmNkNjNmMmM1MmY1ZDNhZDZjZDEzNjM0NjMyMmQ5ZTlhNjE0MzVjOWJhYTMiLCJpYXQiOjE3NzkxMzkyMTcuMjgwOTg5LCJuYmYiOjE3NzkxMzkyMTcuMjgwOTkyLCJleHAiOjQ5MzQ4MTI4MTcuMjc2MDg2LCJzdWIiOiIxNDQxMTA1Iiwic2NvcGVzIjpbXX0.p7uSwn-YjBtk37iqojdUlcFP00sYN93JisQM9UBb_cpwf4Qfzw4nOlv0dDfszSVhC25dZx6-feut0tQwY8aNQl4I1FhNQg22yAFQveHkD57wwI329YTIsS0K1dd-jewUa7UU4uZq9RGcxvZBF46V3dhnjlm4xNZhdzQtKPX5Ev84uSr1jg3fEWXmrZ3uOA3b23AAtAL92MZesMR9Urwt7i6mWZ3QV8GohFwyUQnGaYi-8V-tuenSZ3r8Oy9RaZE_sBXdAZfz0G2uCV3fKeNNTtt31PvJ5-_2NHrz0wxLUPkNd4cpGp0FwE2TEDCQj0Yxf1rqHg_aMHpV6SnQ0FLyfB6YzmC6_KwOnToDfSTj35QML4SJ6f6nVzdASMV9JO3deMTXrtc3wb7MCje8fAMHfDZIYNiLFjsbQqxBUHFmG9Di0O2zKjoqyrx3F3SFAPBMDW2umAeNQTYqzs0aalfPNbOe_8IeQhLfRsLha6zc5MFgyGSEYbBK2K7VpWAdseFseMqFuajwU9Af6YXlvIShI-3OgArLIannVXT_xkuIujHjHN3yLF8uKwG8Kcy0RQ8-pLsBxFztVu9h4K09YtKpdi9UWAEU0UNwh_EbXBPGsuf4WGCGfC4hMJVpaxI9KrSzyuTy9axRnnLkE2do68ty7ZvzgvXjzn_WbwFAOGaWQzM';
const GROUP_NAME = 'Liste Victor Lenormand';

let cachedGroupId = null;

async function getGroupId() {
  if (cachedGroupId) return cachedGroupId;
  try {
    const response = await fetch('https://connect.mailerlite.com/api/groups', {
      headers: {
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    const group = data.data.find(g => g.name === GROUP_NAME);
    cachedGroupId = group ? group.id : null;
    return cachedGroupId;
  } catch (e) {
    console.warn('MailerLite getGroupId (non bloquant):', e && e.message);
    return null;
  }
}

async function subscribeToMailerLite(email, pseudo) {
  try {
    const groupId = await getGroupId();
    const body = { email: email, fields: { name: pseudo } };
    if (groupId) body.groups = [groupId];
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errData = await response.json().catch(function() { return {}; });
      console.warn('MailerLite réponse non-OK:', response.status, errData);
    } else {
      console.log('MailerLite OK:', email);
    }
  } catch (e) {
    /* CORS ou réseau — normal sur certains hébergeurs, ne bloque pas l'inscription */
    console.warn('MailerLite erreur réseau (non bloquant):', e && e.message);
  }
}

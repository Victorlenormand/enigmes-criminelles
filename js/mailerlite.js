/* ═══════════════════════════════════════════════════════════
   mailerlite.js — Intégration MailerLite
   MAILERLITE_API_KEY : Dashboard MailerLite → Integrations → API → copier la clé
   MAILERLITE_GROUP_NAME : Dashboard → Subscribers → Groups → nom exact du groupe
═══════════════════════════════════════════════════════════ */

var MAILERLITE_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiNjEzNDE2YWNjMzA4OTA4YmUyZWIyZGIxY2UwMjFiYWRjNjdiOTVjOGI1ZGUyOWViNDM1NWFlMjMxZDYxNDgyMTcyMGQxNTczMWEyMmZhYzgiLCJpYXQiOjE3NzkxMzk0NjguMjY2Nzc4LCJuYmYiOjE3NzkxMzk0NjguMjY2NzgsImV4cCI6NDkzNDgxMzA2OC4yNjA2MDgsInN1YiI6IjE0NDExMDUiLCJzY29wZXMiOltdfQ.bR8SteS9f2DS-6LHbVdguaiY7zLpcg1CFp_BL2EDgKz_9SBD6qZyPssdtO1DuzT-SgLjd27C9DyokFsPQvEwM6gQYXyNnK6oVUEo_QbgcJfytcjNe8tmW57piM-B1DHOS-ovXZeaBiRTxofpR0TYset1HOB4v5Ya-h_0aqTsuA4b86Qc0MOUeWLYjlmgxDBUfoAQDMCaqZJfK0JqAQTeWF-Eq56PlNFW_GKByjPvbZVrIsbE9OwnSEZAFmVptaHTRYRYVsgvlVS4NRLw72k4N-xynEbgKlryqgIs8bEwMR_Pu8oIzobhuQccdbPaxGmqkjKSbB0NeYfmm3C3WnAHFJ7cWGpUY5FXMAWkgpj8vctT_DuqiFuS5_4CA7vjzOaEM6nlJkjCE4GxuwRymXYgEoxGx_jnAsrX5ZWY9wGw2Xzpc3irGrEGRzZzyQP6VoYcLBTK93opUX_6M4Bxe62E52q2PJMREG7nSeM6xwHvuXnqfEEsbfruYtWn2vPoR49VIQsR8AlzFQhiVymef_48GMjxYYN_FSjrLnpZC1RZlWWDD2hqY4X6vzHc3w86CCw0DBJts9n_DaDl8E8Qqim9gCp8R1XXpVPkjISPmLFi7j1WwJfbJT-npshvyxQFKMTVgefouci9aVz3PghrVgG-Ol1VbLaGwFpyVkJXmfdSPfU';

var MAILERLITE_GROUP_NAME = 'Liste Victor Lenormand';
var _mlGroupId = null;

async function _resolveGroupId() {
  if (_mlGroupId) return _mlGroupId;
  try {
    var res = await fetch('https://connect.mailerlite.com/api/groups?limit=100', {
      headers: {
        'Authorization': 'Bearer ' + MAILERLITE_API_KEY,
        'Accept': 'application/json'
      }
    });
    if (res.ok) {
      var data = await res.json();
      var group = (data.data || []).find(function(g) {
        return g.name === MAILERLITE_GROUP_NAME;
      });
      if (group) _mlGroupId = group.id;
    }
  } catch (e) {
    console.error('MailerLite groups error:', e);
  }
  return _mlGroupId;
}

async function subscribeToMailerLite(email, nom) {
  try {
    var groupId = await _resolveGroupId();
    var body = { email: email, fields: { name: nom } };
    if (groupId) body.groups = [groupId];
    var response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + MAILERLITE_API_KEY
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      response.json().then(function(err) { console.error('MailerLite error:', err); });
    } else {
      console.log('MailerLite: abonné ajouté —', email);
    }
  } catch (error) {
    console.error('MailerLite network error:', error);
  }
}

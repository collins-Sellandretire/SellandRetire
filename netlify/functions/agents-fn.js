exports.handler = async function(event) {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = 'Broker Contacts';

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const company = event.queryStringParameters && event.queryStringParameters.company;

    let formula;
    if (company) {
      // Filter by Company field matching the brokerage name, active only
      formula = encodeURIComponent(`AND({Active}=1,{Company}="${company}")`);
    } else {
      formula = encodeURIComponent(`{Active}=1`);
    }

    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}?filterByFormula=${formula}&sort[0][field]=Full%20Name&sort[0][direction]=asc`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.text();
      return { statusCode: res.status, headers, body: JSON.stringify({ error: err }) };
    }

    const data = await res.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

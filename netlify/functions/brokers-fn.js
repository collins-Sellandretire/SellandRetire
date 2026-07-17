exports.handler = async function(event) {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = 'Brokers';
  const id = event.queryStringParameters && event.queryStringParameters.id;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    if (id) {
      const res = await fetch(
        'https://api.airtable.com/v0/' + baseId + '/' + encodeURIComponent(table) + '/' + id,
        { headers: { Authorization: 'Bearer ' + token } }
      );
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    } else {
      let records = [];
      let offset = null;

      do {
        let url = 'https://api.airtable.com/v0/' + baseId + '/' + encodeURIComponent(table) + '?filterByFormula=%7BActive%7D%3D1&sort%5B0%5D%5Bfield%5D=Company%20Name&sort%5B0%5D%5Bdirection%5D=asc&pageSize=100';
        if (offset) url += '&offset=' + offset;

        const res = await fetch(url, {
          headers: { Authorization: 'Bearer ' + token }
        });
        const data = await res.json();
        if (data.records) records = records.concat(data.records);
        offset = data.offset || null;
      } while (offset);

      return { statusCode: 200, headers, body: JSON.stringify({ records }) };
    }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

// Netlify Function: listings.js
// Place this file in: netlify/functions/listings.js in your GitHub repo
// This securely proxies requests to Airtable so your API key is never exposed publicly

exports.handler = async function(event, context) {

  // Allow CORS so your HTML pages can call this function
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Get credentials from Netlify environment variables (never exposed to browser)
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const TABLE_NAME = 'Listings';

  // Check credentials exist
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Missing Airtable credentials' })
    };
  }

  try {
    // Check if a specific listing ID was requested e.g. ?id=recXXXXXX
    const listingId = event.queryStringParameters && event.queryStringParameters.id;

    let url;

    if (listingId) {
      // Fetch a single listing by record ID
      url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}/${listingId}`;
    } else {
      // Fetch all active listings
      // filterByFormula only returns rows where Status = Active
      const formula = encodeURIComponent("Status='Active'");
      url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}?filterByFormula=${formula}&sort[0][field]=Date%20Listed&sort[0][direction]=desc`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: `Airtable error: ${errorText}` })
      };
    }

    const data = await response.json();

    // Return the data to the browser
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

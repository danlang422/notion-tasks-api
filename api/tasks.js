export const runtime = 'edge';

import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

export default async function handler(req) {
  if (req.method === 'GET') {
    try {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        sorts: [
          {
            property: "Do Date",
            direction: "ascending",
          },
        ],
      });
      
      return new Response(JSON.stringify(response.results), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch tasks' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
}

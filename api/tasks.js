import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const response = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID,
        sorts: [{ property: "Do Date", direction: "ascending" }],
      });
      res.status(200).json(response.results);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }
}

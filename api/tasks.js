import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  console.log('Environment variables present:', {
    hasToken: !!process.env.NOTION_TOKEN,
    hasDbId: !!process.env.NOTION_DATABASE_ID
  });
  
  const notion = new Client({
    auth: process.env.NOTION_TOKEN,
  });

  if (req.method === 'GET') {
    try {
      const response = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID,
        sorts: [{ property: "Do Date", direction: "ascending" }],
      });
      res.status(200).json(response.results);
    } catch (error) {
      console.error('Error details:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }
}

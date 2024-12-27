// pages/api/tasks.js
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const getFrames = async () => {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_FRAMES_DB_ID
  });
  return response.results;
};

const getAreas = async () => {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_AREAS_DB_ID
  });
  return response.results;
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const response = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID,
        sorts: [{ property: "Do Date", direction: "ascending" }],
      });
      res.status(200).json(response.results);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  } 
  else if (req.method === 'POST') {
    // Rest of the code remains the same
  }
}

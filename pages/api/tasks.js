// pages/api/tasks.js
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
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  } 
  else if (req.method === 'POST') {
    try {
      const { name, doDate, status, frameId, areaIds, timeframe, projectIds } = req.body;
      
      const response = await notion.pages.create({
        parent: { database_id: process.env.NOTION_DATABASE_ID },
        properties: {
          Name: {
            title: [{ text: { content: name } }]
          },
          "Do Date": doDate ? {
            date: { start: doDate }
          } : null,
          Status: {
            status: { name: status || "Not started" }
          },
          Frame: frameId ? {
            relation: [{ id: frameId }]
          } : null,
          Areas: areaIds ? {
            relation: areaIds.map(id => ({ id }))
          } : null,
          Timeframe: timeframe ? {
            select: { name: timeframe }
          } : null,
          Projects: projectIds ? {
            relation: projectIds.map(id => ({ id }))
          } : null
        }
      });
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }
}

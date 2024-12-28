// pages/api/tasks/[id].js
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  if (req.method === 'PATCH') {
    const { status, timeframe, areaIds, frameId, doDate } = req.body;
    
    try {
      const properties = {};
      
      if (status) {
        properties.Status = { status: { name: status } };
      }
      if (timeframe) {
        properties.Timeframe = { select: { name: timeframe } };
      }
      if (areaIds) {
        properties.Areas = { relation: areaIds.map(id => ({ id })) };
      }
      if (frameId) {
        properties.Frame = { relation: [{ id: frameId }] };
      }
      if (doDate) {
        properties["Do Date"] = { date: { start: doDate } };
      }

      const response = await notion.pages.update({
        page_id: id,
        properties
      });
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  } else {
    res.setHeader('Allow', ['PATCH', 'OPTIONS']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

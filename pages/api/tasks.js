import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

async function getTasks() {
  return notion.databases.query({
    database_id: DATABASE_ID,
    sorts: [{ property: "Do Date", direction: "ascending" }],
  });
}

async function createTask(taskData) {
  const { name, doDate, status, frameId, areaIds, timeframe, projectIds } = taskData;
  return notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      Name: { title: [{ text: { content: name } }] },
      "Do Date": doDate ? { date: { start: doDate } } : null,
      Status: { status: { name: status || "Not started" } },
      Frame: frameId ? { relation: [{ id: frameId }] } : null,
      Areas: areaIds ? { relation: areaIds.map(id => ({ id })) } : null,
      Timeframe: timeframe ? { select: { name: timeframe } } : null,
      Projects: projectIds ? { relation: projectIds.map(id => ({ id })) } : null
    }
  });
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const response = await getTasks();
      res.status(200).json(response.results);
    } else if (req.method === 'POST') {
      const response = await createTask(req.body);
      res.status(200).json(response);
    }
  } catch (error) {
    res.status(500).json({ error: `Failed to ${req.method === 'GET' ? 'fetch' : 'create'} task` });
  }
}

import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function findByName(databaseId, name) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "Name",
      title: { equals: name }
    }
  });
  return response.results[0];
}

async function getRelationId(databaseId, name) {
  const item = await findByName(databaseId, name);
  return item?.id;
}

async function createTask(taskData) {
  const { name, doDate, status, frame, areas, timeframe, project } = taskData;

  const frameId = frame ? await getRelationId(process.env.NOTION_FRAMES_DB_ID, frame) : null;
  const projectId = project ? await getRelationId(process.env.NOTION_PROJECTS_DB_ID, project) : null;
  const areaIds = areas ? await Promise.all(
    areas.map(area => getRelationId(process.env.NOTION_AREAS_DB_ID, area))
  ) : null;

  return notion.pages.create({
    parent: { database_id: process.env.NOTION_TASKS_DB_ID },
    properties: {
      Name: { title: [{ text: { content: name } }] },
      "Do Date": doDate ? { date: { start: doDate } } : null,
      Status: { status: { name: status || "Not started" } },
      Frame: frameId ? { relation: [{ id: frameId }] } : null,
      Areas: areaIds ? { relation: areaIds.filter(id => id).map(id => ({ id })) } : null,
      Timeframe: timeframe ? { select: { name: timeframe } } : null,
      Projects: projectId ? { relation: [{ id: projectId }] } : null
    }
  });
}

async function getTasks() {
  return notion.databases.query({
    database_id: process.env.NOTION_TASKS_DB_ID,
    sorts: [{ property: "Do Date", direction: "ascending" }],
  });
}

export const tasksHandler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const response = await getTasks();
      res.status(200).json(response.results);
    } else if (req.method === 'POST') {
      const response = await createTask(req.body);
      res.status(200).json(response);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: `Failed to ${req.method === 'GET' ? 'fetch' : 'create'} task` });
  }
};

export default tasksHandler;

// api/tasks.js
const { Client } = require('@notionhq/client');

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Export the handler function for the /api/tasks endpoint
export default async function handler(req, res) {
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
      
      res.status(200).json(response.results);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  } else if (req.method === 'POST') {
    const { name, doDate, status, frameId, projectIds } = req.body;
    
    try {
      const response = await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: name,
                },
              },
            ],
          },
          "Do Date": doDate ? {
            date: {
              start: doDate,
            },
          } : null,
          Status: {
            select: {
              name: status,
            },
          },
          Frame: frameId ? {
            relation: [
              {
                id: frameId,
              },
            ],
          } : null,
          Projects: projectIds ? {
            relation: projectIds.map(id => ({ id })),
          } : null,
        },
      });
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

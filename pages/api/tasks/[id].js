// api/tasks/[id].js
const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    const { status } = req.body;
    
    try {
      const response = await notion.pages.update({
        page_id: id,
        properties: {
          Status: {
            select: {
              name: status,
            },
          },
        },
      });
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

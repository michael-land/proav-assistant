import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import ky, { HTTPError } from 'ky';

const app = new Hono();

app.use('*', cors());

app.get('/health', (c) => c.json({ status: 'ok' }));
app.post('update', async (c) => {
  const text = await ky.get('http://host.docker.internal:9000/update?token=your_secret_token').text();
  return c.json({ status: 'ok', text });
});

app.post('/source/switch', async (c) => {
  const { device, data } = (await c.req.json()) as {
    device: { ip: string };
    data: { input: string; output: string };
  };

  try {
    const response = await ky
      .post(`http://${device.ip}/video_set`, { body: `#video_d out${data.output} matrix=${data.input}` })
      .text();
    console.log(`Switched input ${data.input} to output ${data.output}`, { response });
    return c.json({ success: true });
  } catch (error) {
    if (error instanceof HTTPError) {
      return c.json({
        success: false,
        error: {
          response: { status: error.response.status, data: error.response.text() },
          message: error.message,
        },
      });
    } else if (error instanceof Error) {
      return c.json({
        success: false,
        error: {
          status: 0,
          name: error.name,
          message: error.message,
        },
      });
    } else {
      return c.json({
        success: false,
        error: {
          status: 0,
          message: 'Unknown error',
        },
      });
    }
  }
});

const server = serve(
  {
    fetch: app.fetch,
    port: parseInt(process.env.PORT || '', 10),
  },
  (info) => {
    console.log(`🚀 Server is running on http://localhost:${info.port}`);
  }
);

process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});

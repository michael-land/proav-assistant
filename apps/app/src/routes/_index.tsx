import { Form } from 'react-router';
import type { Route } from './+types/_index';

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const input = formData.get('input')?.toString();
  const output = formData.get('output')?.toString();
  const deviceIp = formData.get('deviceIp')?.toString();
  const controllerIp = formData.get('controllerIp')?.toString();

  const response = await fetch(`http://${controllerIp}/api/source/switch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        input: Number(input),
        output: Number(output),
      },
      device: {
        ip: deviceIp,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to switch source');
  }

  return await response.json();
}

export default function Index({ actionData }: Route.ComponentProps) {
  return (
    <div>
      <h1>Control Box v1.0.0</h1>
      <button
        type="button"
        onClick={async () => {
          const res = await fetch('/api/update?token=your_secret_token', {
            method: 'POST',
          });
          const text = await res.text();
          console.log(text);
        }}
      >
        upgrade
      </button>

      <Form
        method="post"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          maxWidth: 400,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <label htmlFor="ip" style={{ width: 150 }}>
            Controller IP Address:{' '}
          </label>
          <input
            readOnly
            defaultValue="192.168.10.185"
            name="controllerIp"
            placeholder="Controller IP Address"
            style={{ width: '100%' }}
            type="text"
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <label htmlFor="ip" style={{ width: 150 }}>
            Device IP Address:{' '}
          </label>
          <input
            defaultValue="192.168.1.168"
            name="deviceIp"
            placeholder="Device IP Address"
            style={{ width: '100%' }}
            type="text"
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <label htmlFor="input" style={{ width: 150 }}>
            Input:{' '}
          </label>
          <input max={4} min={1} name="output" placeholder="output" style={{ width: '100%' }} type="number" />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <label htmlFor="output" style={{ width: 150 }}>
            Output:{' '}
          </label>
          <input max={4} min={1} name="input" placeholder="input" style={{ width: '100%' }} type="number" />
        </div>
        <input type="submit" value="submit" />
      </Form>
      {actionData && <pre>{JSON.stringify(actionData, null, 2)}</pre>}
    </div>
  );
}

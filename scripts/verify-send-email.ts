import handler from '../api/send-email';

type MockRes = {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  status: (code: number) => MockRes;
  setHeader: (key: string, value: string) => MockRes;
  json: (payload: unknown) => MockRes;
  end: () => MockRes;
};

function createMockRes(): MockRes {
  const res: MockRes = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(key, value) {
      this.headers[key] = value;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end() {
      return this;
    },
  };
  return res;
}

async function runCase(name: string, req: Record<string, unknown>, setup?: () => void) {
  delete process.env.RESEND_API_KEY;
  delete process.env.VITE_RESEND_API_KEY;
  setup?.();
  const res = createMockRes();
  await handler(req as any, res as any);
  console.log(`${name}: ${res.statusCode} ${JSON.stringify(res.body)}`);
  if (name === 'missing api key' && res.statusCode !== 503) process.exitCode = 1;
  if (name === 'invalid origin' && res.statusCode !== 403) process.exitCode = 1;
  if (name === 'invalid complaint payload' && res.statusCode !== 400) process.exitCode = 1;
}

async function main() {
  await runCase('missing api key', {
    method: 'POST',
    headers: { origin: 'https://glbsl.com.np', 'content-length': '120' },
    body: {
      formType: 'complaint',
      data: {
        fullName: 'Test User',
        mobileNumber: '9800000000',
        branchOffice: 'Dhankuta',
        complaint: 'Test complaint body',
        language: 'en',
      },
    },
  });

  await runCase('invalid origin', {
    method: 'POST',
    headers: { origin: 'https://evil.example', 'content-length': '120' },
    body: {
      formType: 'complaint',
      data: {
        fullName: 'Test User',
        mobileNumber: '9800000000',
        branchOffice: 'Dhankuta',
        complaint: 'Test complaint body',
        language: 'en',
      },
    },
  }, () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_URL = 'glbsl.com.np';
  });

  await runCase('invalid complaint payload', {
    method: 'POST',
    headers: { origin: 'https://glbsl.com.np', 'content-length': '80' },
    body: {
      formType: 'complaint',
      data: {
        fullName: '',
        mobileNumber: 'bad',
        branchOffice: '',
        complaint: '',
        language: 'en',
      },
    },
  });

  if (process.env.RESEND_API_KEY) {
    const res = createMockRes();
    await handler({
      method: 'POST',
      headers: { origin: 'https://glbsl.com.np', 'content-length': '120' },
      body: {
        formType: 'complaint',
        data: {
          fullName: 'API Smoke Test',
          mobileNumber: '9800000000',
          branchOffice: 'Dhankuta',
          complaint: 'Automated smoke test – please ignore.',
          language: 'en',
        },
      },
    } as any, res as any);
    console.log(`live send: ${res.statusCode} ${JSON.stringify(res.body)}`);
    if (res.statusCode !== 200) process.exitCode = 1;
  } else {
    console.log('live send: skipped (RESEND_API_KEY not set locally)');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import handler from '../api/send-email';

const res = {
  statusCode: 200,
  headers: {} as Record<string, string>,
  body: null as unknown,
  status(code: number) {
    this.statusCode = code;
    return this;
  },
  setHeader(key: string, value: string) {
    this.headers[key] = value;
    return this;
  },
  json(payload: unknown) {
    this.body = payload;
    return this;
  },
  end() {
    return this;
  },
};

await handler(
  {
    method: 'POST',
    headers: { origin: 'https://glbsl.com.np', 'content-length': '200' },
    body: {
      formType: 'complaint',
      data: {
        fullName: 'Sandbox Test',
        mobileNumber: '9800000000',
        branchOffice: 'Dhankuta',
        complaint: 'Sandbox mode verification',
        language: 'en',
      },
    },
  } as any,
  res as any,
);

console.log('status:', res.statusCode);
console.log('body:', JSON.stringify(res.body));
process.exit(res.statusCode === 200 ? 0 : 1);

import request from 'supertest';
import { app } from '../../main';

describe('GET /config', () => {
  it('Get site config from server', async () => {
    const response = await request(app)
      .get('/config?uuid=abcde-123456-7890')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toBeTruthy();

    expect(response.body).toEqual({
      code: 0,
      data: expect.objectContaining({
        token: expect.any(String),
        COTURN_PREFIX: expect.any(String),
        PEER_SERVER_PATH: expect.any(String),
        COTURN_USERNAME: expect.any(String),
        COTURN_PASSWORD: expect.any(String),
        BUILD_TIME: expect.any(String),
        BUILD_VERSION: expect.any(String),
      }),
      msg: 'success',
    });
  });

  it('Get site config from server without uuid', async () => {
    const response = await request(app)
      .get('/config')
      .send();

    expect(response.status).toBe(400);
  });
});

describe('Meeting API', () => {
  let token = '';
  let meetingId = '';

  beforeAll(async () => {
    const configResponse = await request(app).get(
      '/config?uuid=abcde-123456-7890',
    );
    token = configResponse.body.data.token;
  });

  describe('POST /meeting', () => {
    it('should have token', async () => {
      const response = await request(app)
        .post('/meeting')
        .set('Content-Type', 'application/json')
        .send(
          JSON.stringify({
            title: `John Doe's meeting`,
            organizer_name: 'John Doe',
            start_time: '1234567890',
            passcode: '123456',
          }),
        );

      expect(response.status).toBe(401);
    });

    it('should create a meeting and return the meeting ID', async () => {
      const response = await request(app)
        .post('/meeting')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send({
          title: `John Doe's meeting`,
          organizer_name: 'John Doe',
          start_time: '1234567890',
          passcode: '123456',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      meetingId = response.body.data.id;
    });
  });

  describe('GET /meeting', () => {
    it('should need passcode', async () => {
      const response = await request(app)
        .get(`/meeting?id=${meetingId}&name=John`)
        .set('Authorization', `Bearer ${token}`)
        .send();

      expect(response.status).toBe(401);
    });

    it('should get meeting info', async () => {
      const response = await request(app)
        .get(`/meeting?id=${meetingId}&name=John&passcode=123456`)
        .set('Authorization', `Bearer ${token}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('msg', 'success');
      expect(response.body).toHaveProperty('data');
    });
  });
});

import fs from 'fs';

describe('Avatar API', () => {
  let token = '';
  let avatarId = '';

  beforeAll(async () => {
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

    const configResponse = await request(app).get(
      '/config?uuid=abcde-123456-7890',
    );
    token = configResponse.body.data.token;
  });

  describe('POST /avatar', () => {
    it('should upload avatar', async () => {
      const response = await request(app)
        .post('/avatar?fileName=logo_color.svg')
        .set('Authorization', `Bearer ${token}`)
        .attach('image', 'doc/images/logo_color.svg');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      avatarId = response.body.data;
    });
  });

  describe('GET /avatar', () => {
    it('should get avatar', async () => {
      const response = await request(app)
        .get(`/avatar?fileName=${avatarId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
    });
  });
});

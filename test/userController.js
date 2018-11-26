import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../server';

chai.use(chaiHttp);

const { request, expect } = chai;

describe('User controller', () => {
  const randomEmail = `jimbo${Math.random() * 10000 | 0}@gmail.com`;
  const randomUsername = `ab${Math.random() * 10000 | 0}fd`;
  const userInfo = {
    firstname: 'John',
    lastname: 'Alabi',
    othernames: 'Ijeoma',
    email: randomEmail,
    username: randomUsername,
    password: 'helloworld'
  };
  let token, userID;

  describe('POST /auth/signup', () => {
    it('should create a new user', done => {
      request(app)
        .post('/api/v1/auth/signup')
        .send(userInfo)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body).to.be.a('object');

          const body = res.body;
          expect(body).to.have.property('data').be.a('array');
          expect(body.data[0]).to.be.a('object');
          expect(body.data[0]).to.have.property('token').be.a('string');
          expect(body.data[0]).to.have.property('user').to.have.property('id');

          token = body.data[0].token;
          userID = body.data[0].user.id;
          done();
        });
    });
    it('should not create an existing user', done => {
      request(app)
        .post('/api/v1/auth/signup')
        .send(userInfo)
        .end((err, res) => {
          expect(res.status).to.equal(403);
          expect(res.body).to.be.a('object');

          const body = res.body;
          expect(body).to.have.property('status').be.a('number');
          expect(body).to.have.property('error').be.a('string');

          done();
        });
    });
  });

  describe('POST /auth/login', () => {
    it('should allow a user to login', done => {
      request(app)
        .post('/api/v1/auth/login')
        .send({
          username: userInfo.username,
          password: userInfo.password,
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.a('object');

          const body = res.body;
          expect(body).to.have.property('data').be.a('array');
          expect(body.data[0]).to.be.a('object');
          expect(body.data[0]).to.have.property('token').be.a('string');
          expect(body.data[0]).to.have.property('user').to.have.property('id');

          token = body.data[0].token;
          done();
        });
    });
    it('should not allow a non-user to login', done => {
      request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'wicked',
          password: 'baduser',
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.be.a('object');

          const body = res.body;
          expect(body).to.have.property('status').be.a('number');
          expect(body).to.have.property('error').be.a('string');

          done();
        });
    });
  });

  describe('GET /users/:userID/parcels', () => {
    it('should fetch all parcel orders made by a user', done => {
      request(app)
        .get(`/api/v1/users/${+userID}/parcels`)
        .set('x-access-token', token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.a('object');

          const body = res.body;
          expect(body).to.have.property('data').be.a('array');

          done();
        });
    });
    it('should not fetch all parcel orders if req is made by another user', done => {
      request(app)
        .get(`/api/v1/users/12345678/parcels`)
        .set('x-access-token', token)
        .end((err, res) => {
          expect(res.status).to.equal(403);
          expect(res.body).to.be.a('object');

          const body = res.body;
          expect(body).to.have.property('status').be.a('number');
          expect(body).to.have.property('error').be.a('string');

          done();
        });
    });
  });
});

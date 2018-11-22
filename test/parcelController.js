import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../server';

chai.use(chaiHttp);

const { request, expect } = chai;

describe('Parcel controller', () => {
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
  let token, userID, parcelID;

  describe('POST /auth/signup', () => {
    it('should create a new user for the test', done => {
      request(app)
        .post('/api/v1/auth/signup')
        .send(userInfo)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.status).to.equal(201);
          expect(res.body).to.be.a('object');

          const body = res.body;
          expect(body).to.have.property('data').be.a('array');
          expect(body.data[0]).to.be.a('object');
          expect(body.data[0]).to.have.property('token').be.a('string');
          expect(body.data[0]).to.have.property('user').to.have.property('id');

          token = body.data[0].token;
          userID = +body.data[0].user.id;
          done();
        });
    });
  });

  describe('POST /parcels', () => {
    it('should create a new parcel delivery order', done => {
      request(app)
        .post('/api/v1/parcels')
        .set('x-access-token', token)
        .send({
          weight: 50.44,
          weightmetric: 'lbs',
          from: 'Lagos A',
          to: 'Kaduna B'
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.status).to.equal(201);
          expect(res.body).to.be.a('object');

          const body = res.body;
          expect(body).to.have.property('data').be.a('array');

          parcelID = +body.data[0].id;

          done();
        });
    });
  });

  describe('GET /parcels', () => {
    it('should not allow a non-admin to fetch all parcel orders', done => {
      request(app)
        .get('/api/v1/parcels')
        .set('x-access-token', token)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.status).to.equal(401);
          expect(res.body).to.be.a('object');

          const body = res.body;
          expect(body).to.have.property('error').be.a('string');

          done();
        });
    });
  });

  describe('GET /parcels/:parcelID', () => {
    it('should fetch a particular parcel order', done => {
      request(app)
        .get(`/api/v1/parcels/${parcelID}`)
        .set('x-access-token', token)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.status).to.equal(200);
          expect(res.body).to.be.a('object');

          const body = res.body;
          expect(body).to.have.property('data').be.a('array');
          expect(body.data[0]).to.have.property('id').equal(parcelID);

          done();
        });
    });
  });

  describe('PATCH /parcels/:parcelID/destination', () => {
    it('should change the destination a particular parcel order', done => {
      request(app)
        .patch(`/api/v1/parcels/${parcelID}/destination`)
        .set('x-access-token', token)
        .send({ to: 'Junction' })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.status).to.equal(200);
          expect(res.body).to.be.a('object');

          const body = res.body;
          expect(body).to.have.property('data').be.a('array');
          expect(body.data[0]).to.have.property('id').equal(parcelID);
          expect(body.data[0]).to.have.property('message');
          
          done();
        });
    });
  });

  describe('PATCH /parcels/:parcelID/status', () => {
    it('should not allow non-admin to change the status of a particular parcel order', done => {
      request(app)
        .patch(`/api/v1/parcels/${parcelID}/status`)
        .set('x-access-token', token)
        .send({ status: 'transiting' })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.status).to.equal(401);
          expect(res.body).to.be.a('object');

          const body = res.body;
          expect(body).to.have.property('error');
          
          done();
        });
    });
  });

  describe('PATCH /parcels/:parcelID/currentlocation', () => {
    it('should not allow a non-admin to change the current location of an order', done => {
      request(app)
        .patch(`/api/v1/parcels/${parcelID}/currentlocation`)
        .set('x-access-token', token)
        .send({ currentLocation: 'Block A, Ikeja bustop' })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.status).to.equal(401);
          expect(res.body).to.be.a('object');

          const body = res.body;
          expect(body).to.have.property('error');
          
          done();
        });
    });
  });

  describe('PATCH /parcels/:parcelID/cancel', () => {
    it('should cancel a particular parcel order', done => {
      request(app)
        .patch(`/api/v1/parcels/${parcelID}/cancel`)
        .set('x-access-token', token)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.status).to.equal(200);
          expect(res.body).to.be.a('object');

          const body = res.body;
          expect(body).to.have.property('data').be.a('array');
          expect(body.data[0]).to.have.property('id').equal(parcelID);
          expect(body.data[0]).to.have.property('message');
          
          done();
        });
    });
  });
});

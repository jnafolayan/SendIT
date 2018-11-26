import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../server';

chai.use(chaiHttp);

const { request, expect } = chai;

describe('Admin', () => {
  const username = 'jnafolayan';
  const password = 'helloworld';

  let token, parcelID;

  describe('POST /auth/login', () => {
    it('should login the admin', done => {
      request(app)
        .post('/api/v1/auth/login')
        .send({ username, password })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
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
  });

  describe('GET /parcels', () => {
    it('should allow admin to fetch all parcel orders', done => {
      request(app)
        .get('/api/v1/parcels')
        .set('x-access-token', token)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.status).to.equal(200);
          expect(res.body).to.be.a('object');

          const body = res.body;
          expect(body).to.have.property('data').be.a('array');

          parcelID = body.data[0].id;

          done();
        });
    });
  });

  describe('PATCH /parcels/:parcelID/status', () => {
    it('should allow admin to change the status of a particular parcel order', done => {
      request(app)
        .patch(`/api/v1/parcels/${parcelID}/status`)
        .set('x-access-token', token)
        .send({ status: 'transiting' })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.status).to.equal(200);
          expect(res.body).to.be.a('object');

          const body = res.body;
          expect(body).to.have.property('data').be.a('array');
          expect(body.data[0]).to.have.property('id').equal(parcelID);
          expect(body.data[0]).to.have.property('status').equal('transiting');
          expect(body.data[0]).to.have.property('message');
          
          done();
        });
    });
  });

  describe('PATCH /parcels/:parcelID/currentlocation', () => {
    it('should allow admin to change the current location of an order', done => {
      request(app)
        .patch(`/api/v1/parcels/${parcelID}/currentlocation`)
        .set('x-access-token', token)
        .send({ currentLocation: 'Block A, Ikeja bustop' })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.status).to.equal(200);
          expect(res.body).to.be.a('object');

          const body = res.body;
          expect(body).to.have.property('data').be.a('array');
          expect(body.data[0]).to.have.property('id').equal(parcelID);
          expect(body.data[0]).to.have.property('currentLocation').equal('Block A, Ikeja bustop');
          expect(body.data[0]).to.have.property('message');
          
          done();
        });
    });
  });
});

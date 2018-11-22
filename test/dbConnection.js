import db from '../server/db';

describe('PostgreSQL', function() {
  it('connects to PostgreSQL server', done => {
    db.connect()
      .then(() => done())
      .catch(done);
  });
});

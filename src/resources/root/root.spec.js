const request = require('supertest').agent(app.listen());

const expect = require('chai').expect;
const should = require('should');
const app = require('../../server');

describe('GET /', () => {
    it('should respond with 403', (done) => {
        request.get('/').expect(403, done);
    });
});

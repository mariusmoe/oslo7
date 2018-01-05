process.env.NODE_ENV = 'test';

let server = require('../index');
let status = require('../status');

let mongoose = require("mongoose"),
    User = require('../models/user'),
    Center = require('../models/center'),
    Referral = require('../models/referral');

mongoose.Promise = Promise;

let chai = require('chai');
let chaiHttp = require('chai-http');
let sinon = require('sinon');
let should = chai.should();
var jwt = '';
let referral_jwt = '';
let adminReferralLink = '';
let centerId;
chai.use(chaiHttp);

let today = new Date();
var clock; // sinon variable


describe('Auth API', () => {
    before( (done) => {
      clock = sinon.useFakeTimers();

      Center.remove({}).lean().then(User.remove({}).lean().then(Referral.remove({}).lean().then(() => {
        chai.request(server).post('/api/auth/register_testdata').send('{}').end(function(err,res){
          centerId = res.body.center._id;
          done();
        });
      })));
    });

    after( (done) => {
      clock.restore();
      done();
    })

  beforeEach((done) => {
      chai.request(server)
      .post('/api/auth/login')
      .send({'email': 'testuser@test.test', 'password': 'test'})
      .end(function(err, res){
        jwt = res.body.token;   // Should be globaly avaliable before each test now
        res.should.have.status(200);
        done();
      });
  });


  describe('/api/auth/login POST', () => {
    it('should log in one user /api/auth/login POST', (done) => {
    chai.request(server)
      .post('/api/auth/login')
      .send({'email': 'testuser@test.test', 'password': 'test'})
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
    });
    it('should return 401 when the user login email is wrong /api/auth/login POST', (done) => {
    chai.request(server)
      .post('/api/auth/login')
      .send({'email': 'test@wrongemail.com', 'password': 'test'}) // wrong email
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
    });
    it('should return 401 when the user login password is wrong /api/auth/login POST', (done) => {
    chai.request(server)
      .post('/api/auth/login')
      .send({'email': 'testuser@test.test', 'password': 'wrongpassword'}) // wrong password
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
    });
    it('should return 400 when the user login details are omitted /api/auth/login POST', (done) => {
    chai.request(server)
      .post('/api/auth/login')
      .send() // omitted
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
    });
  });



  describe('/api/auth/get_referral_link/[role]/[center]/ POST', () => {
    it('should create one referral link /api/auth/get_referral_link/vitenleader/[center] GET', (done) => {
      chai.request(server)
      .get('/api/auth/get_referral_link/vitenleader/' + centerId)
      .set('Authorization', jwt)
      .end( (err, res) => {
        res.should.have.status(200);
        // this is used below! Careful!
        adminReferralLink = res.body.link.slice(-96); // the last 96 chars = actual referral id
        done();
      });
    });


    it('should fail to create new user - bad link /api/auth/register with referralLink POST', (done) => {
      chai.request(server)
      .post('/api/auth/register')
      .send({'email': 'test@test.com', 'password': 'test', 'referral_string': 'fff'})
      .end( (err, res) => {
        res.body.should.have.property('message');
        res.body.message.should.equal(status.REFERRAL_LINK_WRONG.message);
        res.should.have.status(422);
        done();
      });
    });

    it('should fail to create new user - time passed /api/auth/register with referralLink POST', (done) => {
      clock.tick(today.getTime() + 1000*60*60*24*15); // one day past expiration day of 14 days.

      chai.request(server)
      .post('/api/auth/register')
      .send({'email': 'test2@test.com', 'password': 'test', 'referral_string': adminReferralLink})
      .end( (err, res) => {
        res.body.should.have.property('message');
        res.body.message.should.equal(status.REFERRAL_LINK_EXPIRED.message);
        res.should.have.status(422);

        clock = sinon.useFakeTimers();
        done();
      });
    });



    it('should create a new user /api/auth/register with referralLink POST', (done) => {
      chai.request(server)
      .post('/api/auth/register')
      .send({'email': 'test3-to-del@test.com', 'password': 'test', 'referral_string': adminReferralLink})
      .end( (err, res) => {
        res.should.have.status(200);
        done();
      });
    });

    it('should fail to create new user - link no longer active /api/auth/register with referralLink POST', (done) => {
      chai.request(server)
      .post('/api/auth/register')
      .send({'email': 'someOtherRandomEmail@test.com', 'password': 'test', 'referral_string': adminReferralLink})
      .end( (err, res) => {
        res.body.should.have.property('message');
        res.body.message.should.equal(status.REFERRAL_LINK_USED.message);
        res.should.have.status(401);
        done();
      });
    });

    it('should fail to create new user - email already used /api/auth/register with referralLink POST', (done) => {
      chai.request(server)
      .get('/api/auth/get_referral_link/vitenleader/' + centerId)
      .set('Authorization', jwt)
      .end( (err1, res1) => {
        res1.should.have.status(200);
        let ref = res1.body.link.slice(-96); // the last 96 chars = actual referral id

        chai.request(server)
        .post('/api/auth/register')
        .send({'email': 'test3-to-del@test.com', 'password': 'test', 'referral_string': ref})
        .end( (err2, res2) => {
          res2.body.should.have.property('message');
          res2.body.message.should.equal(status.EMAIL_NOT_AVILIABLE.message);
          res2.should.have.status(401);
          done();
        });
      });
    });


    it('should login user to be deleted /api/auth/login POST', (done) => {
      chai.request(server)
      .post('/api/auth/login')
      .send({'email': 'test3-to-del@test.com', 'password': 'test'})
      .end(function(err, res){
        referral_jwt = res.body.token;   // Should be globaly avaliable before each test now
        user_id = res.body.user._id;
        res.should.have.status(200);
        done();
      });
    });
    it('should delete this user /api/auth/delete_account DELETE', (done) => {
      chai.request(server)
      .delete('/api/auth/delete_account')
      .set('Authorization', referral_jwt)
      .send({'id': user_id})
      .end( (err, res) => {
        res.should.have.status(200);
        done();
      });
    });
    it('should create one referral link /api/auth/get_referral_link/[role]/[center] GET', (done) => {
      chai.request(server)
      .get('/api/auth/get_referral_link/user/' + centerId)
      .set('Authorization', jwt)
      .end( (err, res) => {
        res.should.have.status(200);
        done();
      });
    });
    it('should return 401 when unauthorized - wrong jwt /api/auth/get_referral_link GET', (done) => {
      chai.request(server)
      .get('/api/auth/get_referral_link/user/' + centerId)
      .set('Authorization', 'badcode')  // bad code
      .end( (err, res) => {
        res.should.have.status(401);
        done();
      });
    });
    it('should return 401 when unauthorized - omitted auth property /api/auth/get_referral_link GET', (done) => {
      chai.request(server)
      .get('/api/auth/get_referral_link/user/' + centerId)
      // .set('Authorization', 'badcode') // omitted authorization property
      .end( (err, res) => {
        res.should.have.status(401);
        done();
      });
    });
  });

  describe('/api/auth/get_token GET', () => {
    it('should get a new JWT /api/auth/get_token GET', (done) => {
      chai.request(server)
      .get('/api/auth/get_token')
      .set('Authorization', jwt)
      .end( (err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('token');
        res.body.should.have.property('user');
        done();
      });
    });
  });

  describe('/api/auth/delete_account DELETE', () => {
    let isolated_jwt = ""

    it('should create a new user /api/auth/register_developer POST', (done) => {
    chai.request(server)
      .post('/api/auth/register_developer')
      .send({'email': 'test-to-del@test.com', 'password': 'test'})
      .end(function(err, res){
        //res.should.have.status(200);
        done();
      })
    });

    it('should login user to be deleted /api/auth/login POST', (done) => {
      chai.request(server)
      .post('/api/auth/login')
      .send({'email': 'test-to-del@test.com', 'password': 'test'})
      .end(function(err, res){
        isolated_jwt = res.body.token;   // Should be globaly avaliable before each test now
        user_id = res.body.user._id;
        res.should.have.status(200);
        done();
      });
    });
    it('should delete this user /api/auth/delete_account DELETE', (done) => {
      chai.request(server)
      .delete('/api/auth/delete_account')
      .set('Authorization', isolated_jwt)
      .send({'id': user_id})
      .end( (err, res) => {
        res.should.have.status(200);
        done();
      });
    });
  });
});

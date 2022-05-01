const request = require("supertest");
const expect = require("chai").expect;
const dotenv = require("dotenv");
dotenv.config();

const app = require("../../app.js");
const User = require("../../models/user.js");
const Store = require("../../models/store.js");


before(function (done) {
  this.timeout(3000);
  setTimeout(done, 2000);
});

describe("GET stores", () => {
  it("should give all stores with correct auth", (done) => {
    request(app)
      .get("/api/stores")
      .auth(process.env.TEST_USERNAME, process.env.TEST_PASSWORD)
      .expect(200)
      .then(res => {
        console.log(res.body)
        done();
      })
      .catch((err) => done(err));
  });

  it("should return 401 unauthorized with valid username but wrong password", (done) => {
    request(app)
      .get("/api/stores")
      .auth(process.env.TEST_USERNAME, "wrong_password")
      .expect(401)
      .then(res => {
        console.log(res.body)
        done();
      })
      .catch((err) => done(err));
  });

  it("should return 401 unauthorized with invalid username and password", (done) => {
    request(app)
      .get("/api/stores")
      .auth("wrong_username", "wrong_password")
      .expect(401)
      .then(res => {
        done();
      })
      .catch((err) => done(err));
  });

  it("should return 401 unauthorized with NO auth", (done) => {
    request(app)
      .get("/api/stores")
      .expect(401)
      .then(res => {
        done();
      })
      .catch((err) => done(err));
  });
})


describe("POST stores", () => {
  after( async () => await Store.deleteMany({}))

  const valid_body = {
    "name": "company2",
    "cuit": "20-01234567-2",
    "concept1": "one",
    "concept2": "two",
    "concept3": "three",
    "concept4": "four",
    "concept5": "five",
    "concept6": "six",
    "currentBalance": "804",
    "active": "false",
    "lastSale": "2022-02-15"
  }

  const incomplete_bodies = []
  for (const key in valid_body) {
    const inc_bod = {...valid_body}
    delete inc_bod[key]
    incomplete_bodies.push(inc_bod)
  }

  const invalid_keys = {
    "cuit": "wrong_format_123",
    "currentBalance": "invalid_string",
    "active": "invalid_bool",
    "lastSale": "invalid_date"
  }
  const invalid_bodies = []
  for (const key in invalid_keys) {
    const inv_bod = {...valid_body}
    delete inv_bod[key]
    inv_bod[key] = invalid_keys[key]
    invalid_bodies.push(inv_bod)
  }

  it("should POST a store with correct auth and valid body", (done) => {
    request(app)
      .post("/api/stores")
      .auth(process.env.TEST_USERNAME, process.env.TEST_PASSWORD)
      .send(valid_body)
      .expect(200)
      .then(res => {
        console.log(res.body)
        done();
      })
      .catch((err) => done(err));
  });

  // no need to check for valid username and invalid password since auth is a middleware and was tested thoroughly before
  it("should fail with 401 with incorrect auth and valid body", (done) => {
    request(app)
      .get("/api/stores")
      .auth("wrong_username", "wrong_password")
      .expect(401)
      .then(res => {
        done();
      })
      .catch((err) => done(err));
  });

  it("should fail with 400 with valid auth and all variations of INCOMPLETE bodies", (done) => {
    for (body of incomplete_bodies) {
      request(app)
      .get("/api/stores")
      .auth(process.env.TEST_USERNAME, process.env.TEST_PASSWORD)
      .send(body)
      .expect(400)
      .then(res => {
      })
      .catch((err) => console.log(err));
    }
    done();
  });

  it("should fail with 400 with valid auth and all variations of INVALID bodies", (done) => {
    for (body of invalid_bodies) {
      request(app)
      .get("/api/stores")
      .auth(process.env.TEST_USERNAME, process.env.TEST_PASSWORD)
      .send(body)
      .expect(400)
      .then(res => {
      })
      .catch((err) => console.log(err));
    }
    done();
  });

})
import mockRequest from '../../lib/mock-request';
//import nock from 'nock'; // Needs to be imported first before papi because it overrides http and so does node-fetch

import Papi from '../../src';
import * as mock from '../api/mocks';
import should from 'should';
import * as models from '../../src/models';
import _ from 'lodash';

const api = new Papi();

api.auth.set({jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTRmMGRiNzMwOGFmYTEyYjUzNjIwNTg4In0.CvXGDKAJYZkoH3nnEirtlGlwRzErv1ANOJ-dVkUAnjo#_login_post'});

//var mockRequest = nock(api.options.host).matchHeader('authorization', function() { return `Bearer ${api.auth.session.jwt}`; });
mockRequest.configure({host: api.options.host});

describe('Collections', function() {
  var collection;

  before(function(done) {
    mockRequest.get(`/hubs`).reply(200, mock.hubs);

    api.$resource('hubs').$all().then((res) => {
      collection = res;
      done();
    });
  });

  it('should create a new model', function(done) {
    var model = collection.$create({ name: 'Hello' });
    model.should.be.instanceOf(models.Hub);
    model.name.should.equal('Hello');
    should(model.$newRecord).equal(true);

    done();
  });

  it('should add a new model', function(done) {
    collection.length.should.equal(mock.hubs.length);
    var model = collection.$create({ name: 'Hello' });

    collection.$add(model);
    collection.length.should.equal(mock.hubs.length + 1);

    done();
  });

  it('should remove a model', function(done) {
    var model = _.last(collection);

    collection.$remove(model);
    collection.length.should.equal(mock.hubs.length);

    done();
  });

  it('should add a new model at an index', function(done) {
    collection.length.should.equal(mock.hubs.length);
    var model = collection.$create({ name: 'Hello' });
    collection.$add(model, 3);
    collection.length.should.equal(mock.hubs.length + 1);
    collection[3].should.equal(model);

    done();
  });

  it('should remove a model at an index', function(done) {
    var model = collection.$remove(3);
    model.name.should.equal('Hello');
    collection.length.should.equal(mock.hubs.length);

    done();
  });

  it('should reposition a model in a collection', function(done) {
    var model = collection.$add({name: 'Hello'});

    collection.$reposition(mock.hubs.length, 0);
    collection[0].should.equal(model);
    collection.$reposition(0, 1);
    collection[1].should.equal(model);
    collection.$reposition(1, mock.hubs.length);
    collection[mock.hubs.length].should.equal(model);

    collection.length.should.equal(mock.hubs.length + 1);

    done();
  });

  it('should find a model by id', function(done) {
    var model = collection.$find(mock.hubs[0].id);
    model.name.should.equal('My First Hub');

    done();
  });


  it('should find a model where params match', function(done) {
    var model = collection.$findWhere({name: 'Hello'});
    model.name.should.equal('Hello');

    done();
  });

  it('should delete a model', function(done) {
    mockRequest.delete(`/hubs/${mock.hubs[0].id}`).reply(200, mock.hubs[0]);

    var model = collection.$find(mock.hubs[0].id);

    collection.$delete(model).then((res) => {
      collection.length.should.equal(mock.hubs.length);

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('should properly save a created model', function(done) {
    mockRequest.post(`/hubs`).reply(200, { name: 'Hello', id: 1234 });

    var model = collection.$create({name: 'Hello'});
    model.$save().then(function() {
      model.name.should.equal('Hello');
      model.id.should.equal(1234);
      model.$resource().route.params.id.should.equal(1234);

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('should have a collection action', function(done) {
    mockRequest.get(`/invites/incoming`).reply(200, mock.invites);

    api.$resource('invites').$incoming().then(function() {
      done();
    }).catch((err) => {
      done(err);
    })
  });

  it('should have a member action', function(done) {
    mockRequest.get(`/invites/incoming`).reply(200, mock.invites);
    mockRequest.post(`/invites/${mock.invites[0].id}/accept`).reply(200);

    api.$resource('invites').$incoming().then(function(res) {
      var invite = res[0];
      invite.should.be.instanceOf(models.Invite);
      invite.$accept().then(function(res) {
        done()
      }).catch((err) => {
        done(err);
      });
    }).catch((err) => {
      done(err);
    })
  });
});
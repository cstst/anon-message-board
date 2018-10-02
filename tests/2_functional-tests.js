/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function(done) {
      chai.request(server)
        .post('/api/threads/monkeys')
        .send({
          text: 'I like monkeys',
          delete_password: 'monkey man'
        })
        .end(function(err, res){
          assert.equal(res.status, 302);
          done();
        });  
    });
    
    suite('GET', function(done) {
      chai.request(server)
        .get('/api/threads/monkeys')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });   
    });
    
    suite('DELETE', function(done) {
      chai.request(server)
        .delete('/api/threads/monkeys')
        .send({
          thread_id: '5bb305a223140f1e1752f512 ',
          delete_password: '123'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isEqual(res.body, 'thread deleted');
          done();
        });   
    });
    
    suite('PUT', function(done) {
      chai.request(server)
        .put('/api/threads/monkeys')
        .send({
          thread_id: "5bb3024c78666a0b4abdde6a"
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isEqual(res.body, 'thread reported');
          done();
        });    
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function(done) {
      chai.request(server)
        .post('/api/replies/monkeys')
        .send({
          text: 'I do too',
          thread_id: "5bb3024c78666a0b4abdde6a",
          delete_password: 'monkey person'
        })
        .end(function(err, res){
          assert.equal(res.status, 302);
          done();
        });    
    });
    
    suite('GET', function(done) {
      chai.request(server)
        .get('/api/replies/monkeys?thread_id=5bb3024c78666a0b4abdde6a')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.isEqual(res.body._id, "5bb3024c78666a0b4abdde6a")
          assert.isArray(res.body.replies);
          done();
        });  
    });
    
    suite('PUT', function(done) {
      chai.request(server)
        .put('/api/replies/monkeys')
        .send({
          thread_id: '5bb3024c78666a0b4abdde6a',
          reply_id: "5bb302f97380f10d0b8f5c9d",
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isEqual(res.body, 'post reported');
          done();
        });   
    });
    
    suite('DELETE', function(done) {
      chai.request(server)
        .delete('/api/replies/monkeys')
        .send({
          thread_id: '5bb30608db994821d47fcbd3',
          reply_id: "5bb30614db994821d47fcbd4",
          delete_password: '321'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isEqual(res.body, 'post deleted');
          done();
        });   
    });
    
  });

});

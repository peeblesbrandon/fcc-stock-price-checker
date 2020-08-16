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
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.stock, 'GOOG', 'expected ticker for Google');
          assert.isNumber(res.body.price, 'price should be a number');
          assert.isAtLeast(res.body.likes, 0, 'likes should be at least 0')
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: 'dis', like: 'true'})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.stock, 'DIS');
            assert.isNumber(res.body.price);
            assert.isAtLeast(res.body.likes, 1);
            done();
          });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: 'dis', like: 'true'})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.stock, 'DIS');
            assert.isNumber(res.body.price);
            assert.isAtLeast(res.body.likes, 1);
            done();
          });
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: ['goog', 'aapl'], like: 'false' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.equal(res.body[0].stock, 'GOOG');
            done();
          });
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: ['uber', 'grub'], like: 'true' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.equal(res.body[0].stock, 'UBER');
            assert.isNumber(res.body[1].rel_likes);
            done();
          });
      });
      
    });

});

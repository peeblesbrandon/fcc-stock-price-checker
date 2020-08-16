/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb');
const mongoose = require('mongoose');
const axios = require('axios');
const Like = require('../models/Like.js');

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

// routing
module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async (req, res) => {
      // standardize ticker
      // console.log('new request from ip:', req.ip, '\n', req.query);
      // console.log('new request:\n', req);
      
      try {
        if (!Array.isArray(req.query.stock)) {               // single stock
          
          const ticker = req.query.stock.toUpperCase();
          const quote = await getQuote(req, ticker);
          const likeCount = await getLikes(req, ticker);
          return res.status(200).json({ stock: ticker, price: quote.data.latestPrice, likes: likeCount});
          
        } else {                                                // two stocks
          
          const ticker1 = req.query.stock[0].toUpperCase();
          const ticker2 = req.query.stock[1].toUpperCase();
          
          const quote1 = await getQuote(req, ticker1);
          const quote2 = await getQuote(req, ticker2);
          
          const likeCount1 = await getLikes(req, ticker1);
          const likeCount2 = await getLikes(req, ticker2);
          
          const stockData1 = { stock: ticker1, price: quote1.data.latestPrice, rel_likes: likeCount1 - likeCount2 }
          const stockData2 = { stock: ticker2, price: quote2.data.latestPrice, rel_likes: likeCount2 - likeCount1 }
      
          return res.status(200).json([stockData1, stockData2]);
          
        }
      } catch (err) {
        return res.status(500).json({error: 'Could not fetch stock data for ' + req.query.stock, errorDescription: err});
      }
    
    });
  
};


// helper functions
async function getQuote(req, ticker) {  
  const url = `https://cloud.iexapis.com/stable/stock/${ticker}/quote?token=${process.env.SECRET}`;
  try {
    return axios.get(url);
  } catch {
    throw 'failed to get quote';
  }
}

async function getLikes(req, ticker) {
  const requesterIP = req.ip;
  // get the current likes
  const queryLikes = async (ticker) => {
    try { 
      return await Like.find({ ticker: ticker }); 
    } catch (err) {
      console.log(err);
      throw 'failed to query likes';
    }
  }
  const likes = await queryLikes(ticker);
  
  // check if the requesters IP has already liked the stock
  let containsIP = false;
  likes.find((doc) => {
    if (doc.ip == requesterIP) { 
      containsIP = true; 
      return;
    } else { 
      containsIP = false; 
      return;
    }
  });
  
  // insert new like if allowed
  if (req.query.like == 'true' && containsIP == false) {
    const newLike = new Like({
      ticker: ticker,
      ip: requesterIP
    });
    try {
      console.log('saving new like...')
      await newLike.save();
    } catch (err) {
      console.log(err);
      throw 'failed to save new like';
    }
  }
  
  // return the count of the initial query + new like (if one was added) 
  if (req.query.like == 'true' && containsIP == false) {
    return likes.length + 1;
  } else {
    return likes.length;
  }
}


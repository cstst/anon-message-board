/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const Controller = require('../controllers/controller.js');

module.exports = (app, db) => {
  
  const controller = new Controller(db);
  const { postThread, 
          postReply, 
          getRecentThreads, 
          getThread, 
          deleteThread, 
          deleteReply, 
          reportThread, 
          reportReply } = controller;
  
  app.route('/api/threads/:board')
    .post(postThread)
    .get(getRecentThreads)
    .delete(deleteThread)
    .put(reportThread);
    
  app.route('/api/replies/:board')
    .post(postReply)
    .get(getThread)
    .delete(deleteReply)
    .put(reportReply);

};

const ObjectID = require('mongodb').ObjectID;
const bcrypt   = require('bcrypt'); 

module.exports = function(db) {
  
  this.postThread = async (req, res) => {
    const { board, text, delete_password } = req.body;
    try {
      
      const hashed_delete_password = await bcrypt.hash(delete_password, 12);
      const posting = await db.collection(board).insertOne({
        text, 
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        delete_password: hashed_delete_password,
        replies: []
      });
      res.redirect("/b/" + board);
    } catch(err) {
      console.log(err);
      res.send('Database error');
    }
  }
  
  this.postReply = async (req, res) => {
    const { board, thread_id, text, delete_password } = req.body;
    try {
      const hashed_delete_password = await bcrypt.hash(delete_password, 12);
      const _idMatchAndUpdate = await db.collection(board).findAndModify(
        {_id: ObjectID(thread_id)},
        [["_id", 1]],
        { 
          "$push": {
            "replies": {
              _id: ObjectID(),
              text, 
              created_on: new Date(),
              reported: false,
              delete_password: hashed_delete_password
            }
          },
          "$set": {
            bumped_on: new Date()
          }
        },
        { new: true }
      );
      if (!_idMatchAndUpdate.value) {
        res.send('incorrect _id');
      } else {
        res.redirect("/b/" + board + "/" + thread_id);
      }
    } catch(err) {
      console.log(err);
      res.send('Database error');
    }
  }
  
  this.getRecentThreads = async (req, res) => {
    const board = req.params.board;
    try {
      const threads = await db.collection(board)
        .find({}, {reported: 0, delete_password: 0})
        .sort({bumped_on: -1})
        .limit(10)
        .toArray();
      const newThreads = threads.map(thread => {
        const newReplies = thread.replies.map(reply => {
          delete reply.reported;
          delete reply.delete_password;
          return reply;
        });
        thread.hiddenReplies = thread.replies.length > 3 ?  thread.replies.length - 3 : 0;
        thread.replies = newReplies.slice(newReplies.length - 3);
        return thread;
      });
      res.json(newThreads);
    } catch(err) {
      console.log(err);
      res.send('Database error');
    }
  }
  
  this.getThread = async (req, res) => {
    const board = req.params.board;
    const thread_id = req.query.thread_id;
    try {
      const thread = await db.collection(board).findOne({_id: ObjectID(thread_id)}, {reported: 0, delete_password: 0});
      if (!thread) {
        res.send("incorrect _id");
      } else {
        const newReplies = thread.replies.map(reply => {
          delete reply.reported;
          delete reply.delete_password;
          return reply;
        });
        const newThread = {
          ...thread, 
          replies: newReplies
        }
        res.json(newThread);
      }
    } catch(err) {
      console.log(err);
      res.send('Database error');
    }

  }
  
  this.deleteThread = async (req, res) => {
    const { board, thread_id, delete_password } = req.body;
    try {
      const _idMatch = await db.collection(board).findOne({_id: ObjectID(thread_id)});
      console.log(_idMatch);
      if (!_idMatch) {
          res.send('incorrect _id');
      } else {
        const passwordCorrect = await bcrypt.compare(delete_password, _idMatch.delete_password);
        if (!passwordCorrect) {
          res.send('incorrect password');
        } else {
          const deletion = await db.collection(board).deleteOne({_id: ObjectID(thread_id)});
          console.log(deletion);
          res.send('thread deleted');
        }
      }
    } catch(err) {
      console.log(err);
      res.send('Database error');
    }
  }
  
  this.deleteReply = async (req, res) => {
    const { board, thread_id, reply_id, delete_password } = req.body;
    try {
      const _idMatch = await db.collection(board).findOne(
        {
          "_id": ObjectID(thread_id),
          "replies._id": ObjectID(reply_id) 
        },
        {
          "replies": { 
            "$elemMatch": { 
              "_id": ObjectID(reply_id) 
            }
          }
        }
      );
      if (!_idMatch) {
        res.send("incorrect _id");
      } else {
        const passwordCorrect = await bcrypt.compare(delete_password, _idMatch.replies[0].delete_password);
        if (!passwordCorrect) {
          res.send('incorrect password');
        } else {
          const deletion = await db.collection(board).findAndModify(
            {
              "_id": ObjectID(thread_id),
              "replies": { 
                "$elemMatch": {
                  "_id": ObjectID(reply_id)
                }
              }
            },
            [["_id", 1]],
            { "$set": { "replies.$.text": "[deleteted]" } },
            { "new": true }
          );  
          console.log(deletion);
          res.send('post deleted');
        }
      }     
    } catch(err) {
      console.log(err);
      res.send('Database error');
    }
  }
  
  this.reportThread = async (req, res) => {
    const { board, report_id } = req.body;
    try {  
      const _idMatchAndReport = await db.collection(board).findAndModify(
        {"_id": ObjectID(report_id)},
        [["_id", 1]],
        { "$set": { "reported": true } },
        { "new": true }
      );  
      if (!_idMatchAndReport.value) {
        res.send('incorrect _id');
      } else {
        res.send('thread reported');
      }
    } catch(err) {
      console.log(err);
      res.send('Database error');
    }
  }
  
  this.reportReply = async (req, res) => {
    const { board, thread_id, reply_id } = req.body;
    try {
      const _idMatchAndReport = await db.collection(board).findAndModify(
          {
            "_id": ObjectID(thread_id),
            "replies": { 
              "$elemMatch": {
                "_id": ObjectID(reply_id)
              }
            }
          },
          [["_id", 1]],
          { "$set": { "replies.$.reported": true } },
          { "new": true }
      );
      if (!_idMatchAndReport.value) {
        res.send('incorrect _id');
      } else {
        res.send('post reported');
      }
    } catch(err) {
      console.log(err);
      res.send('Database error');
    }
  }
}
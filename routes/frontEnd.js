module.exports = (app) => {
  app.route('/b/:board/')
    .get((req, res) => {
      res.sendFile(process.cwd() + '/views/board.html');
    });
  app.route('/b/:board/:threadid')
    .get((req, res) => {
      res.sendFile(process.cwd() + '/views/thread.html');
    });
    
  //Index page (static HTML)
  app.route('/')
    .get((req, res) => {
      res.sendFile(process.cwd() + '/views/index.html');
    });
}
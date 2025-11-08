const http = require('http');

setInterval(() => {
  http.get('https://yourbotname.username.repl.co');
}, 280000); // pings every 4 minutes 40 seconds

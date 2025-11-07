const fs = require('fs');
const path = './media/';

fs.readdir(path, (err, files) => {
  if (err) throw err;
  files.forEach(file => {
    const filePath = path + file;
    fs.stat(filePath, (err, stats) => {
      if (err) throw err;
      const now = new Date().getTime();
      const endTime = new Date(stats.mtime).getTime() + 2*24*60*60*1000; // 2 days
      if (now > endTime) fs.unlink(filePath, () => console.log(`${file} deleted`));
    });
  });
});

# How to Deploy into the VM

1. Ensure that your `src/database/db.config.js` is configured to your target database
2. Copy files over to the VM using whichever method (SCP, RSYNC, SFTP, etc)
   Example:
   ```
   rsync [options] SRC USER@HOST:DEST
   rsync --progress -avh --exclude="node_modules" * VMadmin@172.21.148.168:~/Documents/game-sever/
   ```
3. SSH into the VM
   ```
   ssh VMadmin@172.21.148.168
   ```
4. Inside the VM, `cd` to the directory you copied the files over to
   ```
   cd ~/Downloads/game-server/
   ```
5. We will be using [PM2 Process Manager](https://pm2.io) to maintain and manage our Node.js applications. <br>
   To install:
   ```
   npm install -g pm2
   ```
6. To start our application with PM2
   ```
   pm2 start src/index.js
   ``` 
   This is because our entrypoint of our application is `src/index.js`
7. To view all process running with PM2
   ```
   pm2 list
   ```
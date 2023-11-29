Database Group project - Art Gallery

This repository contains both frontend and backend code.

To run this app:

#1 For database connection, create .env file on root folder.
Then, add these:

```
DATABASE_USER="your database username"
DATABASE_PASSWORD="your database password"
DATABASE_CONNECTSTRING="database connection string for eg: oracle1.centennialcollege.ca or IP address."
```

#2 To run in localhost

- Open terminal/command prompt
- Navigate to the directory where you have downloaded the repo (eg: cd /Users/username/Desktop/artgallery)
- Run `npm install` command to download all dependencies
- Then run `node artGalleryScript.js` command to start the application
- visit `localhost:3000`

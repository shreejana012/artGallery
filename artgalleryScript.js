const oracledb = require('oracledb');
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
var bodyParser = require('body-parser');
require('dotenv').config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const app = express();
const port = 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Configure Handlebars
const hbs = exphbs.create({
  extname: '.hbs', // Set the extension name
  defaultLayout: 'main', // Set the default layout
});


app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

async function getConnection () {
  try {
    const connection = await oracledb.getConnection({
      user: process.env.DATABASE_USER, // eg: your database username COMP214_F34_zo_30000
      password: process.env.DATABASE_PASSWORD, // eg: your database password
      connectString: process.env.DATABASE_CONNECTSTRING, // eg: oracle1.centennialcollege.ca or ip address.
    });

    console.log('Connected to database');
    return connection;
  } catch (err) {
    console.error('Error connecting to database: ', err);
    throw err;
  }
}


async function selectAllArtists (req, res) {
  let connection = "";

  try {
    connection = await getConnection();

    console.log('connected to database');
    result = await connection.execute("SELECT * FROM artists");

  } catch (err) {
    return res.send(err.message);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('close connection success');
      } catch (err) {
        console.error(err.message);
      }
    }
    if (result.rows.length == 0) {
      return res.send('query send no rows');
    } else {
      return res.render('artistCard', { layout: 'main', artists: result.rows });
    }
  }
}

app.get('/', function (req, res) {
  selectAllArtists(req, res)
})

async function getAllExhibitions (req, res) {
  let connection = "";
  let result = null;
  try {
    connection = await getConnection();

    console.log('connected to database');
    result = await connection.execute("SELECT * FROM Exhibitions");
  } catch (err) {
    return res.send(err.message);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('close connection success');
      } catch (err) {
        console.error(err.message);
      }
    }
    console.log("Result", result);
    if (result && result.rows.length === 0) {

      return res.send('query send no rows');
    } else {
      return res.render('exhibitionsPage', { layout: 'main', exhibitions: result?.rows });
    }
  }
}

app.get('/exhibitions', function (req, res) {
  getAllExhibitions(req, res)
})

async function selectArtistById (req, res, id) {
  let connection = "";
  try {
    connection = await getConnection();

    let query = `SELECT * FROM Artworks where ArtistID=${id}`;
    result = await connection.execute(query);

  } catch (err) {
    return res.send(err.message);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        return console.error(err.message);
      }
    }
    if (result.rows.length == 0) {
      return res.render('artworkCard', { layout: 'main', artworks: [], message: 'No artworks found for this artist' });
    } else {
      return res.render('artworkCard', { layout: 'main', artworks: result.rows });
    }
  }
}

app.get('/artists/:id', function (req, res) {
  let id = req.params.id;
  // id param if it is number
  if (isNaN(id)) {
    res.send('Query param id is not number')
    return
  }
  selectArtistById(req, res, id);
})

async function saveArtist (req, res) {
  let connection = "";
  let params = req.body;
  let result = null

  try {
    connection = await getConnection();

    let query = `INSERT INTO Artists (ArtistID, Name, BirthDate, Nationality, Biography) 
                  VALUES (artist_seq.NEXTVAL, :name, TO_DATE(:birthdate, 'YYYY-MM-DD'), :nationality, :biography)`;

    await connection.execute(query, [params.name, params.birthdate, params.nationality, params.biography], { autoCommit: true });

    result = await connection.execute("SELECT * FROM artists");

  } catch (err) {
    console.error(err)
    return res.send(err.message);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        return console.error(err.message);
      }
    }
    if (result && result.rows?.length == 0) {
      return res.send('Not found');
    } else {
      return res.render('artistCard', { layout: 'main', artists: result?.rows });
    }
  }
}

app.post('/', function (req, res) {
  saveArtist(req, res)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


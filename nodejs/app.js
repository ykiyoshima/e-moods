import express from "express";
import path from "path";
import cors from "cors";
import bcrypt from "bcrypt";
import flash from "connect-flash";
import knex from "knex";
import knexfile from "./knexfile.js";
import session from "express-session";
import passport from "passport";
import local from "passport-local";
import axios from "axios";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { FaceClient } from "@azure/cognitiveservices-face";
import { CognitiveServicesCredentials } from "@azure/ms-rest-azure-js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { google } from "googleapis";


dotenv.config();

const faceKey = process.env.FACE_KEY; //個人のKey
const faceEndPoint = process.env.FACE_ENDPOINT; //個人のEndPoint
const cognitiveServiceCredentials = new CognitiveServicesCredentials(faceKey);
const faceClient = new FaceClient(cognitiveServiceCredentials, faceEndPoint);

async function sendMail(email, link) {

}

const app = express();
app.set("trust proxy", 1);

let tmpUsername, tmpEmail, tmpPassword, tmpRepassword, tmpToken;

const corsOptions = {
  origin: 'https://e-moods.herokuapp.com',
  credentials: true,
};

const __dirname = path.resolve();

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, './react/build')));
app.use(flash());

const sess = {
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
  resave: true,
  saveUninitialized: true,
}

app.use(session(sess));
app.set('port', (process.env.PORT || 80));

const myknex = knex(knexfile['development']);

const LocalStrategy = local.Strategy;

passport.use(new LocalStrategy(
  {usernameField:"email", passwordField:"password", includeEmail: true},
  function (email, password, done) {
  try {
    myknex('users')
      .select('*')
      .where({ 'email': email })
      .then(async (user) => {
        console.log(user);
        if (user.length === 0) {
          return done(null, false, { message: '入力された情報が正しくありません'});
        }
        if (! await bcrypt.compare(password, user[0].password)) {
          return done(null, false, { message: '入力された情報が正しくありません'});
        }
        return done(null, user);
      });
  } catch (err) {
    return done(err);
  }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user[0].email);
});

passport.deserializeUser(function(email, done) {
  myknex('users')
    .select('*')
    .where({ 'email': email })
    .then((user) => {
      if (user) {
        done(null, user);
      }
    });
});

app.post('/signup_confirm', (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
  }
  const { email } = req.body;

  myknex('users')
    .select('*')
    .where({ 'email': email })
    .then(async (result) => {
      if (result.length !== 0) {
        res.send({ message: 'このメールアドレスは既に使われています' });
      } else {
        const token = crypto.randomBytes(16).toString('hex');
        myknex('tokens')
          .insert({ 'email': email, 'token': token, 'created_at': new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000)) })
          .then(async (result) => {
            const link = `https://e-moods.herokuapp.com/verify?token=${token}`;

            const CLIENT_ID = process.env.EMAIL_CLIENT_ID;
            const CLIENT_SECRET = process.env.EMAIL_CLIENT_SECRET;
            const REDIRECT_URI = process.env.EMAIL_REDIRECT_URI;
            const REFRESH_TOKEN = process.env.EMAIL_REFRESH_TOKEN;
            const CLIENT_EMAIL = process.env.EMAIL;
            const OAuth2Client = new google.auth.OAuth2(
              CLIENT_ID,
              CLIENT_SECRET,
              REDIRECT_URI
            );

            OAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
            try {
              // Generate the accessToken on the fly
              const accessToken = await OAuth2Client.getAccessToken();

              // Create the email envelope (transport)
              const transport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  type: 'OAuth2',
                  user: CLIENT_EMAIL,
                  clientId: CLIENT_ID,
                  clientSecret: CLIENT_SECRET,
                  refreshToken: REFRESH_TOKEN,
                  accessToken: accessToken,
                },
              });

              // Create the email options and body
              // ('email': user's email and 'name': is the e-book the user wants to receive)
              const mailOptions = {
                from: `e-moods <${CLIENT_EMAIL}>`,
                to: `e-moods <${email}>`,
                subject: `メールアドレスの確認 by e-moods`,
                html: `<p>以下のリンクをクリックしてe-moodsへの新規登録を完了してください</p><p><a href="${link}">${link}</a></p>`
              };

              // Set up the email options and delivering it
              transport.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.error(error);
                } else {
                  console.log(`Email sent: ${info.response}`);
                  res.send({ 'status': 'OK' });
                }
              });

            } catch (error) {
              console.log(error);
              res.send({ 'status': 'NG', 'message': error });
            }
          })
          .catch(err => console.log(err));
      }
    })
    .catch((err) => {
      console.error(err);
      res.json({message: [err.sqlMessage]});
    });
});

app.post('/regist', (req, res) => {
  const { username, password, token } = req.body;
  myknex('tokens')
    .select('*')
    .then(async (result) => {
      const targetEmail = await result.find(value => token === value.token).email;
      const hashedPassword = await bcrypt.hash(password, 10);
      myknex('users')
        .insert({ 'username': username, 'email': targetEmail, 'password': hashedPassword, 'created_at': new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000)), 'updated_at': new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000)) })
        .then(() => {
          res.send({ status: 'OK' });
        })
        .catch(err => {
          console.log(err);
          res.send({ status: 'NG', message: 'DB error' });
        });
    })
    .catch(err => {
      console.log(err);
      res.send({ status: 'NG', message: 'Token error' });
    });

  });

app.post('/favorite', (req, res) => {
  const { ids } = req.body;
  console.log(ids);

  myknex('users')
    .select('*')
    .where({ 'email': req.user[0].email })
    .update({ 'favorite_id_1': ids[0], 'favorite_id_2': ids[1], 'favorite_id_3': ids[2], 'favorite_id_4': ids[3], 'favorite_id_5': ids[4], 'updated_at': new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000)) })
    .then(() => {
      req.session.favorite = true;
      res.send({ status: 'OK' });
    });
});

app.get('/first_get_token', async (req, res) => {
  const { code } = req.query;
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', 'https://e-moods.herokuapp.com/first_get_token');
  const response = await axios.post('https://accounts.spotify.com/api/token',
    params,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.CLIENT_ID}:${process.env.SECRET_ID}`, 'utf-8').toString('base64')}`
      }
    }
  );
  req.session.accessToken = response.data.access_token;
  req.session.tokenGetTime = Date.now();
  res.redirect('/setting');
});

app.get('/token', (req, res) => {
  console.log(req.session);
  res.send(req.session);
});

app.post('/login_confirm', passport.authenticate('local',
  { successRedirect: '/success', failureRedirect: '/failure', failureFlash: true }
));

app.get('/success', (req, res) => {
  myknex('users')
    .select('*')
    .where({ 'email': req.user[0].email })
    .then(response => {
      if (response[0].favorite_id_5) {
        res.send({ status: 'OK' });
      } else {
        res.send({ status: 'NG' });
      }
    });
});

app.get('/failure', (req, res) => {
  res.send({ message: req.flash('error') });
});


app.get('/index', (req, res) => {
  if (req.user) {
    res.send({ 'hasSession': 'Yes', 'username': req.user[0].username, 'favorite_id_1': req.user[0].favorite_id_1, 'favorite_id_2': req.user[0].favorite_id_2, 'favorite_id_3': req.user[0].favorite_id_3, 'favorite_id_4': req.user[0].favorite_id_4, 'favorite_id_5': req.user[0].favorite_id_5 });
  } else {
    res.send({ 'hasSession': 'No' });
  }
});

app.get('/get_token', async (req, res) => {
  const { code } = req.query;
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', 'https://e-moods.herokuapp.com/get_token');
  const response = await axios.post('https://accounts.spotify.com/api/token',
    params,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.CLIENT_ID}:${process.env.SECRET_ID}`, 'utf-8').toString('base64')}`
      }
    }
  );
  req.session.accessToken = response.data.access_token;
  req.session.tokenGetTime = Date.now();
  res.redirect('/');
});

app.post('/analysis', (req, res) => {
  const main = async () => {
    const image_data = req.files.file.data;
    faceClient.face.detectWithStream(image_data, {
      returnFaceAttributes: ['Emotion'],
      detectionModel: 'detection_01'
    }).then(response => {
      res.send(response[0].faceAttributes.emotion)
    }).catch(err => {
      console.log(err);
      res.send({ 'error': err });
    });
  };

  main().catch((err) => console.error("Error running sample:", err.message));

});

app.get('/emotions', (req, res) => {
  res.send(req.session.results);
});

app.post('/emotions', (req, res) => {
  req.session.results = req.body;
  res.end();
});

app.get('/tracks', (req, res) => {
  if (req.session.tracks) {
    res.send(req.session.tracks);
  } else {
    res.end();
  }
});

app.post('/tracks', (req, res) => {
  req.session.tracks = req.body;
  res.end();
});

app.get('/insert_emotions_and_tracks', (req, res) => {
  const { anger, contempt, disgust, fear, happiness, neutral, sadness, surprise } = req.session.results;
  const tracks = req.session.tracks;
  myknex('emotions_and_tracks')
    .insert({ 'user_id': req.user[0].id, 'anger': anger, 'contempt': contempt, 'disgust': disgust, 'fear': fear, 'neutral': neutral, 'happiness': happiness, 'sadness': sadness, 'surprise': surprise, 'track_id1': tracks[0], 'track_id2': tracks[1], 'track_id3': tracks[2], 'created_at': new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000)), 'updated_at': new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000)) })
    .then(() => {
      console.log('Data was created successfully!');
      res.end();
    })
    .catch(err => console.log(err));
});

app.get('/playlist', (req, res) => {
  res.send({ playlistId: req.session.playlist });
});

app.post('/playlist', (req, res) => {
  const { id } = req.body;
  req.session.playlist = id;
  res.end();
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname,'./react/build/index.html'));
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
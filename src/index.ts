import 'dotenv/config';

import express from 'express';
import mongoose, { ObjectId } from 'mongoose';
import bodyParser from 'body-parser';
import session from 'express-session';

import MainRouter from './routes';
import GuildRouter from './routes/guild';
import ScheduleRouter from './routes/guild/schedule';

declare module 'express-session' {
    interface SessionData {
        flag?: number
    }
}

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET!
}));

app.use('/', MainRouter);
app.use('/guild', GuildRouter);
app.use('/guild/:id/schedule', ScheduleRouter);

app.use(express.static(__dirname + "/../public"));

mongoose.connect(process.env.MONGODB_URI!).then(() => {
    console.log("Connected to MongoDB.");

    app.listen(3000, () => {
        console.log("Server started on port 3000.");
    });
}).catch(error => console.error(error));

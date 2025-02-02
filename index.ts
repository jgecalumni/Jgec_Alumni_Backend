import express from 'express';
import dotenv from 'dotenv'
import cors from "cors"
import cookieParser from 'cookie-parser';

dotenv.config()
const app = express();
const port = process.env.PORT || 8000

// router imports
import AuthRoute from './router/auth.route'
import ScholarshipRoute from './router/scholarship.route'
import NoticeRoute from './router/notice.route';
import { allCounts } from './controller/count.controller';
import authentication from './middleware/authentication';

// configure middlewares
app.use(cookieParser());
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(cors({
    origin: [process.env.FORNTEND_URI_DEV as string, process.env.FORNTEND_URI_PROD as string],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}))

// declare routes
app.get('/', (req, res) => {
    res.send('Hello World updated!')
})

// routes 
app.use('/v1/api/auth/member', AuthRoute);
app.use('/v1/api/scholarships', ScholarshipRoute);
app.use('/v1/api/notice', NoticeRoute);
app.use('/v1/api/all-count', authentication, allCounts);

app.listen(port, () => console.log('🚀[Server]: listening on port ' + port));
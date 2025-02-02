"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
// router imports
const auth_route_1 = __importDefault(require("./router/auth.route"));
const scholarship_route_1 = __importDefault(require("./router/scholarship.route"));
const notice_route_1 = __importDefault(require("./router/notice.route"));
const count_controller_1 = require("./controller/count.controller");
const authentication_1 = __importDefault(require("./middleware/authentication"));
// configure middlewares
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '16kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '16kb' }));
app.use((0, cors_1.default)({
    origin: [process.env.FORNTEND_URI_DEV, process.env.FORNTEND_URI_PROD],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}));
// declare routes
app.get('/', (req, res) => {
    res.send('Hello World');
});
// routes 
app.use('/v1/api/auth/member', auth_route_1.default);
app.use('/v1/api/scholarships', scholarship_route_1.default);
app.use('/v1/api/notice', notice_route_1.default);
app.use('/v1/api/all-count', authentication_1.default, count_controller_1.allCounts);
app.listen(port, () => console.log('🚀[Server]: listening on port ' + port));

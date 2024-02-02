const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const {connectToMongoDB} = require("./connect");
const URL = require("./models/url");
const {checkForAuthentication, restrictTo} = require("./middleware/auth");


const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const userRoute = require("./routes/user");

const app = express();
const PORT = 5001;

// MongoDB Connection
connectToMongoDB("mongodb://127.0.0.1:27017/mydatabase")
.then(()=>console.log("MongoDB connected!")
);

// ejs path
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cookieParser());
app.use(checkForAuthentication);

// Routes
app.use("/url", restrictTo(["NORMAL", "ADMIN"]), urlRoute);
app.use("/user", userRoute);
app.use("/", staticRoute);

app.get("/url/:shortId", async(req, res)=>{
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate({
        shortId
    },
    {
        $push :{
        visitHistory : {
            timestamps : Date.now(),
        }
    },
   }
   );
   res.redirect(entry.redirectURL);
});

app.listen(PORT, ()=>console.log(`Server started at PORT ${PORT}`));
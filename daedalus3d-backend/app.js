const express = require("express");
const session = require("express-session");
const connection = require("./connection")
const app = express();

const sess = {
    secret: 'the secret 445j8f8d1v1s',
    resave: false,
    saveUninitialized: true
};

app.use(session(sess))
app.use(express.json())

// app.get("/gohome", (req, res) => {
//     console.log("eita")
//     return res.redirect("/home");
// })

app.post("/trylogin", (req, res) => {
    console.log("Trying to log with "+req.body.user+" and "+req.body.pass);
    connection.login(req.body.user, req.body.pass).then((result) => {
        if(result >= 0){
            req.session.logged_in = true;
            req.session.user = {id: result,name: req.body.user};
            res.redirect("/home");
        }
    }); 
});

app.post("/tryregister", (req, res) => {
    console.log(req.body)
    console.log("Trying to register "+req.body.user+" and "+req.body.pass);
    connection.register(req.body.user, req.body.pass).then((result) => {
        console.log(result);
        if(result >= 0){
            req.session.logged_in = true;
            req.session.user = {id: result,name: req.body.user};
            res.redirect("/home");
        }
    }); 
});

app.get("/getuser", (req,res) => {
    res.json(req.session.user)
})

app.get("/getproject", (req,res) => {
    connection.get_projects(req.session.user.id).then((data) => {
        res.json(data)
    })
})

app.post("/saveproject", (req,res) => {
    console.log(req.body);
    const project = req.body;
    const fs = require('fs');
    console.log("Saving project "+project.id);
    connection.save_project(project.id,project.name,project.date,req.session.user.id)
    .then(()=>{
        console.log("Saved project "+project.id);
        fs.writeFile("projects/"+project.id.toString(),JSON.stringify(project.data),()=>{});
    });
})

app.post("/lockproject", (req,res) => {
    req.session.project = req.body.id;
    res.redirect("/app");
})

app.get("/loadproject", (req,res) => {
    const id = req.session.project;
    const fs = require('fs');
    fs.readFile("projects/"+id.toString(), 'utf8',(err, data) => {
        console.log("File content:", data);
        res.json({id: id, data: JSON.parse(data)});
    })
})

const PORT = process.env.PORT || 8080;

app.listen(PORT,
    console.log(`Server started on port ${PORT}`)
);
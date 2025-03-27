async function connect() {
    require("dotenv").config()
    const db = require("./db")
    const client = await db.connect()
    return client;
}

async function get_projects(id){
    client = await connect();
    const res = await client.query('SELECT * FROM project WHERE "user" = '+id.toString());
    const data = res.rows;
    await client.release()
    return data
}

async function register(username, password){
    client = await connect();
    const res = await client.query('SELECT * FROM "user" WHERE username = \''+username+'\'');
    if(res.rows.length == 0){
        await client.query('INSERT INTO "user" ("username","password") values (\''+username+'\',\''+password+'\')');
        const newRes = await client.query('SELECT id FROM "user" WHERE username = \''+username+'\' AND password =\''+password+'\'');
        return newRes.rows[0].id
    }
    return -1
}

async function save_project(id, name, date, user){
    client = await connect();
    const res = await client.query('SELECT * FROM "project" WHERE id = \''+id+'\'');
    if(res.rows.length == 0){
        await client.query('INSERT INTO "project" ("id","name","date","user") values (\''+id+'\',\''+name+'\',\''+date+'\','+user+')');
    }else{
        await client.query('update project set "date" = \''+date+'\', "name" = \''+name+'\' where "id" = \''+id+'\'');
    }
}

async function login(username, password){
    client = await connect();
    const res = await client.query('SELECT * FROM "user" WHERE username = \''+username+'\' AND password =\''+password+'\'');
    if(res.rows.length == 1){
        return res.rows[0].id;
    }
}

exports.save_project = save_project;
exports.register = register;
exports.get_projects = get_projects;
exports.login = login;
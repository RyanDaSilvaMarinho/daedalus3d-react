async function connect() {
    if(global.connection)
        return global.connection.connect();

    const { Pool } = require('pg');
    const pool  = new Pool({
        connectionString: process.env.CONNECTION_STRING
    });

    const client = await pool.connect();
    console.log('Criou a Pool de conexões');

    await client.query('CREATE SEQUENCE IF NOT EXISTS public.user_id_seq INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;')
    .then(
        () => {
            client.query('CREATE TABLE IF NOT EXISTS public."user"'+
                '('+
                '    username text COLLATE pg_catalog."default" NOT NULL,'+
                '    password text COLLATE pg_catalog."default" NOT NULL,'+
                '    id integer NOT NULL DEFAULT nextval(\'user_id_seq\'::regclass),'+
                '    CONSTRAINT user_pkey PRIMARY KEY (id)'+
                ')');
        }
    ).then(
        () => {
            client.query('CREATE TABLE IF NOT EXISTS public.project'+
                '('+
                '   "user" integer,'+
                '   id text COLLATE pg_catalog."default",'+
                '  date text COLLATE pg_catalog."default",'+
                'name text COLLATE pg_catalog."default",'+
                'CONSTRAINT "user" FOREIGN KEY ("user")'+
                '    REFERENCES public."user" (id) MATCH SIMPLE'+
                '    ON UPDATE NO ACTION'+
                '    ON DELETE NO ACTION'+
                ')');
        }
    );
    
    client.release();

    global.connection = pool;
    return pool.connect();
}

exports.connect = connect;
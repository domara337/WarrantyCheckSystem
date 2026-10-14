import pg from "pg";
import env from "dotenv";


//to start the env server
env.config();


const db=new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT
})


try{
    await db.connect();
    console.log('connected to the db successfully');

}
catch(err){
    console.error('error connecting to the db',err);
    process.exit(1);
}

export default db;
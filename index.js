const dns = require("node:dns")
dns.setServers(["8.8.8.8", "8.8.4.4"])

const dotenv = require('dotenv')
const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config()

const uri = process.env.MONGODB_URI
const app = express()

const PORT = process.env.PORT
app.use(cors())
app.use(express.json())


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})



async function run() {
    try {
        await client.connect()

        const database = client.db("docAppointment");
        const doctorsCollection = database.collection("doctors");
        const bookingsCollection = database.collection("bookings");


        app.get("/doctors", async (req, res) => {
            const result = await doctorsCollection.find().toArray();
            res.send(result);
        });

        app.get("/doctors/:id", (req, res, next) =>{
            const header = req.headers.authorization
            
            console.log(header)
            next()
            // if(header === "logged in"){
            //     next()
            // }else{
            //     res.status(401).json({message: "Unauthorize"})
            // }
            
        },async (req, res) => {
            const { id } = req.params

            const result = await doctorsCollection.findOne({ _id: new ObjectId(id) })
            res.json(result)
        })

        app.get('/booking/:userId', async (req, res) => {
            const { userId } = req.params
            const result = await bookingsCollection.find({ userId: userId }).toArray()
            res.send(result)
        })

        app.post('/booking', async (req, res) => {
            const bookingData = req.body;
            const result = await bookingsCollection.insertOne(bookingData);
            res.json(result)
        })

        app.delete('/booking/:userId', async (req, res) => {
            const { userId } = req.params
            const result = await bookingsCollection.deleteOne({_id: new ObjectId(userId)})
            res.send(result)
        })

        app.patch('/booking/:id', async (req, res) =>{
            const { id } = req.params
            const updateData = req.body

            const result = await bookingsCollection.updateOne({_id: new ObjectId(id)}, {$set: updateData})
            res.json(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log('pinged your deployment successfully')
    } finally {
        // await client.close()
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running fine !')
})

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`)
})
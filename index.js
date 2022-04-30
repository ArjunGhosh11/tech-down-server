const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

//MIDDLEWARE 
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rsuw0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const itemCollection = client.db('techDown').collection('item');
        console.log('CONNECTED TO MONGODB');

        //Items API
        //GET
        app.get('/item', async (req, res) => {
            const query = {};
            const cursor = itemCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await itemCollection.findOne(query);
            res.send(item);
        });
        //POST
        app.post('/item', async (req, res) => {
            const newItem = req.body;
            console.log('Adding new item', newItem);
            const result = await itemCollection.insertOne(newItem);
            res.send(result);

        });
        //DELETE
        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemCollection.deleteOne(query);
            res.send(result);
        })

        //Update item
        app.put('/item/:id', async (req, res) => {
            const id = req.params.id;
            const updatedItem = req.body;
            // console.log("ID:", id);
            // console.log("item:", updatedItem);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            // console.log(filter);
            // console.log(options);
            const updatedDoc = {
                $set: {
                    quantity: updatedItem.quantity
                }
            };
            console.log(updatedDoc);
            const result = await itemCollection.updateOne(filter, updatedDoc, options);
            console.log(result);
            res.send(result);
        })

    }

    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('RUNNING TECHDOWN SERVER');
});

app.listen(port, () => {
    console.log('LISTENING TO PORT 5000')
})

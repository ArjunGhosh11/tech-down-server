const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
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
        const supplierCollection = client.db('techDown').collection('supplier');
        console.log('CONNECTED TO MONGODB');


        //AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: '1d'
                });
            res.send({ accessToken });
            console.log(accessToken);
        })
        //Supplier API
        //Get
        app.get('/supplier', async (req, res) => {
            const query = {};
            const cursor = supplierCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });
        //Post
        app.post('/supplier', async (req, res) => {
            const newSupplier = req.body;
            console.log('Adding new Supplier', newSupplier);
            const result = await supplierCollection.insertOne(newSupplier);
            res.send(result);

        });

        //Items API
        //GET
        app.get('/item', async (req, res) => {
            const email = req.query.email;
            let query;
            if (email) {
                query = { email: email };
            }
            else {
                query = {};
            }
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
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedItem.quantity
                }
            };
            console.log(updatedDoc);
            const result = await itemCollection.updateOne(filter, updatedDoc, options);
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

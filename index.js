const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hmvy7hf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

console.log(uri)

async function run() {
    try {
        const categoriesCollection = client.db('laptopSwappers').collection('categories');
        const productsCollection = client.db('laptopSwappers').collection('products');

        const bookingsCollection = client.db('laptopSwappers').collection('bookings');

        app.get('/categories', async (req, res) => {

            const query = {};
            const result = await categoriesCollection.find(query).toArray();

            res.send(result);
        })
        app.get('/categories/:id', async (req, res) => {
            const id = req.params.id;
            const query = { category_id: id }
            const category = await productsCollection.find(query).toArray();
            res.send(category);


        })
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })


    }
    finally {



    }
}
run().catch(console.log)


app.get('/', async (req, res) => {
    res.send('laptop swappers server is running');
})

app.listen(port, () => console.log(`laptop swappers running on ${port}`))
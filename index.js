const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
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
        const usersCollection = client.db('laptopSwappers').collection('users');
        const addedProductCollection = client.db('laptopSwappers').collection('addedproducts')
        const paymentsCollection = client.db('laptopSwappers').collection('payments');
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
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;




            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        });
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })
        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const booking = await bookingsCollection.findOne(query);
            res.send(booking);
        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });
        app.get('/users', async (req, res) => {
            // const email = req.query.email;

            const query = {};
            const users = await usersCollection.find(query).toArray();

            res.send(users);
        })


        app.get('/sellers', async (req, res) => {

            const query = { role: "seller" };
            const result = await usersCollection.find(query).toArray();
            res.send(result);
        }
        )



        app.get('/buyers', async (req, res) => {

            const query = { role: "buyer" };
            const result = await usersCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' });
        })

        app.get('/brand', async (req, res) => {
            const query = {};
            const result = await categoriesCollection.find(query).project({ name: 1 }).toArray()
            res.send(result)

        })
        app.post('/addedproducts', async (req, res) => {
            const addproduct = req.body;
            const result = await addedProductCollection.insertOne(addproduct);
            res.send(result);
        })
        app.get('/addedproducts/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const result = await addedProductCollection.find(query).toArray();
            res.send(result)
        })
        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.resale_price;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.bookingId
            const filter = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await bookingsCollection.updateOne(filter, updatedDoc)


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
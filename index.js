const express = require('express');
const cors = require('cors');
const jwt =require('jsonwebtoken');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();


const app  = express();
const port = process.env.PORT || 5000;

//middle ware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rw41wea.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        const serviceCollection = client.db('foodReview').collection('services');
        const reviewCollection = client.db('foodReview').collection('reviews');

        app.post('/jwt', (req, res)=>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})
            res.send({token})
            // console.log(user);

        })

        app.get('/services', async(req, res)=>{
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services); 

        });
        app.get('/services-limit', async(req, res)=>{
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services); 
        });
        
        app.get('/services/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const service = await serviceCollection.findOne(query)
            res.send(service);
        })

        app.get('/review/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await reviewCollection.findOne(query);
            res.send(result)
        })
        
        app.post('/reviews',async(req, res) =>{
            const review = req.body;
            console.log(review)
            const result = await reviewCollection.insertOne(review);
            res.send(result);

        });

        app.put('/review/:id', async(req, res)=>{
            const id = req.params.id;
            const review = req.body;
            console.log(id,review)
            const filter = {_id: new ObjectId(id)}
            const options = { upsert: true };
            const updatedReview={
                $set:{
                    message:review.message
                }
            }
            const result = await reviewCollection.updateOne(filter,updatedReview,options);
            res.send(result);
        })
    
        
        app.delete('/reviews/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const result = await reviewCollection.deleteOne(query);
            res.send(result);

        });


    }
   finally{

   }


}
run().catch(err=>console.log(err))


app.get('/', (req, res)=>{
    res.send('food review server is running ');
})

app.listen(port,()=>{
    console.log(`food review server running on ${port}`)
})
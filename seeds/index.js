const { default: mongoose } = require('mongoose');
const Campground = require('../models/campground');
const axios = require('axios')
const {places, descriptors} = require('./seedHelpers');
const cities = require('./cities');


main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp');
  console.log('Connection Established!')
 
}

const sample = array => array[Math.floor(Math.random() * array.length)]

// async function seedImg() {
//   try {
//     const resp = await axios.get('https://api.unsplash.com/photos/random', {
//       params: {
//         client_id: 'EPom631hHPGOWlQJjGr9u8ciuvhj_Nno3a7fQVxbkaE',
//         collections: 1286920,
//       },
//     })
//     return resp.data.urls.small
//   } catch (err) {
//     console.error(err)
//   }
// }

const seedDb = async() => {
    await Campground.deleteMany({});
    for(let i=0; i<200; i++ ) {
       const random1000 = Math.floor(Math.random() * 1000)
       const price = Math.floor(Math.random() * 5000) + 10;
       const camp = new Campground ({
        author: '65fe890b6dac5ecebf9035d5',
        location: `${cities[random1000].city}, ${cities[random1000].state}`,
        geometry: {
          type: "Point",
          coordinates: [cities[random1000].longitude, cities[random1000].latitude],
        },
        title: `${sample(descriptors)}, ${sample(places)}`,
        images: [
              {
                url: 'https://res.cloudinary.com/dd4lgnkgy/image/upload/v1712043805/Trekker/kxtfozc9trp6psgoz1vx.jpg',
                filename: 'Trekker/kxtfozc9trp6psgoz1vx',
              
              },
              {
                url: 'https://res.cloudinary.com/dd4lgnkgy/image/upload/v1712043806/Trekker/uatmjv1dodq7pptea8bb.jpg',
                filename: 'Trekker/uatmjv1dodq7pptea8bb',
               
              }
            ]
        ,
        description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Debitis, nihil tempora vel aspernatur quod aliquam illum! Iste impedit odio esse neque veniam molestiae eligendi commodi minus, beatae accusantium, doloribus quo!'
       })
       await camp.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close();
});

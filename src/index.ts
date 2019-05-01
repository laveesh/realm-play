import * as express from 'express';
import * as Realm from 'realm';
import * as os from 'os';

let ip: String;
const ifaces = os.networkInterfaces();
Object.keys(ifaces).forEach(function(ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function(iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      return;
    }

    if (alias >= 1) {
      ip = iface.address;
    } else {
      ip = iface.address;
    }
    ++alias;
  });
});

const app = express();
const port = process.env.PORT || 3500;

const CarSchema = {
  name: 'Car',
  properties: {
    make: 'string',
    model: 'string',
    miles: { type: 'int', default: 0 }
  }
};
const PersonSchema = {
  name: 'Person',
  properties: {
    name: 'string',
    birthday: 'date',
    cars: 'Car[]',
    picture: 'data?' // optional property
  }
};

Realm.open({ schema: [CarSchema, PersonSchema] })
  .then(realm => {
    // Create Realm objects and write to local storage
    realm.write(() => {
      const myCar = realm.create('Car', {
        make: 'Honda',
        model: 'Civic',
        miles: 1000
      });
      myCar.miles += 20; // Update a property value
    });

    // Query Realm for all cars with a high mileage
    const cars = realm.objects('Car').filtered('miles > 1000');

    // Will return a Results object with our 1 car
    cars.length; // => 1

    // Add another car
    realm.write(() => {
      const myCar = realm.create('Car', {
        make: 'Ford',
        model: 'Focus',
        miles: 2000
      });
    });

    // Query results are updated in realtime
    cars.length; // => 2
  })
  .catch(error => {
    console.log(error);
  });

let milesCount = 1999;

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/addCarSample', (req, res) => {
  Realm.open({ schema: [CarSchema] }).then(realm => {
    realm.write(() => {
      ++milesCount;
      res.send(
        realm.create('Car', {
          make: 'Suzuki',
          model: 'ciaz',
          miles: milesCount
        })
      );
    });
  });
});

app.listen(port, () =>
  console.log(`Example app listening on address http://${ip}:${port}`)
);

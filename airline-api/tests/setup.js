const { MongoMemoryReplSet } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// بيشتغل مرة واحدة قبل كل التستات: بيقوم Replica Set وهمي في الذاكرة
// (محتاجين Replica Set مش Standalone عشان الـ Transactions تشتغل في booking tests)
beforeAll(async () => {
  mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = mongoServer.getUri();
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'test_secret_key';
  process.env.NODE_ENV = 'test';
  await mongoose.connect(uri);
}, 60000);

// بعد كل تست، بنمسح كل الكوليكشنز عشان التستات تبقى مستقلة عن بعض
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

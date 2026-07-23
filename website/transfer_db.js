const dns = require('dns');
// Override DNS servers to Google DNS to fix querySrv ECONNREFUSED on some networks
dns.setServers(['8.8.8.8', '8.8.4.4']);

const { MongoClient } = require("mongodb");

const LOCAL_URI = "mongodb://127.0.0.1:27017/zyphor";
const REMOTE_URI = "mongodb+srv://zyphorapp_db_user:SFMx0wHW6rd9ZUz2@cluster0.oqakvy3.mongodb.net/zyphor?appName=Cluster0";

async function transferData() {
  console.log("Starting Data Transfer...");

  const localClient = new MongoClient(LOCAL_URI);
  const remoteClient = new MongoClient(REMOTE_URI, {
    serverSelectionTimeoutMS: 10000 // fail fast if still can't connect
  });

  try {
    await localClient.connect();
    console.log("Connected to Local Database.");
    
    await remoteClient.connect();
    console.log("Connected to Remote Atlas Database.");

    const localDb = localClient.db();
    const remoteDb = remoteClient.db();

    // Get all collections from local
    const collections = await localDb.listCollections().toArray();
    console.log(`Found ${collections.length} collections to transfer.`);

    for (let collectionInfo of collections) {
      const colName = collectionInfo.name;
      
      // Skip system collections
      if (colName.startsWith("system.")) continue;

      console.log(`\nProcessing collection: [${colName}]`);
      
      const localCol = localDb.collection(colName);
      const remoteCol = remoteDb.collection(colName);

      // Fetch all docs from local
      const docs = await localCol.find({}).toArray();
      console.log(`  -> Found ${docs.length} documents locally.`);

      if (docs.length > 0) {
        // Clear remote collection first to avoid duplicates
        await remoteCol.deleteMany({});
        
        // Insert docs to remote
        const result = await remoteCol.insertMany(docs);
        console.log(`  -> Successfully inserted ${result.insertedCount} documents to Atlas.`);
      } else {
        console.log(`  -> Skipped empty collection.`);
      }
    }

    console.log("\n✅ ALL DATA TRANSFERRED SUCCESSFULLY!");

  } catch (error) {
    console.error("❌ Error during data transfer:", error);
  } finally {
    await localClient.close();
    await remoteClient.close();
    console.log("Database connections closed.");
  }
}

transferData();

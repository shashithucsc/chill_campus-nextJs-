# Create Test Posts for Development

This script will help you create test posts in your database for development purposes.

## How to Use

1. Make sure your MongoDB server is running
2. Run the script with:

```bash
node scripts/create-test-posts.js
```

## What it Does

- Creates 20 test posts with random content
- Assigns posts to random users from your database
- Occasionally assigns posts to communities (if any exist)
- Adds a special flag `isTestPost: true` to identify test data

## Viewing Results

After running the script, check your home feed to see the newly created posts.

## Cleaning Up

If you need to remove test posts, you can run a MongoDB query:

```js
db.posts.deleteMany({ isTestPost: true })
```

Or create a cleanup script:

```js
// scripts/cleanup-test-posts.js
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const Post = mongoose.model('Post');
    const result = await Post.deleteMany({ isTestPost: true });
    console.log(`Deleted ${result.deletedCount} test posts`);
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
```

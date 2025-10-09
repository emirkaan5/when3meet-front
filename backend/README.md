## Start MongoDB (Atlas) & Backend

1. `cd backend`

2. Create a `.env` file with:
   ```env
   MONGODB_URI="<your Atlas connection string>"
   PORT=5000

   (Make sure your IP is allowed in Atlas)

3. (opt) Install the necessary packages if this is the first time you run the code here
   `npm i`

4. Run the dev server
    `npm run dev`

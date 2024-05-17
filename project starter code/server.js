import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util.js';
import path from 'path';

  // console.log("Entered the server.js file!!"); // Debugging


  // Init the Express application
  const app = express();

  // console.log("Express App initiated!"); // Debugging

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // console.log("Body parser thing worked!"); // Debugging 

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

    /**************************************************************************** */

    const router = express.Router();
      router.get("/filteredimage/", async (req, res) => {
          let { image_url } = req.query

          // Check if image_url is provided
          if (!image_url) {
            return res.status(400).send({ error: 'image_url query parameter is required' });
          }

           // Check if image_url is a valid URL
          try {
            new URL(image_url);
          } catch (e) {
            return res.status(400).send({ error: 'image_url query parameter must be a valid URL' });
          }

          // Check if image_url points to an image by checking the file extension
          const extension = path.extname(new URL(image_url).pathname).toLowerCase();
          if (!['.png', '.jpg', '.jpeg', '.gif'].includes(extension)) {
            return res.status(400).send({ error: 'image_url must point to an image (jpeg, png, etc.)' });
          }

          // Download the filtered image locally and store the new path in filteredPath
          const filteredPath = await filterImageFromURL(image_url);

          // Debugging
          // console.log("File downloaded?");
          // console.log("Filtered Path: ", filteredPath);

          // Send the filtered image back to the client
          res.status(200).sendFile(filteredPath);

          // console.log("File sent?"); // Debugging

          // Delete the downloaded image from the server
          res.on('finish', () => deleteLocalFiles([filteredPath]));

      })
    
    app.use(router)

    //! END @TODO1
    
    // Root Endpoint
    // Displays a simple message to the user
    app.get( "/", async (req, res) => {
      res.send("try GET /filteredimage?image_url={{}}")
    } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );

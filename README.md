# KSP Scrapper

  To run this KSP scrapper, first you to install all dependencies(chrome extension for frontend, backend folder for be :P), after that you need to run build using
  
   ```npm run build```

  You'll then need to fill backend .env configuration file.
  You can run backend  on develop mode using

  ```npm run dev```

## Functionality

### How to initialize scrape
Go on a KSP products page, for example https://ksp.co.il/web/world/7076?select=61623
and choose to scrape on the extension. 

### How to store it in the database
after scraping succesfully, an option to send the data to its backend endpoint will pop.
the products will be stored/updated on the database.

### GET all products endpoint
A get request to  ```'/procduts'``` will return all the currently stored products on the database.



### Author: dolevbitran
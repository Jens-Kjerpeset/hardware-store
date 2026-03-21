const google = require('googlethis');

async function test() {
  const options = {
    page: 0, 
    safe: false, 
    additional_params: { 
      // tbs: 'ic:trans' restricts to transparent background in Google Images
      tbs: 'ic:trans' 
    }
  }
  
  const query = 'NVIDIA GeForce RTX 4090 png';
  console.log(`Searching for: ${query}`);
  
  try {
    const images = await google.image(query, options);
    console.log(`Found ${images.length} images!`);
    if (images.length > 0) {
      console.log('Top 3 results:');
      console.log('1.', images[0].url);
      console.log('2.', images[1].url);
      console.log('3.', images[2].url);
    }
  } catch (err) {
    console.error(err);
  }
}

test();

let{ createClient}= require('pexels')
let Jimp=require('jimp')//for editing the image
const fs = require('fs')
let {facts} = require('./facts') //import from facts.js

async function generateImage(imagePath) {
  let fact = randomFact()//call randomfact function to generate a random fact
  let photo = await getRandomImage(fact.animal)//call randomimage function to generate image
  await editImage(photo, imagePath, fact.fact)//edit the image 
}


function randomFact() {
  let fact = facts[randomInteger(0, (facts.length - 1))]  //generate the fact corresponding to randominteger
  return fact
}


function randomInteger(min, max) { //generate a random integer
  return Math.floor(Math.random() * (max - min + 1)) + min;//floor function to round off decimal
}


async function getRandomImage(animal) {
  try {
    const client = createClient(process.env.PEXELS_API_KEY)//get image from pexels
    const query = animal
    let image

    await client.photos.search({ query, per_page: 10 }).then(res => {//take 10 pics
      let images = res.photos
      image = images[randomInteger(0, (images.length - 1))]//select a random pic among 10 pics

    })

    return image

  } catch (error) {
    console.log('error downloading image', error)//error occur due to server down
    getRandomImage(animal)//try again to get image
  }
}


async function editImage(image, imagePath, fact) {//edit image 
  try {
    let imgURL = image.src.medium
    let animalImage = await Jimp.read(imgURL).catch(error => console.log('error ', error))
    let animalImageWidth = animalImage.bitmap.width
    let animalImageHeight = animalImage.bitmap.height
    let imgDarkener = await new Jimp(animalImageWidth, animalImageHeight, '#000000')
    imgDarkener = await imgDarkener.opacity(0.5)
    animalImage = await animalImage.composite(imgDarkener, 0, 0);

    let posX = animalImageWidth / 15 //automatically available in documentation part
    let posY = animalImageHeight / 15
    let maxWidth = animalImageWidth - (posX * 2)
    let maxHeight = animalImageHeight - posY

    let font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)//font ,colour specified
    await animalImage.print(font, posX, posY, {
      text: fact,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,//middle portion identified
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    }, maxWidth, maxHeight)

    await animalImage.writeAsync(imagePath)
    console.log("Image generated successfully")

  } catch (error) {
    console.log("error editing image", error)
  }

}


const deleteImage = (imagePath) => {//delete image after sending
  fs.unlink(imagePath, (err) => {
    if (err) {
      return
    }
    console.log('file deleted')
  })
}


module.exports = { generateImage, deleteImage }//wrap as module no need of randomimage function as it is already called in generate image

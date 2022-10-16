const{Telegraf}=require('telegraf');
const{v4: uuidv4}=require('uuid');
require('dotenv').config();
let factgenerator=require('./factgenerator')

const bot =new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx)=>{
  let message ="Please use /fact to get a random fact";
   ctx.reply(message);
})
bot.command('fact',async(ctx)=>{//telegram command
  try{
       ctx.reply("Please wait while we generate your fact");//replying to our request
       let path=`./images/${uuidv4()}.jpg`;//image to be stored in image folder
       await factgenerator.generateImage(path);
       await ctx.replyWithPhoto({source :path});//replying to our request with photo
       factgenerator.deleteImage(path);//deleting it from our storage

  }
  catch{
      console.log("error generating fact");//error may occur due to network issue etc
      ctx.reply("Sorry, we couldn't generate your fact");
  }
})
bot.launch();

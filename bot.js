require("dotenv").config();
const { createCanvas, loadImage } = require("canvas");
const { Client, Events, GatewayIntentBits } = require('discord.js')
const base64 = require("base-64");
const banana = require("@banana-dev/banana-dev");

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  })
const prefix = "!";

client.once(Events.ClientReady, c => {
    console.log(`Bot is ready! Logged in as ${c.user.tag}`);
  });

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(" ");
  const command = args.shift().toLowerCase();

  if (command === "real") {
    message.channel.send("Generating...");
    const prompt = args.join(" ");
    const api_key = process.env.BANANA_API_KEY;
    const model_key = process.env.BANANA_MODEL_KEY;
    const model_inputs = {
      prompt: prompt,
      num_inference_steps: 20,
      guidance_scale: 7,
    };
    try {
      const resp = await banana.run(api_key, model_key, model_inputs);
      const image_byte_string = resp.modelOutputs[0].image_base64;
      const image_encoded = image_byte_string.toString("utf8");
      const image_bytes = Buffer.from(image_encoded, "base64");
    //   const image = await loadImage(image_bytes);
    //   const canvas = createCanvas(image.width, image.height);
    //   const ctx = canvas.getContext("2d");
    //   ctx.drawImage(image, 0, 0);
    //   const attachment = new MessageAttachment(
    //     canvas.toBuffer(),
    //     "image.png"
    //   );
      message.channel.send({ files: [{ attachment: image_bytes, name: 'real.png' }] });
    } catch (e) {
      if (
        e.message.includes(
          "Shard ID None heartbeat blocked for more than 20 seconds"
        )
      ) {
        message.channel.send(
          "Error: Discord connection timed out, please try again later."
        );
      } else {
        console.error(`Error: ${e}`);
        message.channel.send("Image generation failed, please try again");
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

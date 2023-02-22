import os
import base64
import discord
from PIL import Image
from io import BytesIO
import banana_dev as banana
from discord import Intents
from dotenv import load_dotenv
from discord.ext import commands

load_dotenv()

TOKEN = os.environ["DISCORD_TOKEN"]
intents = Intents.default()
intents.message_content = True

bot = commands.Bot(
    command_prefix="!",
    description="Runs models on Banana!",
    intents=intents,
)

@bot.command()
async def dream(ctx, *, prompt):
    """Generate an image from a text prompt using the stable-diffusion model"""
    msg = await ctx.send(f"“{prompt}”\n> Generating...")
    api_key = os.environ['BANANA_API_KEY']
    model_key = os.environ['BANANA_MODEL_KEY']
    model_inputs = {
        "prompt": prompt,
        "negative_prompt":"blurry, ugly",
        "num_inference_steps":20,
        "guidance_scale":7,
    }
    try:
        out = banana.run(api_key, model_key, model_inputs)
        image_byte_string = out["modelOutputs"][0]["image_base64"]
        image_encoded = image_byte_string.encode('utf-8')
        image_bytes = BytesIO(base64.b64decode(image_encoded))
        image = Image.open(image_bytes)
        await ctx.send(f"“{prompt}”\n", file=discord.File(fp=BytesIO(base64.b64decode(image_encoded)), filename="image.png"))
    except Exception as e:
        if "Shard ID None heartbeat blocked for more than 20 seconds" in str(e):
            await ctx.send("Error: Discord connection timed out, please try again later.")
        else:
            print(f'Error: {e}')
            await ctx.send("Image generation failed, please try again")

bot.run(TOKEN)
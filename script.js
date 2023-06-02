import dotenv from "dotenv";
import {
  Client,
  GatewayIntentBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";
import { fetchQuestions } from "./utils.js";
import questionData from "./questions.json" assert { type: "json" };

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.login(process.env.DISCORD_TOKEN);

const url = "https://github.com/lydiahallie/javascript-questions";

client.on("ready", async () => {
  await fetchQuestions();
});

client.on("messageCreate", async (message) => {
  if (!message?.author.bot && message?.content === "!question") {
    const randomIndex = Math.floor(
      Math.random() * questionData.questions.length
    );
    console.log("randomIndex", randomIndex);
    const { questionContent, questionOptions, questionTitle } =
      questionData.questions[randomIndex];

    const title = `** \`${questionTitle}\` **`;
    const content = !!questionContent
      ? "```js\n" + questionContent + "\n```"
      : "";
    const options = questionOptions
      .map((option) => `* \` ${option}\``)
      .join("\n");

    const response = [title, content, options].filter(Boolean).join("\n");

    const answerButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel("Show Answer")
      .setCustomId(`show-${randomIndex}`);

    const row = new ActionRowBuilder().addComponents([answerButton]);

    message.channel.send({
      content: response,
      components: [row],
    });
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.customId.startsWith("show")) {
    const questionId = interaction.customId.split("-")[1];
    const { questionLink, questionAnswer } = questionData.questions[questionId];
    const linkButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("See explanation on github")
      .setURL(questionLink || url);
    const row = new ActionRowBuilder().addComponents([linkButton]);

    try {
      await interaction.deferReply({
        ephemeral: true,
      });
      await interaction.editReply({
        content: questionAnswer,
        components: [row],
      });
    } catch (error) {
      console.log("error in interaction", error);
    }
  }
});

client.on("disconnect", function (erMsg, code) {
  console.log(
    "----- Bot disconnected from Discord with code",
    code,
    "for reason:",
    erMsg,
    "-----"
  );
  client.connect();
});

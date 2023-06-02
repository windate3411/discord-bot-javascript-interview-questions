import axios from "axios";
import { load } from "cheerio";
import dotenv from "dotenv";
import {
  Client,
  GatewayIntentBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";

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
let answer = "";
let link = "";

client.on("messageCreate", async (message) => {
  if (!message?.author.bot && message?.content === "!question") {
    const {
      questionAnswer,
      questionContent,
      questionLink,
      questionOptions,
      questionTitle,
    } = await fetchQuestion();
    console.log("questionTitle", questionTitle);
    const title = `** \`${questionTitle}\` **`;
    const content = "```js\n" + questionContent + "\n```";
    const options = questionOptions
      .map((option) => `* \` ${option}\``)
      .join("\n");

    const response = [title, content, options].join("\n");
    answer = questionAnswer;
    link = questionLink;

    const answerButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel("Show Answer")
      .setCustomId("show");

    const row = new ActionRowBuilder().addComponents([answerButton]);

    message.channel.send({
      content: response,
      components: [row],
    });
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.customId === "show") {
    const linkButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("See explanation on github")
      .setURL(link);
    const row = new ActionRowBuilder().addComponents([linkButton]);
    await interaction.reply({
      content: answer,
      components: [row],
    });
    link = "";
    answer = "";
  }
});

async function fetchQuestion() {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = load(html);

    const questionTitleStructures = $('h6[tabindex="-1"][dir="auto"]');

    const randomIndex = Math.floor(
      Math.random() * questionTitleStructures.length
    );
    const questionTitleStructure = questionTitleStructures.eq(randomIndex);

    const questionTitle = questionTitleStructure.text().trim();
    const questionLink = url + questionTitleStructure.find("a").attr("href");

    const questionContent = questionTitleStructure
      .next("div")
      .find("pre")
      .text()
      .trim();

    const questionOptions = [];
    const questionOptionsElements = questionTitleStructure
      .next("div")
      .next('ul[dir="auto"]')
      .find("li");
    questionOptionsElements.each((index, element) => {
      const optionText = $(element).text().trim();
      questionOptions.push(optionText);
    });

    const questionAnswer = questionTitleStructure
      .next("div")
      .next('ul[dir="auto"]')
      .next("details")
      .find("h4")
      .text()
      .trim();

    return {
      questionTitle,
      questionContent,
      questionOptions,
      questionAnswer,
      questionLink,
    };
  } catch (error) {
    console.log(error);
  }
}

// async function fetchQuestion() {
//   await axios
//     .get(url)
//     .then((response) => {
//       const html = response.data;
//       const $ = load(html);

//       // Find all the question title structures and extract their text and link
//       const questionTitleStructures = $('h6[tabindex="-1"][dir="auto"]');

//       // Select a random question title structure
//       const randomIndex = Math.floor(
//         Math.random() * questionTitleStructures.length
//       );
//       const questionTitleStructure = questionTitleStructures.eq(randomIndex);

//       // Extract the question title from the selected structure
//       const questionTitle = questionTitleStructure.text().trim();

//       // Extract the question link from the selected structure
//       const questionLink = url + questionTitleStructure.find("a").attr("href");

//       // Find the nearest pre element to the selected question title structure and extract its inner text
//       const questionContent = questionTitleStructure
//         .next("div")
//         .find("pre")
//         .text()
//         .trim();

//       // Find the question options under the question content
//       const questionOptions = [];
//       const questionOptionsElements = questionTitleStructure
//         .next("div")
//         .next('ul[dir="auto"]')
//         .find("li");
//       questionOptionsElements.each((index, element) => {
//         const optionText = $(element).text().trim();
//         questionOptions.push(optionText);
//       });

//       // Find the question answer under the question options
//       const questionAnswer = questionTitleStructure
//         .next("div")
//         .next('ul[dir="auto"]')
//         .next("details")
//         .find("h4")
//         .text()
//         .trim();

//       //   console.log("Question Title:", questionTitle);
//       //   console.log("Question Content:", questionContent);
//       //   console.log("Question Options:", questionOptions);
//       //   console.log("Question Answer:", questionAnswer);
//       //   console.log("Question Link:", questionLink);
//       return {
//         questionTitle,
//         questionContent,
//         questionOptions,
//         questionAnswer,
//         questionLink,
//       };
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// }

// axios
//   .get(url)
//   .then((response) => {
//     const html = response.data;
//     const $ = cheerio.load(html);

//     // Find all the question title structures and extract their text and link
//     const questionTitleStructures = $('h6[tabindex="-1"][dir="auto"]');

//     // Select a random question title structure
//     const randomIndex = Math.floor(
//       Math.random() * questionTitleStructures.length
//     );
//     const questionTitleStructure = questionTitleStructures.eq(randomIndex);

//     // Extract the question title from the selected structure
//     const questionTitle = questionTitleStructure.text().trim();

//     // Extract the question link from the selected structure
//     const questionLink = url + questionTitleStructure.find("a").attr("href");

//     // Find the nearest pre element to the selected question title structure and extract its inner text
//     const questionContent = questionTitleStructure
//       .next("div")
//       .find("pre")
//       .text()
//       .trim();

//     // Find the question options under the question content
//     const questionOptions = [];
//     const questionOptionsElements = questionTitleStructure
//       .next("div")
//       .next('ul[dir="auto"]')
//       .find("li");
//     questionOptionsElements.each((index, element) => {
//       const optionText = $(element).text().trim();
//       questionOptions.push(optionText);
//     });

//     // Find the question answer under the question options
//     const questionAnswer = questionTitleStructure
//       .next("div")
//       .next('ul[dir="auto"]')
//       .next("details")
//       .find("h4")
//       .text()
//       .trim();

//     // Print the question title, content, options, answer, and link
//     console.log("Question Title:", questionTitle);
//     console.log("Question Content:", questionContent);
//     console.log("Question Options:", questionOptions);
//     console.log("Question Answer:", questionAnswer);
//     console.log("Question Link:", questionLink);
//   })
//   .catch((error) => {
//     console.log(error);
//   });

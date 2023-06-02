import axios from "axios";
import { load } from "cheerio";
import fs from "fs";

const url = "https://github.com/lydiahallie/javascript-questions";

async function fetchQuestions() {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = load(html);

    const questionTitleStructures = $('h6[tabindex="-1"][dir="auto"]');
    const questions = [];

    questionTitleStructures.each((index, questionTitleStructure) => {
      const $questionTitleStructure = $(questionTitleStructure);
      const questionTitle = $questionTitleStructure.text().trim();
      const questionLink = url + $questionTitleStructure.find("a").attr("href");
      const id = index + 1;

      const questionContent = $questionTitleStructure
        .next("div")
        .find("pre")
        .text()
        .trim();

      const questionOptions = [];
      const questionOptionsElements = $questionTitleStructure
        .nextAll('ul[dir="auto"]')
        .first()
        .find("li");
      questionOptionsElements.each((index, element) => {
        const optionText = $(element).text().trim();
        questionOptions.push(optionText);
      });

      const questionAnswer = $questionTitleStructure
        .next("div")
        .next('ul[dir="auto"]')
        .next("details")
        .find("h4")
        .text()
        .trim();

      questions.push({
        id,
        questionTitle,
        questionContent,
        questionOptions,
        questionAnswer,
        questionLink,
      });
    });

    const jsonData = {
      questions,
    };

    const jsonFile = JSON.stringify(jsonData, null, 2);
    fs.writeFileSync("questions.json", jsonFile);
    console.log("Questions fetched and saved to questions.json");
  } catch (error) {
    console.error("An error occurred while fetching questions:", error);
  }
}

export { fetchQuestions };

const axios = require("axios");

async function getRandomBackground() {
  const width = 1920;
  const height = 1080;
  const id = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/id/${id}/${width}/${height}`;
}

module.exports = {
  getRandomBackground,
};

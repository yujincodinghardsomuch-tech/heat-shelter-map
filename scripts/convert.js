const csv = require("csvtojson");
const iconv = require("iconv-lite");
const fs = require("fs");

const csvFile = "./data/서울시 무더위쉼터.csv";

const buffer = fs.readFileSync(csvFile);
const decoded = iconv.decode(buffer, "cp949");

fs.writeFileSync("./data/temp.csv", decoded);

csv()
  .fromFile("./data/temp.csv")
  .then((json) => {
    fs.writeFileSync(
      "./data/shelters.json",
      JSON.stringify(json, null, 2),
      "utf8"
    );

    console.log("변환 완료");
    console.log("쉼터 수:", json.length);
  });
  

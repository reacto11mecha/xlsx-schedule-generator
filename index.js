const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const workbook = XLSX.readFile("jadwal.xlsx");

const worksheetSchedule = workbook.Sheets.NormalizeSchedule;
const worksheetLessonIds = workbook.Sheets.LessonIds;

const dataSchedule = XLSX.utils.sheet_to_json(worksheetSchedule, { raw: true });
const dataLessonIds = XLSX.utils.sheet_to_json(worksheetLessonIds, {
  raw: true,
});

let currentDay = 1;
let currentIndex = 0;

let temp = [];
let secondTemp = { entity: null };

dataSchedule.forEach((element, idx) => {
  if (idx === 0) {
    secondTemp = { entity: [element], currentDay };
  } else if (idx !== 0 && element.JAM < dataSchedule[idx + 1]?.JAM) {
    secondTemp.entity.push(element);
  } else {
    currentDay++;

    secondTemp.entity.push(element);
    temp.push(secondTemp);

    secondTemp = { entity: [], currentDay };
  }
});

const classess = temp[0].entity
  .map((e) => Object.keys(e))[0]
  .filter((kelas) => kelas !== "JAM");

const remap = classess.map((className) => ({
  className,
  schedule: temp.map((t) => ({
    day: t.currentDay,
    lessons: t.entity.map((dat) => {
      if (typeof dat[className] === "string") return dat[className];

      const lesson = dataLessonIds.find(
        (lesson) => lesson.GURU === dat[className]
      );
      return lesson["MATA PELAJARAN"];
    }),
  })),
}));

const resultDir = path.join(__dirname, "result");

if (!fs.existsSync(resultDir)) fs.mkdirSync(resultDir);

fs.writeFileSync(
  path.join(resultDir, "jadwal.json"),
  JSON.stringify(remap, null, 2)
);

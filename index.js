const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const workbook = XLSX.readFile("jadwal.xlsx");

const worksheetSchedule = workbook.Sheets.NormalizeSchedule;
const worksheetLessonIds = workbook.Sheets.LessonIds;
const worksheetTimeAllocation = workbook.Sheets.TimeAllocation;
const worksheetTimezone = workbook.Sheets.Timezone;

const dataSchedule = XLSX.utils.sheet_to_json(worksheetSchedule, { raw: true });
const dataLessonIds = XLSX.utils.sheet_to_json(worksheetLessonIds, {
  raw: true,
});
const dataTimeAllocation = XLSX.utils.sheet_to_json(worksheetTimeAllocation, {
  raw: true,
});
const dataTimezone = XLSX.utils.sheet_to_json(worksheetTimezone, {
  raw: true,
});

const resultDir = path.join(__dirname, "result");

if (!fs.existsSync(resultDir)) fs.mkdirSync(resultDir);

function writeSchedule() {
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

  fs.writeFileSync(
    path.join(resultDir, "jadwal.json"),
    JSON.stringify(remap, null, 2)
  );
}

function writeTimeAllocation() {
  let currentDay = 1;
  let currentIndex = 0;

  let temp = [];
  let secondTemp = { alloc: null };

  dataTimeAllocation.forEach((element, idx) => {
    if (idx === 0) {
      secondTemp = { alloc: [element], currentDay };
    } else if (element.JAM === "isBreak") {
      secondTemp.alloc.push({ isBreak: true, WAKTU: element.WAKTU })
    } else if (idx !== 0 && element.JAM < dataTimeAllocation[idx + 1]?.JAM || dataTimeAllocation[idx + 1]?.JAM === "isBreak") {
      secondTemp.alloc.push(element);
    } else {
      currentDay++;

      secondTemp.alloc.push(element);
      temp.push(secondTemp);

      secondTemp = { alloc: [], currentDay };
    }
  });

  const { TZ } = dataTimezone[0];
  const remap = temp.map((d) => ({
    ...d,
    alloc: d.alloc.map((alloctObj) => ({
      ...alloctObj,
      WAKTU: alloctObj.WAKTU.split("-").map((txt) => txt.trim()),
    })),
  }));

  const result = {
    TimeAllocation: remap,
    TZ
  }

  fs.writeFileSync(
    path.join(resultDir, "waktu.json"),
    JSON.stringify(result, null, 2)
  );
}

writeSchedule();
writeTimeAllocation();

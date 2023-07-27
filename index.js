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

function writeScheduleStudent() {
  let currentDay = 1;

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
    schedules: temp.map((t) => ({
      day: t.currentDay,
      lessons: t.entity.map((dat) => {
        if (typeof dat[className] === "string")
          return { lesson: dat[className] };

        const lesson = dataLessonIds.find(
          (lesson) => lesson.NO === dat[className]
        );

        return { lesson: lesson["MAPEL"], name: lesson["NAMA GURU"] };
      }),
    })),
  }));

  fs.writeFileSync(
    path.join(resultDir, "jadwal-siswa.json"),
    JSON.stringify(remap, null, 2)
  );
}

function writeScheduleTeacher() {
  const data = dataLessonIds
    .filter(({ MAPEL }) => MAPEL !== "KEPSEK")
    .map((lessonId) => {
      const findByIdMap = dataSchedule.map((schedule) => {
        const reconditionKeys = Object.keys(schedule);
        const reconditionValues = Object.values(schedule);

        const classIndex = reconditionValues.findIndex(
          (no) => no === lessonId.NO
        );

        const className =
          classIndex > 0 ? reconditionKeys[classIndex] : "TIDAK MENGAJAR";

        return {
          time: schedule.JAM,
          className,
        };
      });

      return {
        teacherId: lessonId.NO,
        allocation: findByIdMap,
        teacherName: lessonId["NAMA GURU"],
      };
    })
    .map(({ allocation, teacherName, teacherId }) => {
      let currentDay = 1;
      let idxAlloc = 0;

      let temp = [];
      let secondTemp = { alloc: null };

      dataTimeAllocation.forEach((element, idx) => {
        if (idxAlloc === 0) {
          secondTemp = {
            alloc: [{ kelas: allocation[0].className }],
            currentDay,
          };

          idxAlloc++;
        } else if (element.JAM === "isBreak") {
          secondTemp.alloc.push({ isBreak: true });
        } else if (
          (idx !== 0 && element.JAM < dataTimeAllocation[idx + 1]?.JAM) ||
          dataTimeAllocation[idx + 1]?.JAM === "isBreak"
        ) {
          secondTemp.alloc.push({ kelas: allocation[idxAlloc].className });

          idxAlloc++;
        } else {
          currentDay++;

          secondTemp.alloc.push({ kelas: allocation[idxAlloc].className });
          temp.push(secondTemp);

          secondTemp = { alloc: [], currentDay };

          idxAlloc++;
        }
      });

      return {
        teacherId,
        teacherName,
        className: temp,
      };
    });

  fs.writeFileSync(
    path.join(resultDir, "jadwal-guru.json"),
    JSON.stringify(data, null, 2)
  );
}

function writeTimeAllocation() {
  let currentDay = 1;

  let temp = [];
  let secondTemp = { alloc: null };

  dataTimeAllocation.forEach((element, idx) => {
    if (idx === 0) {
      secondTemp = { alloc: [element], currentDay };
    } else if (element.JAM === "isBreak") {
      secondTemp.alloc.push({ isBreak: true, WAKTU: element.WAKTU });
    } else if (
      (idx !== 0 && element.JAM < dataTimeAllocation[idx + 1]?.JAM) ||
      dataTimeAllocation[idx + 1]?.JAM === "isBreak"
    ) {
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
    TZ,
  };

  fs.writeFileSync(
    path.join(resultDir, "waktu.json"),
    JSON.stringify(result, null, 2)
  );
}

writeScheduleStudent();
writeScheduleTeacher();
writeTimeAllocation();

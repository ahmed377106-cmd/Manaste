import test from "node:test";
import assert from "node:assert/strict";
import {
  translateYear,
  translateTerm,
  translateBranch,
  translateStatus,
  getBranchesForYear,
  parseVideoLink,
  validateCourseInput,
  validateStudentSignup,
  filterCoursesList,
  Course,
} from "./platformLogic";

test("translate helpers return accurate Arabic labels", () => {
  assert.equal(translateYear("First"), "الصف الأول الثانوي");
  assert.equal(translateYear("Third"), "الصف الثالث الثانوي");
  assert.equal(translateTerm("Second"), "الفصل الدراسي الثاني");
  assert.equal(translateBranch("Math_Science"), "علمي رياضة");
  assert.equal(translateStatus("Accepted"), "مقبول (مفعل)");
  assert.equal(translateStatus("Waiting"), "في انتظار التفعيل");
});

test("getBranchesForYear returns correct branches per secondary school grade", () => {
  const firstBranches = getBranchesForYear("First");
  assert.equal(firstBranches.length, 2);
  assert.deepEqual(
    firstBranches.map((b) => b.value),
    ["Scientific", "Literary"]
  );

  const thirdBranches = getBranchesForYear("Third");
  assert.equal(thirdBranches.length, 3);
  assert.deepEqual(
    thirdBranches.map((b) => b.value),
    ["Scientific_Sciences", "Math_Science", "Literary"]
  );
});

test("parseVideoLink parses YouTube, Google Drive, and MediaDelivery links safely", () => {
  const yt1 = parseVideoLink("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s");
  assert.equal(yt1.type, "youtube");
  assert.equal(yt1.embedUrl, "https://www.youtube.com/embed/dQw4w9WgXcQ");

  const ytShort = parseVideoLink("https://youtu.be/abc123XYZ");
  assert.equal(ytShort.type, "youtube");
  assert.equal(ytShort.embedUrl, "https://www.youtube.com/embed/abc123XYZ");

  const drive = parseVideoLink(
    "https://drive.google.com/file/d/1A2B3C4D5E6F/view?usp=sharing"
  );
  assert.equal(drive.type, "drive");
  assert.equal(
    drive.embedUrl,
    "https://drive.google.com/file/d/1A2B3C4D5E6F/preview"
  );

  const invalid = parseVideoLink("not-a-valid-url");
  assert.equal(invalid.type, "invalid");
  assert.equal(invalid.embedUrl, null);
});

test("validateCourseInput enforces course validation rules", () => {
  const invalidEmpty = validateCourseInput({ subject: "" });
  assert.equal(invalidEmpty.valid, false);

  const validCourse = validateCourseInput({
    subject: "الفيزياء الحديثة",
    year: "Third",
    term: "First",
    teacher: "أ. أحمد محمود",
    description: "شرح تفصيلي وشامل لمنهج الفيزياء للثانوية العامة",
    branch: "Scientific_Sciences",
  });
  assert.equal(validCourse.valid, true);
});

test("validateStudentSignup checks complexity and Egyptian phone numbers", () => {
  const badPhone = validateStudentSignup({
    name: "محمد أحمد علي",
    email: "student@gmail.com",
    password: "Password@123",
    year: "Third",
    branch: "Math_Science",
    phone: "12345",
    fatherPhone: "01012345678",
  });
  assert.equal(badPhone.valid, false);

  const validStudent = validateStudentSignup({
    name: "محمد أحمد علي",
    email: "student@gmail.com",
    password: "Password@123",
    year: "Third",
    branch: "Math_Science",
    phone: "01012345678",
    fatherPhone: "01112345678",
  });
  assert.equal(validStudent.valid, true);
});

test("filterCoursesList filters by search, year, branch, and suspend status", () => {
  const sampleCourses: Course[] = [
    {
      _id: "1",
      subject: "الفيزياء الكهربية",
      teacher: "د. محمود الكيلاني",
      teacherImg: "",
      year: "Third",
      term: "First",
      branch: "Scientific_Sciences",
      suspend: false,
      description: "أساسيات التيار الكهربي وقانون أوم",
      listOfLec: [],
    },
    {
      _id: "2",
      subject: "التفاضل والتكامل",
      teacher: "أ. سامح عبد العزيز",
      teacherImg: "",
      year: "Third",
      term: "First",
      branch: "Math_Science",
      suspend: true,
      description: "معدلات التغير والنهايات",
      listOfLec: [],
    },
  ];

  const activeOnly = filterCoursesList(sampleCourses, { excludeSuspended: true });
  assert.equal(activeOnly.length, 1);
  assert.equal(activeOnly[0]._id, "1");

  const searchMatch = filterCoursesList(sampleCourses, { search: "التفاضل" });
  assert.equal(searchMatch.length, 1);
  assert.equal(searchMatch[0]._id, "2");
});

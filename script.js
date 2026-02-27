// ==============================
// API CONFIG (LEGACY, OPTIONAL)
// ==============================
const API_BASE_URL = "https://xsmhhduixpyotdhsjizr.supabase.co";



// ==============================
// ROSTERS (TEACHER → STUDENTS)
// ==============================
const roster = {
  Englade: [
    "Eduardo","Wilson","Tamara","Jakelin","Joy","Carmen","Genesis V","Laqoria",
    "Christopher","Mauricio","Karin","Juliesse","Javion","Claudia","Ezequiel",
    "Jesly","Hazel","Gloria","Susannah","Genri","Rossmery","Ronald","Bryan",
    "Keith","Myles","Ariana","Kaelynn","Blessen","Jacob","Jayana","Ashlynn",
    "Genesis A","Kason","Jayden","Andres","Julianna","Israel","Sergio",
    "Camila M","Sena","Eiyten","Brenda","Aneista","De'zariah","Leslie",
    "Terrell","Samuel","Jannat","Nilka","Denilson","Camila R","Kiya","Aiden",
    "Aliany","Tyler","Camaurie","Hailee","Teodora","Jeremiah","Evelynn",
    "Victor","Jashua","Malia","Venus","James","Alison"
  ],
  Russell: [
    "April L","Zain A","Sebastian A","Madul B","Evolet D","Derick M",
    "Anthony C","Asani D","Elena R","Zoe M","Nicolle M","Ashley G","Zachary H",
    "Krystal V","Jacob M","Ayesha K","Jordan M","Liliana O","Natalie R","Kingston R",
    "Lucia O","Joshelyne R","Allan E","Elijah W","Gersan D","Nya B","Gianny C","Danna C",
    "Ashten C","Valeria R","Kierstin D","Macie D","Natalia U","Kirellos G","Brenton G",
    "Brady L","Aziah L","Jacklyn M","Ridwan M","Sophia N","Tylan P","Sophia P",
    "Jose C","Kaeli R","Andy R","Annie R","Martell R","Alonzo W","Edom A","Zainin A",
    "Liam A","Aurora A","Kelianny A","Carlos M","Evelyn O","Maria F","London G",
    "Isabella G","Sofia V","Holy G","Fabian G","Gia H","Jennie L","Gustavo M","Charles M",
    "Samantha R","Dana E","Darryl S","Hanley T","Angelis G","Paiton W"
  ],
  Miller: [
    "Malia A","Rico B","Angel B","Malcolm B","Camden C","Spencer C","Jose O",
    "Brady D","Kirollos E","Emma F","Sumera G","Mya G","Bentley G","Anas H","Jayden H",
    "Alisson M","Paul H","Sara L","Gin M","Jaxson P","Sophia Ph","Suri T","Daniel R",
    "Ronny R","Edgar R","Tyler W","Bailie W","Paul W","Tomas Y","Fidelino L","Lucas M",
    "Jaymon B","Aiden B","Alex L","Alan R","Uziel S","Brianna S","Ellay G","Dawayne G",
    "Kiya H","Ka'Miyah J","Justice J","Rony R","Greyson M","Saba N","Lisa B","Andrea A",
    "Gerardo C","Ariel S","Maya V","Brandon E","Dawit W","Emily H","Aaliya C","Erynn C",
    "Jason D","Andrew D","Maria C","Allison J","Shenouda H","Landyn J","Candice J","KJ J",
    "Nessa L","Lily L","Ca'Myah M","Keiry M","Mauricio O","Devick M","David R","Makenzie R",
    "Keilyn S","Johani D","Jeremy P","Brendan C","Amiyah W","Violet L"
  ],
  Massengill: [
    "Anzie E","Evelin A","Cing C","Mason C","Dayana S","Zai D","Derrick G","Maysea G",
    "Selana G","Javon G","Aila H","Kameron J","Sonia M","Christian G","Nathaly R",
    "Brenda D","Robert P","Genesis H","Alan S","Salvador R","Emily G","Jesus R",
    "Aurora P","Alexa M","Willow A","Christian M","Kevin B","Keon B","Crystal Y",
    "Raymond C","Kevin G","Jacob G","Jose H","Josiah H","Allison J","Christine K",
    "Cing M","Tadres M","Aurora G","Luis A","Aubrey S","Riley S","Johnny V","Mason W",
    "Adham A","Eleen A","Mariah A","Carlos A","Catarina P","Jacobed L","Yavian D",
    "Juan D","Jaxon E","Josiah G","Nyzaen H","Christina D","Emily R","Ellie N",
    "Mayrin P","Ana C","Osbaldo D","Ashley H","Adrian R","Maria M","Harold R",
    "Rosselyn A","Alannah T","Jaselle W"
  ],
  Clark: [
    "Angela A","Violet A","Youanna A","Karim O","Joel C","Zenobia D","Gianni F",
    "Karen P","Christian H","Estefany P","Aldo J","Miquel K","Seth L","Zion L","Ashley A",
    "Camiyah M","Merci N","Kylee N","Helen P","Juan J","Caleb P","Alva P","Elaria S","Aubrey A",
    "Karas A","Kayla B","Nicole C","Alexandria C","Bayron D","Naomy B","Khori G","Evelyn R",
    "Maritza G","Stacy G","Carah R","King S","Nicholas S","Breanna T","Edgar V","Kailee W",
    "Josiah W","Abdirahman A","Abdallah A","Kinley C","Starkiesha C","Sakinh D","Albenis C",
    "Manuel H","Derrick J","Aisha J","Kelaiden J","Tamoya K","Timothy K","Ryan M","Islaha M",
    "Lyliana M","Jonathan G","Briana M","Gianni R","Jeremiah R","Alexandra S","Savannah S",
    "Justin S","Joseph W"
  ]
};



// ==============================
// LOCAL STUDENT ATTEMPT STORAGE
// ==============================
let allStudentData = [];
let isDataReady = false;


function loadLocalData() {
  const raw = localStorage.getItem("pythPracticeResults");
  allStudentData = raw ? JSON.parse(raw) : [];
  isDataReady = true;
}

function createAttemptId() {
  return Date.now(); // one id per full Submit
}


function saveLocalAttempt(record) {
  const raw = localStorage.getItem("pythPracticeResults");
  const all = raw ? JSON.parse(raw) : [];
  all.push(record);
  localStorage.setItem("pythPracticeResults", JSON.stringify(all));
}
// MathJax helper: render LaTeX in a given element
function typesetMathIn(element) {
  if (window.MathJax && MathJax.typesetPromise && element) {
    MathJax.typesetPromise([element]).catch(err => console.error(err));
  }
}

// ==============================
// SUPABASE SAVE HELPER
// ==============================
async function savePythAttemptsToSupabase(records) {
  if (typeof window.supabasePythClient === "undefined") {
    console.error("Pythagorean client is undefined");
    return;
  }

  const { error } = await window.supabasePythClient
    .from("pythagorean_attempts")
    .insert(
      records.map(r => ({
        teacher: r.teacher,
        student_name: r.studentName,
        question_id: r.questionId,
        sbg: r.sbg,
        answer: r.answer,
        attempts: r.attempts,
        correct: r.correct,
        attempt_id: r.attempt_id,
        created_at: r.created_at
      }))
    );

  if (error) {
    console.error("Error inserting pythagorean attempts", error);
  } else {
    console.log("Inserted pythagorean attempts", records);
  }
}



// ==============================
// QUESTION DATA
// ==============================
const questions = [
  { id: 1,
    sbg: 0.5,
    text: "Which side of the triangle is the hypotenuse?",
    image: "practice-images/1.png",
    choices: ["1", "2", "3"],
    correct: "b",
    hint: "Remember that the hypotenuse is the side opposite the right angle and it is the longest side of the right triangle."
  },
  { id: 2,
    sbg: 0.5,
    text: "In the following equation, which letter represents the hypotenuse?",
    image: "practice-images/2.png",
    type: "fill",
    blanks: [
      { id: "x", label: "", correct: "c" }
    ],
    hint: "The hypotenuse is the square root of the sum of the squares of the other two sides."
  },
  { id: 3,
    sbg: 0.5,
    text: "Which equation accurately represents the diagram?",
    image: "practice-images/3.png",
    choices: [
      "3<sup>2</sup> + 5<sup>2</sup> = 4<sup>2</sup>",
      "3<sup>2</sup> + 4<sup>2</sup> = 5<sup>2</sup>",
      "4<sup>2</sup> + 5<sup>2</sup> = 3<sup>2</sup>"
    ],
    correct: "b",
    hint: "Remember, the Pythagorean Theorem is a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup> where a and b are legs and c is the hypotenuse."
  },
  { id: 4,
    sbg: 0.5,
    type: "dragLabel",
    text: "Label each side of the triangle.",
    image: "practice-images/4.png",
    labels: [
      { id: "Leg", text: "Leg" },
      { id: "Hypotenuse", text: "Hypotenuse" }
    ],
    targets: [
      { id: "side1", correctLabelId: "Leg", top: "3%", left: "50%" },
      { id: "side2", correctLabelId: "Leg", top: "45%", left: "15%" },
      { id: "side3", correctLabelId: "Hypotenuse", top: "60%", left: "60%" }
    ],
    hint: "There are two legs and one hypotenuse in a right triangle."
  },
  { id: 5, sbg: 0.5,
    text: "For each statement, choose whether it is true or false.",
    image: "", type: "matrix",
    statements: [
      { id: "stmt1", text: "The hypotenuse of a right triangle is the side opposite the right angle.", correct: "T" },
      { id: "stmt2", text: "A right angle is formed where the hypotenuse meets one of the legs.", correct: "F" },
      { id: "stmt3", text: "The hypotenuse of a right triangle is the longest side.", correct: "T" },
      { id: "stmt4", text: "The length of a hypotenuse is equal to the sum of the lengths of the other two sides.", correct: "F" }
    ],
    hint: ""
  },
  { id: 6, sbg: 1.0,
    text: "What is the measure of the hypotenuse in the image below?",
    image: "practice-images/6.png",
    choices: [ "25", "7", "5", "6" ],
    correct: "c",
    hint: "Remember, the Pythagorean Theorem is a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup> where a and b are legs and c is the hypotenuse."
  },
  { id: 7, sbg: 1.0,
    text: "What is the measure of the hypotenuse in the image below?",
    image: "practice-images/7.png",
    choices: [ "10", "14", "2", "100" ],
    correct: "a",
    hint: "Remember, the Pythagorean Theorem is a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup> where a and b are legs and c is the hypotenuse."
  },
  { id: 8, sbg: 1.0,
    text: "What is the measure of the hypotenuse in the image below?",
    image: "practice-images/8.png",
    choices: [ "17", "7", "169", "13" ],
    correct: "d",
    hint: "Remember, the Pythagorean Theorem is a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup> where a and b are legs and c is the hypotenuse."
  },
  { id: 9, sbg: 1.0,
    text: "What is the measure of the hypotenuse in the image below?",
    image: "practice-images/9.png",
    choices: [ "34", "14", "676", "26" ],
    correct: "d",
    hint: "Remember, the Pythagorean Theorem is a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup> where a and b are legs and c is the hypotenuse."
  },
  { id: 10, sbg: 1.0,
    text: "What is the measure of the hypotenuse in the image below?",
    image: "practice-images/10.png",
    choices: [ "17", "23", "7", "289" ],
    correct: "a",
    hint: "Remember, the Pythagorean Theorem is a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup> where a and b are legs and c is the hypotenuse."
  },
  { id: 11, sbg: 1.5,
    text: "What is the measure of the missing leg in the image below?",
    image: "practice-images/11.png",
    choices: [ "17", "23", "7", "289" ],
    correct: "a",
    hint: "Remember, the Pythagorean Theorem is a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup> where a and b are legs and c is the hypotenuse."
  },
  { id: 12, sbg: 1.5,
    text: "What is the measure of the missing leg in the image below?",
    image: "practice-images/12.png",
    choices: [ "3", "15", "75", "53" ],
    correct: "b",
    hint: "Remember, the Pythagorean Theorem is a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup> where a and b are legs and c is the hypotenuse."
  },
  { id: 13, sbg: 1.5,
    text: "What is the measure of the missing leg in the image below?",
    image: "practice-images/13.png",
    choices: [ "49", "9", "21", "35" ],
    correct: "c",
    hint: "Remember, the Pythagorean Theorem is a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup> where a and b are legs and c is the hypotenuse."
  },
  { id: 14, sbg: 1.5,
    text: "What is the measure of the missing leg in the image below?",
    image: "practice-images/14.png",
    choices: [ "64", "52", "36", "48" ],
    correct: "d",
    hint: "Remember, the Pythagorean Theorem is a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup> where a and b are legs and c is the hypotenuse."
  },
  { id: 15, sbg: 1.5,
    text: "What is the measure of the missing leg in the image below?",
    image: "practice-images/15.png",
    choices: [ "87", "121", "25", "55" ],
    correct: "d",
    hint: "Remember, the Pythagorean Theorem is a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup> where a and b are legs and c is the hypotenuse."
  },
  { id: 16, sbg: 2.0,
    text: "The hypotenuse of a right triangle (c) is 15 inches and one of its legs (a) is 3 inches. Find the length of the other leg (b).",
    image: "",
    type: "fill",
    blanks: [
      // show the radical as proper math
      { id: "x", label: "b = \\( \\sqrt{216} \\)", correct: "216" },
    ],
    hint: "The length of one leg is equal to the square root of the difference of two squares."
  },
  { id: 17, sbg: 2.0,
    text: "A right triangle has one leg that is 7 inches long and another leg that is 23 inches long. Find the length of the hypotenuse (c).",
    image: "",
    type: "fill",
    blanks: [
      { id: "x", label: "c = ", correct: "578" },
    ],
    hint: "The length of one leg is equal to the square root of the difference of two squares."
  },
  { id: 18, sbg: 2.0,
    text: "The side lengths of triangles are listed below. Determine which of the following side lengths create a right triangle. Select three.",
    image: "", type: "multi",
    options: [
      { id: "A", text: "\\( (8 , 15 , 16) \\)", correct: true },
      { id: "B", text: "\\( (6 , 8 , 12) \\)", correct: false },
      { id: "C", text: "\\( (12 , 16 , 20) \\)", correct: true },
      { id: "D", text: "\\( (5 , 12 , 13) \\)", correct: true },
      { id: "E", text: "\\( (10 , 11 , 15) \\)", correct: false }
    ],
    hint: "Use the Converse of Pythagorean Theorem."
  },
  { id: 19, sbg: 2.0,
    type: "matrixPythagorean",
    text: "Determine whether each set of side lengths can form a right triangle.",
    statements: [
      { id: "s1", text: "\\( 7 , 9 , \\sqrt{130} \\)" },
      { id: "s2", text: "\\( 7 , 24 , 25 \\)" },
      { id: "s3", text: "\\( 8 , 16 , 17 \\)" },
      { id: "s4", text: "\\( 12 , 16 , 20 \\)" },
      { id: "s5", text: "\\( 11 , 19 , \\sqrt{482} \\)" }
    ],
    // answer key for this matrix
    answerKey: {
      s1: "R",
      s2: "R",
      s3: "N",
      s4: "R",
      s5: "N"
    }
  },
  { id: 20, sbg: 2.0, 
    text: "Which one of the following expressions can be used to find the length of a hypotenuse?", 
    image: "", 
    choices: [ "\\( \\sqrt{a^2 + c^2} \\)", "\\( \\sqrt{a^2 + b^2} \\)", "\\( \\sqrt{b^2 + c^2} \\)", "\\(a^2 + b^2 - c^2\\)" ], 
    correct: "b", 
    hint: "The hypotenuse is equal to the square root of the sum of two squares." },
{
    id: 21, sbg: 2.5,
    text: "Running from the top of a flagpole to a hook in the ground there is a rope that is 17 meters long. If the hook is 8 meters from the base of the flagpole, how tall is the flagpole?",
    type: "fill",
    blanks: [
      { id: "x", label: "",labelAfter: " meters", correct: "15" },
    ],
    hint: "A leg length is equal to the square root of the difference of two squares."
  },
{
    id: 22, sbg: 2.5,
    text: "An oak tree is 12 meters tall and a bird is standing on the ground 5 meters from the tree. If the bird flies directly to the top of the tree, how far will it fly?",
    type: "fill",
    blanks: [
      { id: "x", label: "",labelAfter: " meters", correct: "13" },
    ],
    hint: "The hypotenuse is equal to the square root of the sum of two squares."
  },
  {
    id: 23, sbg: 2.5,
    text: "Find the shortest distance between the two points.",
    type: "fill",
    image: "practice-images/23.png",
    blanks: [
      { id: "x", label: "",labelAfter: " units", correct: "20" },
    ],
    hint: "Use the vertical distance and horizontal distance as the lengths of two legs."
  },
  {
    id: 24, sbg: 2.5,
    text: "Find the distance between the points \\( (1 , 3) \\) and \\( (4 , 5) \\). Round to the nearest tenth.",
    type: "fill",
    blanks: [
      { id: "x", label: "",labelAfter: " units", correct: "3.6" },
    ],
    hint: "Use the vertical distance and horizontal distance as the lengths of two legs."
  },
  {
    id: 25, sbg: 2.5,
    text: "Dillon is fishing from a small boat. His fishing hook is 3.6 meters below him, and a fish is swimming at the same depth as the hook, 4.6 meters away. How far away is Dillon from the fish? If necessary, round to the nearest tenth.",
    type: "fill",
    blanks: [
      { id: "x", label: "",labelAfter: " meters", correct: "5.8" },
    ],
    hint: "Use the vertical distance and horizontal distance as the lengths of two legs."
  },
{
    id: 26, sbg: 3.0,
    text: "Find the distance between the points \\((-4 , 16.9)\\) and \\((12.4 , -8.1)\\). Round to the nearest tenth.",
    type: "fill",
    blanks: [
      { id: "x", labelAfter: " units", correct: "29.9" },
    ],
    hint: "Use the vertical distance and horizontal distance as the lengths of two legs."
  },
  {
    id: 27, sbg: 3.0,
    text: "Two window washers, Jenny and Marvin, lean a ladder against the side of a building so that Jenny can wash a window while Marvin holds the ladder. The top of the ladder reaches the window, which is 4.3 meters off the ground. The base of the ladder is 1.7 meters away from the building. How long is the ladder? If necessary, round to the nearest tenth.",
    type: "fill",
    blanks: [
      { id: "x", labelAfter: " meters", correct: "4.6" },
    ],
    hint: "Use the vertical distance and horizontal distance as the lengths of two legs."
  },
  {
    id: 28, sbg: 3.0,
    text: "What is the longest distance between two points in the rectangular prism? Round to the ones.",
    type: "fill",
    image: "practice-images/28.png",
    blanks: [
      { id: "x", labelAfter: " \\(cm\\)", correct: "8" },
    ],
    hint: "Treat the figure as a compound figure."
  },
  { id: 29, sbg: 3.0, 
    text: "Where can you plot a third point to form a triangle with a hypotenuse of 5 units?", 
    image: "practice-images/29.png", 
    choices: [ "\\((2 , 3)\\)", "\\((-1 , -1)\\)", "\\((2 , -3)\\)", "\\((0 , 5)\\)" ], 
    correct: "c", 
    hint: "Use the vertical distance and horizontal distance as the lengths of two legs." },
  { id: 30, sbg: 3.0, 
    text: "The location of Bill and Ted is represented on the coordinate plane. Each grid line represents a distance of 0.5 miles. What is the approximate distance, in miles, between the two?", 
    image: "practice-images/30.png", 
    choices: [ "\\(3.54 mi\\)", "\\(7.07mi\\)", "\\(2.75 mi\\)", "\\(4.54 mi\\)" ], 
    correct: "a", 
    hint: "Use the vertical distance and horizontal distance as the lengths of two legs." },

  ];



// ==============================
// IN-MEMORY STATE
// ==============================
const studentAnswers = new Array(questions.length).fill(null);
const questionStates = questions.map(() => ({
  answered: false,
  correct: null,
  attempts: 0
}));
let currentIndex = 0; // 0-based



// ==============================
// DOM ELEMENT REFERENCES
// ==============================
const progressBar = document.getElementById("progress-bar");
const itemNavigator = document.getElementById("item-navigator");
const problemNumber = document.getElementById("problem-number");
const problemText = document.getElementById("problem-text");
const problemImage = document.getElementById("problem-image");
const choicesList = document.getElementById("choices-list");
const feedback = document.getElementById("feedback");
const checkBtn = document.getElementById("check-answer");
const hintBtn = document.getElementById("hint");
const prevBtn = document.getElementById("prev-question");
const nextBtn = document.getElementById("next-question");
const loginScreen = document.getElementById("login-screen");
const practiceScreen = document.getElementById("practice-screen");
const teacherSelectEl = document.getElementById("teacher-select");
const studentSelectEl = document.getElementById("student-select");
const loginButton = document.getElementById("login-button");
const loginError = document.getElementById("login-error");
const submitPracticeBtn = document.getElementById("submit-practice");
const summaryScreen = document.getElementById("summary-screen");
const imageOverlay = document.getElementById("image-overlay");
const overlayImage = document.getElementById("overlay-image");



// ==============================
// IMAGE OVERLAY HELPERS
// ==============================
function showImageOverlay(src, alt) {
  overlayImage.src = src;
  overlayImage.alt = alt || "";
  imageOverlay.style.display = "flex";
}


function hideImageOverlay() {
  imageOverlay.style.display = "none";
  overlayImage.src = "";
}


imageOverlay.addEventListener("click", hideImageOverlay);



// ==============================
// RESTORE PROGRESS FROM SUPABASE
// ==============================
async function restorePythProgressFromSupabase(teacher, student) {
  if (typeof window.supabasePythClient === "undefined") return;

  const { data, error } = await window.supabasePythClient
    .from("pythagorean_attempts")
    .select("*")
    .eq("teacher", teacher)
    .eq("student_name", student);

  if (error) {
    console.error("Error loading attempts from Supabase", error);
    return;
  }

  for (let i = 0; i < questions.length; i++) {
    studentAnswers[i] = null;
    questionStates[i] = { answered: false, correct: null, attempts: 0 };
  }

  if (!data || !data.length) {
    updateProgress();
    highlightNavigator();
    return;
  }

  const byAttempt = {};
  data.forEach(r => {
    const attemptId = r.attempt_id || new Date(r.created_at).getTime();
    if (!byAttempt[attemptId]) byAttempt[attemptId] = [];
    byAttempt[attemptId].push(r);
  });

  const attemptIds = Object.keys(byAttempt).map(Number).sort((a, b) => a - b);
  const latestAttemptRows = byAttempt[attemptIds[attemptIds.length - 1]];

  latestAttemptRows.forEach(r => {
    const index = questions.findIndex(q => q.id === r.question_id);
    if (index === -1) return;

    studentAnswers[index] = r.answer;
    questionStates[index] = {
      answered: r.answer != null,
      correct: !!r.correct,
      attempts: r.attempts || 1
    };
  });

  updateProgress();
  highlightNavigator();
}



// ==============================
// LOGIN FLOW
// ==============================
loginButton.addEventListener("click", async () => {
  const teacher = teacherSelectEl.value;
  const student = studentSelectEl.value;

  if (!teacher || !student) {
    loginError.textContent = "Please select your teacher and your name.";
    return;
  }

  loginError.textContent = "";
  const currentStudent = { teacher, student };
localStorage.setItem("pythCurrentStudent", JSON.stringify(currentStudent));
  loginScreen.style.display = "none";
  practiceScreen.style.display = "block";

  initNavigator();

  await restorePythProgressFromSupabase(teacher, student);

  renderQuestion();
  updateProgress();
});



// ==============================
// DROPDOWN POPULATION HELPERS
// ==============================
function populateTeachers() {
  teacherSelectEl.innerHTML = "";
  Object.keys(roster).forEach(teacherName => {
    const opt = document.createElement("option");
    opt.value = teacherName;
    opt.textContent = teacherName;
    teacherSelectEl.appendChild(opt);
  });
}


function populateStudentsForTeacher(teacher) {
  studentSelectEl.innerHTML = "";
  if (!teacher) {
    studentSelectEl.disabled = true;
    return;
  }
  const students = roster[teacher] || [];
  students.forEach(studentName => {
    const opt = document.createElement("option");
    opt.value = studentName;
    opt.textContent = studentName;
    studentSelectEl.appendChild(opt);
  });
  studentSelectEl.disabled = false;
}


teacherSelectEl.addEventListener("change", () => {
  const teacher = teacherSelectEl.value;
  populateStudentsForTeacher(teacher);
});


function restoreLoginIfPresent() {
const raw = localStorage.getItem("pythCurrentStudent");
  if (!raw) return;
  try {
    const currentStudent = JSON.parse(raw);
    if (!currentStudent.teacher || !currentStudent.student) return;
    teacherSelectEl.value = currentStudent.teacher;
    populateStudentsForTeacher(currentStudent.teacher);
    studentSelectEl.value = currentStudent.student;
  } catch (e) {
    console.error("Error parsing stored student", e);
  }
}



// ==============================
// NAVIGATOR SETUP
// ==============================
function initNavigator() {
  itemNavigator.innerHTML = "";
  questions.forEach((q, index) => {
    const btn = document.createElement("button");
    btn.textContent = index + 1;
    btn.classList.add("item-button");
    btn.dataset.index = index;
    btn.addEventListener("click", () => {
      saveCurrentAnswer();
      currentIndex = index;
      renderQuestion();
    });
    itemNavigator.appendChild(btn);
  });
}



// ==============================
// QUESTION RENDERING
// ==============================
function renderQuestion() {
  const q = questions[currentIndex];

  const targetsContainer = document.getElementById("drag-label-targets");
  const labelBank = document.getElementById("drag-label-bank");

  if (q.type === "dragLabel") {
    if (targetsContainer) {
      targetsContainer.style.display = "block";
    }
    if (labelBank) {
      labelBank.style.display = "block";
    }
  } else {
    if (targetsContainer) {
      targetsContainer.style.display = "none";
      targetsContainer.innerHTML = "";
    }
    if (labelBank) {
      labelBank.style.display = "none";
      labelBank.innerHTML = "";
    }
  }

  problemNumber.textContent = (currentIndex + 1) + ".";
  // Allow math markup in question text
  problemText.innerHTML = q.text;

  if (q.image) {
    problemImage.style.display = "block";
    problemImage.src = q.image;
    problemImage.alt = "Problem " + (currentIndex + 1);
  } else {
    problemImage.style.display = "none";
  }

  choicesList.innerHTML = "";

  const stored = studentAnswers[currentIndex];

  if (q.type === "matrix") {
    const table = document.createElement("table");
    table.classList.add("tf-matrix");

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Statement</th>
        <th>True</th>
        <th>False</th>
      </tr>`;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    const storedObj = stored || {};

    q.statements.forEach(stmt => {
      const tr = document.createElement("tr");

      const tdText = document.createElement("td");
      // Allow math in statement text
      tdText.innerHTML = stmt.text;

      const tdTrue = document.createElement("td");
      const trueInput = document.createElement("input");
      trueInput.type = "radio";
      trueInput.name = stmt.id;
      trueInput.value = "T";
      if (storedObj[stmt.id] === "T") trueInput.checked = true;
      tdTrue.appendChild(trueInput);

      const tdFalse = document.createElement("td");
      const falseInput = document.createElement("input");
      falseInput.type = "radio";
      falseInput.name = stmt.id;
      falseInput.value = "F";
      if (storedObj[stmt.id] === "F") falseInput.checked = true;
      tdFalse.appendChild(falseInput);

      tr.appendChild(tdText);
      tr.appendChild(tdTrue);
      tr.appendChild(tdFalse);
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    choicesList.appendChild(table);

  } else if (q.type === "mcImage") {
    const storedVal = stored;

    q.choices.forEach(choice => {
      const li = document.createElement("li");

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "problem";
      input.id = `problem${q.id}-${choice.id}`;
      input.value = choice.id;
      if (storedVal === choice.id) input.checked = true;

      const label = document.createElement("label");
      label.setAttribute("for", input.id);

      const img = document.createElement("img");
      img.src = choice.image;
      img.alt = `Choice ${choice.id.toUpperCase()}`;
      img.style.maxWidth = "160px";
      img.style.display = "block";

      img.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        showImageOverlay(choice.image, img.alt);
      });

      label.appendChild(img);
      li.appendChild(input);
      li.appendChild(label);
      choicesList.appendChild(li);
    });

  } else if (q.type === "fill") {
    const storedObj = stored || {};
    q.blanks.forEach(blank => {
      const li = document.createElement("li");

      const label = document.createElement("label");
      // Allow math before the blank
      label.innerHTML = (blank.label || "") + " ";
      label.setAttribute("for", `blank-${blank.id}`);

      const input = document.createElement("input");
      input.type = "text";
      input.id = `blank-${blank.id}`;
      input.name = blank.id;
      input.size = 4;
      if (storedObj[blank.id] != null) {
        input.value = storedObj[blank.id];
      }

      li.appendChild(label);
      li.appendChild(input);

      if (blank.labelAfter) {
        const afterSpan = document.createElement("span");
        // Allow math after the blank
        afterSpan.innerHTML = blank.labelAfter;
        li.appendChild(afterSpan);
      }

      choicesList.appendChild(li);
    });

  } else if (q.type === "multi") {
    const storedObj = stored || {};
    q.options.forEach(opt => {
      const li = document.createElement("li");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = `multi-${q.id}-${opt.id}`;
      input.name = `multi-${q.id}`;
      input.value = opt.id;
      if (storedObj[opt.id]) {
        input.checked = true;
      }
      const label = document.createElement("label");
      label.setAttribute("for", input.id);
      // Allow math in option text
      label.innerHTML = opt.text;
      li.appendChild(input);
      li.appendChild(label);
      choicesList.appendChild(li);
    });

  } else if (q.type === "fillSentence") {
    const storedObj = stored || {};
    const p = document.createElement("p");
    let blankIndex = 0;

    q.textParts.forEach(part => {
      if (part.trim() === "") {
        const blank = q.blanks[blankIndex++];
        const input = document.createElement("input");
        input.type = "text";
        input.size = 4;
        input.name = blank.id;
        input.id = `blank-${blank.id}`;
        if (storedObj[blank.id] != null) {
          input.value = storedObj[blank.id];
        }
        p.appendChild(input);
      } else {
        // Allow math in sentence parts
        const span = document.createElement("span");
        span.innerHTML = part;
        p.appendChild(span);
      }
    });

    choicesList.appendChild(p);

  } else if (q.type === "matrixPythagorean") {
    const table = document.createElement("table");
    table.classList.add("tf-matrix");

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Sides</th>
        <th>Right Triangle</th>
        <th>Not a Right Triangle</th>
      </tr>`;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    const storedObj = stored || {};

    q.statements.forEach(stmt => {
      const tr = document.createElement("tr");

      const tdText = document.createElement("td");
      // Allow math in sides text if needed
      tdText.innerHTML = stmt.text;

      const tdRight = document.createElement("td");
      const rightInput = document.createElement("input");
      rightInput.type = "radio";
      rightInput.name = stmt.id;
      rightInput.value = "R";
      if (storedObj[stmt.id] === "R") rightInput.checked = true;
      tdRight.appendChild(rightInput);

      const tdNotRight = document.createElement("td");
      const notRightInput = document.createElement("input");
      notRightInput.type = "radio";
      notRightInput.name = stmt.id;
      notRightInput.value = "N";
      if (storedObj[stmt.id] === "N") notRightInput.checked = true;
      tdNotRight.appendChild(notRightInput);

      tr.appendChild(tdText);
      tr.appendChild(tdRight);
      tr.appendChild(tdNotRight);
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    choicesList.appendChild(table);
  }

  if (q.type === "dragLabel") {
    const storedObj = stored || {};

    if (!targetsContainer || !labelBank) {
      console.error("Missing drag-label containers in DOM");
      return;
    }

    targetsContainer.innerHTML = "";
    labelBank.innerHTML = "";

    q.targets.forEach(t => {
      const targetDiv = document.createElement("div");
      targetDiv.classList.add("drag-target-box");
      targetDiv.dataset.targetId = t.id;
      targetDiv.dataset.correctLabelId = t.correctLabelId;

      targetDiv.style.top = t.top;
      targetDiv.style.left = t.left;

      const currentLabelId = storedObj[t.id];
      if (currentLabelId) {
        targetDiv.dataset.labelId = currentLabelId;
        // labels here are just IDs, keep as text
        targetDiv.textContent = currentLabelId;
        targetDiv.classList.add("filled");
      } else {
        targetDiv.textContent = "Drop here";
      }

      targetDiv.addEventListener("dragover", e => {
        e.preventDefault();
      });

      targetDiv.addEventListener("drop", e => {
        e.preventDefault();
        const labelId = e.dataTransfer.getData("text/plain");
        targetDiv.dataset.labelId = labelId;
        targetDiv.textContent = labelId;
        targetDiv.classList.add("filled");

        const ans = studentAnswers[currentIndex] || {};
        ans[targetDiv.dataset.targetId] = labelId;
        studentAnswers[currentIndex] = ans;
        highlightNavigator();
      });

      targetsContainer.appendChild(targetDiv);
    });

    const labelsRow = document.createElement("div");
    q.labels.forEach(labelDef => {
      const labelDiv = document.createElement("div");
      labelDiv.classList.add("drag-label-tile");
      labelDiv.textContent = labelDef.text;
      labelDiv.draggable = true;
      labelDiv.dataset.labelId = labelDef.id;

      labelDiv.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", labelDef.id);
      });

      labelsRow.appendChild(labelDiv);
    });

    labelBank.appendChild(labelsRow);

  } else {
    const labels = ["a", "b", "c", "d"];
    q.choices && q.choices.forEach((choiceText, i) => {
      const li = document.createElement("li");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "problem";
      input.id = `problem${q.id}-${labels[i]}`;
      input.value = labels[i];
      if (stored === labels[i]) {
        input.checked = true;
      }
      const label = document.createElement("label");
      label.setAttribute("for", input.id);
      // Allow math in legacy choice text
      label.innerHTML = choiceText;
      li.appendChild(input);
      li.appendChild(label);
      choicesList.appendChild(li);
    });
  }

  feedback.textContent = "";
  feedback.className = "";
  updateProgress();
  highlightNavigator();
  updateButtons();

  // Render any LaTeX ( \( ... \), etc.) in the question area
  const problemContainer = document.getElementById("problem-container");
  typesetMathIn(problemContainer);
}



// ==============================
// ANSWER CAPTURE HELPERS
// ==============================
function getSelectedAnswer() {
  const q = questions[currentIndex];

  if (q.type === "matrix") {
    const result = {};
    q.statements.forEach(stmt => {
      const selected = document.querySelector(`input[name="${stmt.id}"]:checked`);
      result[stmt.id] = selected ? selected.value : null;
    });
    return result;

  } else if (q.type === "fill" || q.type === "fillSentence") {
    const result = {};
    q.blanks.forEach(blank => {
      const input = document.querySelector(`input[name="${blank.id}"]`);
      result[blank.id] = input ? input.value.trim() : "";
    });
    return result;

  } else if (q.type === "multi") {
    const result = {};
    q.options.forEach(opt => {
      const input = document.getElementById(`multi-${q.id}-${opt.id}`);
      result[opt.id] = input ? input.checked : false;
    });
    return result;

  } else if (q.type === "dragLabel") {
    const result = {};
    const qDef = questions[currentIndex];
    qDef.targets.forEach(t => {
      const targetDiv = document.querySelector(
        `.drag-target-box[data-target-id="${t.id}"]`
      );
      result[t.id] = targetDiv ? (targetDiv.dataset.labelId || null) : null;
    });
    return result;

  } else {
    const radios = document.querySelectorAll('input[name="problem"]');
    for (const r of radios) {
      if (r.checked) return r.value;
    }
    return null;
  }
}


function saveCurrentAnswer() {
  const q = questions[currentIndex];
  const ans = getSelectedAnswer();

  if (q.type === "fill" || q.type === "fillSentence") {
    const values = Object.values(ans);
    const anyFilled = values.some(v => v && v.trim() !== "");
    if (!anyFilled) return;
  } else if (q.type === "matrix") {
    const values = Object.values(ans);
    const anyChosen = values.some(v => v === "T" || v === "F");
    if (!anyChosen) return;
  } else if (q.type === "multi") {
    const anyChecked = Object.values(ans).some(v => v);
    if (!anyChecked) return;
  } else if (q.type === "dragLabel") {
    const values = Object.values(ans);
    const anyPlaced = values.some(v => v);
    if (!anyPlaced) return;
  } else if (!ans) {
    return;
  }

  studentAnswers[currentIndex] = ans;
}


async function saveCurrentQuestionToSupabase() {
  const rawStudent = localStorage.getItem("pythCurrentStudent");
  if (!rawStudent) return;

  const { teacher, student } = JSON.parse(rawStudent);
  const q = questions[currentIndex];
  const state = questionStates[currentIndex];

  const record = {
    teacher,
    studentName: student,
    questionId: q.id,
    sbg: q.sbg,
    answer: studentAnswers[currentIndex],
    attempts: state.attempts,
    correct: !!state.correct,
    created_at: new Date().toISOString()
  };

  await savePythAttemptsToSupabase([record]);
}



// ==============================
// PROGRESS / NAV UI HELPERS
// ==============================
function updateProgress() {
  const answered = studentAnswers.filter(ans => ans !== null).length;
  const total = questions.length;
  const percent = (answered / total) * 100;
  const progressTextEl = document.getElementById("progress-text");
  if (progressTextEl) {
    progressTextEl.textContent = `${answered}/${total} Complete`;
  }
  progressBar.style.width = `${percent}%`;
}


function highlightNavigator() {
  const buttons = document.querySelectorAll(".item-button");
  buttons.forEach((btn, index) => {
    btn.classList.toggle("current", index === currentIndex);
    btn.classList.toggle("answered", studentAnswers[index] !== null);
  });
}


function updateButtons() {
  nextBtn.disabled = currentIndex === questions.length - 1;
  if (prevBtn) {
    prevBtn.disabled = currentIndex === 0;
  }
}



// ==============================
// SUBMIT PRACTICE (FINAL ATTEMPT)
// ==============================
function finishPractice() {
  const rawStudent = localStorage.getItem("pythCurrentStudent");
  const currentStudent = rawStudent ? JSON.parse(rawStudent) : null;
  if (!currentStudent) return;

  questions.forEach((q, index) => {
    if (studentAnswers[index] !== null) {
      evaluateAnswerAt(index);
    }
  });

  const attemptId = createAttemptId();

  const records = questions.map((q, index) => ({
    teacher: currentStudent.teacher,
    studentName: currentStudent.student,
    questionId: q.id,
    sbg: q.sbg,
    answer: studentAnswers[index],
    attempts: questionStates[index].attempts,
    correct: !!questionStates[index].correct,
    attempt_id: attemptId,
    created_at: new Date().toISOString()
  }));

  records.forEach(saveLocalAttempt);
  savePythAttemptsToSupabase(records);

  const total = questions.length;
  const correctCount = questionStates.filter(s => s.correct === true).length;
  const percentCorrect = total ? Math.round((correctCount / total) * 100) : 0;

  let html = "";
  html += `<h2>Practice Results</h2>`;
  html += `<p>You answered ${correctCount} out of ${total} correctly (${percentCorrect}%).</p>`;
  html += `<h3>Item Analysis</h3>`;
  html += `<table><thead><tr><th>Q</th><th>SBG</th><th>Correct?</th></tr></thead><tbody>`;
  questionStates.forEach((s, index) => {
    const q = questions[index];
    html += `<tr><td>${index + 1}</td><td>${q.sbg}</td><td>${
      s.correct ? "✔" : "✘"
    }</td></tr>`;
  });
  html += `</tbody></table>`;
  html += `<button id="new-attempt-btn">Start New Attempt</button>`;

  if (summaryScreen) {
    practiceScreen.style.display = "none";
    summaryScreen.innerHTML = html;
    summaryScreen.style.display = "block";

    const newAttemptBtn = document.getElementById("new-attempt-btn");
    if (newAttemptBtn) {
      newAttemptBtn.addEventListener("click", () => {
        studentAnswers.fill(null);
        questionStates.forEach(s => {
          s.answered = false;
          s.correct = null;
          s.attempts = 0;
        });
        currentIndex = 0;

        summaryScreen.style.display = "none";
        practiceScreen.style.display = "block";
        renderQuestion();
        updateProgress();
      });
    }
  }
}



// ==============================
// GRADING HELPER
// ==============================
function evaluateAnswerAt(index) {
  const q = questions[index];
  const ans = studentAnswers[index];

  let isCorrect = false;

  if (q.type === "matrix") {
    if (ans && typeof ans === "object") {
      isCorrect = q.statements.every(stmt => ans[stmt.id] === stmt.correct);
    }
  } else if (q.type === "fill" || q.type === "fillSentence") {
    if (ans && typeof ans === "object") {
      if (q.id === 11) {
        const first = (ans["a"] || "").trim();
        const second = (ans["b"] || "").trim();
        isCorrect =
          (first === "a" && second === "b") ||
          (first === "b" && second === "a");
      } else {
        isCorrect = q.blanks.every(blank => {
          const given = (ans[blank.id] || "").trim();
          return given === blank.correct;
        });
      }
    }
  } else if (q.type === "multi") {
    if (ans && typeof ans === "object") {
      isCorrect = q.options.every(opt => {
        const shouldBeChecked = !!opt.correct;
        const isChecked = !!ans[opt.id];
        return shouldBeChecked === isChecked;
      });
    }
  } else if (q.type === "dragLabel") {
    if (ans && typeof ans === "object") {
      isCorrect = q.targets.every(t => ans[t.id] === t.correctLabelId);
    }
  } else {
    isCorrect = ans === q.correct;
  }

  const state = questionStates[index];
  state.attempts += 1;
  state.correct = isCorrect;

  return isCorrect;
}



// ==============================
// BUTTON EVENT HANDLERS
// ==============================
checkBtn.addEventListener("click", () => {
  saveCurrentAnswer();
  const isCorrect = evaluateAnswerAt(currentIndex);

  if (isCorrect) {
    feedback.textContent = "Correct!";
    feedback.className = "correct";
  } else {
    feedback.textContent = "Try again.";
    feedback.className = "incorrect";
  }

  saveCurrentQuestionToSupabase();
  updateProgress();
  highlightNavigator();
});


hintBtn.addEventListener("click", () => {
  const q = questions[currentIndex];
  if (q.hint) {
    feedback.innerHTML = q.hint;
    feedback.className = "hint";
  }
});


if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    saveCurrentAnswer();
    if (currentIndex > 0) {
      currentIndex--;
      renderQuestion();
    }
  });
}


nextBtn.addEventListener("click", () => {
  saveCurrentAnswer();
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    renderQuestion();
  }
});


if (submitPracticeBtn) {
  submitPracticeBtn.addEventListener("click", () => {
    finishPractice();
  });
}


const saveProgressBtn = document.getElementById("save-progress");

if (saveProgressBtn) {
  saveProgressBtn.addEventListener("click", async () => {
    const rawStudent = localStorage.getItem("pythCurrentStudent");
    const currentStudent = rawStudent ? JSON.parse(rawStudent) : null;
    if (!currentStudent) return;

    const records = questions.map((q, index) => ({
      teacher: currentStudent.teacher,
      studentName: currentStudent.student,
      questionId: q.id,
      sbg: q.sbg,
      answer: studentAnswers[index],
      attempts: questionStates[index].attempts,
      correct: !!questionStates[index].correct,
      attempt_id: createAttemptId(),
      created_at: new Date().toISOString()
    }));

    savePythAttemptsToSupabase(records);
    feedback.textContent = "Progress saved.";
    feedback.className = "hint";
  });
}



// ==============================
// INITIALIZE ON DOM READY
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  loadLocalData();
  populateTeachers();
  restoreLoginIfPresent();
});
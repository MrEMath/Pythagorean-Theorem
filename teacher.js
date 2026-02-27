// ---------------- TEACHER CONFIG ----------------
const TEACHER_PASSWORDS = {
  Englade: "englade2026",
  Russell: "russell2026",
  Miller: "miller2026",
  Massengill: "massengill2026",
  Clark: "clark2026"
};

let currentTeacher = null;
let allRecords = [];
let currentStudentName = null;

// ---------------- STUDENT DATA RESET ----------------
async function resetStudentData(teacher, studentName) {
  if (typeof window.supabasePythClient === "undefined") return;

  const confirmReset = window.confirm(
    `Reset ALL attempts for ${studentName}? This cannot be undone.`
  );
  if (!confirmReset) return;

  const { error } = await window.supabasePythClient
    .from("pythagorean_attempts")
    .delete()
    .eq("teacher", teacher)
    .eq("student_name", studentName);

  if (error) {
    console.error("Error resetting student attempts", error);
    alert("There was an error resetting this student. Please try again.");
    return;
  }

  await loadData(currentTeacher);
  // caller will re-render dashboard with currentTeacher context
}

// ---------------- DELETE ONE ATTEMPT (BUCKET) ----------------
async function deleteAttempt(teacher, studentName, attemptIdMs) {
  if (typeof window.supabasePythClient === "undefined") return;

  const confirmDelete = window.confirm(
    `Delete this attempt for ${studentName}? This cannot be undone.`
  );
  if (!confirmDelete) return;

  const { error } = await window.supabasePythClient
    .from("pythagorean_attempts")
    .delete()
    .eq("teacher", teacher)
    .eq("student_name", studentName)
    .gte("created_at", new Date(Number(attemptIdMs)).toISOString())
    .lt(
      "created_at",
      new Date(Number(attemptIdMs) + 60 * 1000).toISOString()
    );

  if (error) {
    console.error("Error deleting attempt", error);
    alert("There was an error deleting this attempt. Please try again.");
    return;
  }

  await loadData(currentTeacher);
  renderDashboard(
    document.getElementById("overall-stats"),
    document.querySelector("#item-analysis-table tbody"),
    document.getElementById("student-select"),
    document.getElementById("student-summary")
  );

  const strip = document.getElementById("student-item-strip");
  if (strip) strip.innerHTML = "";
  const attemptSelect = document.getElementById("attempt-select");
  if (attemptSelect) {
    attemptSelect.value = "";
    attemptSelect.innerHTML = `<option value="">Select an attempt</option>`;
  }
}

// ---------------- DATA LOAD FROM SUPABASE (PAGED + PER TEACHER) ----------------
async function loadData(teacherName = null) {
  if (typeof window.supabasePythClient === "undefined") {
    allRecords = [];
    return;
  }

  const pageSize = 1000;
  let offset = 0;
  let allRows = [];

  while (true) {
    let query = window.supabasePythClient
      .from("pythagorean_attempts")
      .select("*")
      .order("created_at", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (teacherName) {
      query = query.eq("teacher", teacherName);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading attempts from Supabase", error);
      allRecords = [];
      return;
    }

    if (!data || data.length === 0) break;

    allRows = allRows.concat(data);

    if (data.length < pageSize) break;
    offset += pageSize;
  }

  console.log("triangle data length", allRows.length);

  allRecords = (allRows || []).map((row) => ({
    teacher: row.teacher,
    studentName: row.student_name,
    questionId: row.question_id,
    sbg: row.sbg,
    answer: row.answer,
    attempts: row.attempts,
    correct: row.correct,
    timestamp: row.created_at,
    attempt_id: row.attempt_id || null
  }));
}

// collapse timestamps to the minute so attempts are not split
function getAttemptKey(ts) {
  const d = new Date(ts);
  d.setSeconds(0, 0);
  return d.getTime();
}

// ---------------- DOM READY ----------------
document.addEventListener("DOMContentLoaded", async () => {
  const teacherNameEl = document.getElementById("teacher-name");
  const teacherPasswordEl = document.getElementById("teacher-password");
  const teacherLoginBtn = document.getElementById("teacher-login-btn");
  const teacherLoginError = document.getElementById("teacher-login-error");

  const loginSection = document.getElementById("teacher-login");
  const dashboardSection = document.getElementById("teacher-dashboard");

  const overallStatsEl = document.getElementById("overall-stats");
  const itemAnalysisBody = document.querySelector("#item-analysis-table tbody");
  const studentSelect = document.getElementById("student-select");
  const studentSummaryEl = document.getElementById("student-summary");
  const attemptSelect = document.getElementById("attempt-select");

  const resetBtn = document.getElementById("reset-student-btn");
  const refreshBtn = document.getElementById("refresh-data-btn");
  const deleteAttemptBtn = document.getElementById("delete-attempt-btn");

  // initial big load no longer needed; data loads after login per teacher

  let currentStudentItems = [];
  let currentItemIndex = 0;
  updateItemFlipcard();

  // RESET BUTTON
  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      if (!currentTeacher || !currentStudentName) {
        alert("Select a student first.");
        return;
      }
      await resetStudentData(currentTeacher, currentStudentName);
      renderDashboard(
        overallStatsEl,
        itemAnalysisBody,
        studentSelect,
        studentSummaryEl
      );
      // clear student-specific UI
      studentSummaryEl.innerHTML = "";
      attemptSelect.innerHTML = `<option value="">Select an attempt</option>`;
      const strip = document.getElementById("student-item-strip");
      if (strip) strip.innerHTML = "";
      currentStudentItems = [];
      updateItemFlipcard();
    });
  }

  // REFRESH BUTTON
  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      await loadData(currentTeacher);
      if (currentTeacher) {
        renderDashboard(
          overallStatsEl,
          itemAnalysisBody,
          studentSelect,
          studentSummaryEl
        );
      }
    });
  }

  // DELETE ATTEMPT BUTTON
  if (deleteAttemptBtn) {
    deleteAttemptBtn.addEventListener("click", () => {
      const attemptId = attemptSelect.value;
      const studentName = attemptSelect.studentName;

      if (!currentTeacher || !studentName) {
        alert("Select a student first.");
        return;
      }
      if (!attemptId) {
        alert("Select an attempt to delete.");
        return;
      }

      deleteAttempt(currentTeacher, studentName, attemptId);
    });
  }

  // TEACHER LOGIN
  teacherLoginBtn.addEventListener("click", async () => {
    const name = teacherNameEl.value;
    const pwd = teacherPasswordEl.value.trim();

    if (!name || !pwd) {
      teacherLoginError.textContent = "Select your name and enter password.";
      return;
    }

    if (TEACHER_PASSWORDS[name] !== pwd) {
      teacherLoginError.textContent = "Incorrect password.";
      return;
    }

    teacherLoginError.textContent = "";
    currentTeacher = name;

    await loadData(currentTeacher);

    loginSection.style.display = "none";
    dashboardSection.style.display = "block";

    document.getElementById("dashboard-title").textContent =
      `Teacher Dashboard – ${name}`;

    renderDashboard(
      overallStatsEl,
      itemAnalysisBody,
      studentSelect,
      studentSummaryEl
    );
  });

  // Student dropdown change
  studentSelect.addEventListener("change", () => {
    const name = studentSelect.value;
    currentStudentName = name;

    studentSummaryEl.innerHTML = "";
    attemptSelect.innerHTML = "";

    const strip = document.getElementById("student-item-strip");
    if (strip) strip.innerHTML = "";

    if (!name) {
      currentStudentItems = [];
      updateItemFlipcard();
      return;
    }

    renderStudentSummaryAndAttempts(name, studentSummaryEl, attemptSelect);
    computeStudentItemAccuracy(name);
  });

  // Attempt dropdown change
  attemptSelect.addEventListener("change", () => {
    const attemptId = attemptSelect.value;
    const studentName = attemptSelect.studentName;

    const strip = document.getElementById("student-item-strip");
    if (!strip) return;

    if (!attemptId || !studentName) {
      strip.innerHTML = "";
      return;
    }

    renderStudentAttemptItems(studentName, attemptId);
  });

  // Flipcard nav buttons
  const prevItemBtn = document.getElementById("prev-item-btn");
  const nextItemBtn = document.getElementById("next-item-btn");

  if (prevItemBtn && nextItemBtn) {
    prevItemBtn.addEventListener("click", () => {
      if (!currentStudentItems.length) return;
      currentItemIndex =
        (currentItemIndex - 1 + currentStudentItems.length) %
        currentStudentItems.length;
      updateItemFlipcard();
    });

    nextItemBtn.addEventListener("click", () => {
      if (!currentStudentItems.length) return;
      currentItemIndex =
        (currentItemIndex + 1) % currentStudentItems.length;
      updateItemFlipcard();
    });
  }

  // expose for other helpers
  window.computeStudentItemAccuracy = function (studentName) {
    const records = allRecords.filter(
      (r) => r.teacher === currentTeacher && r.studentName === studentName
    );

    const byQuestion = {};
    records.forEach((r) => {
      const qid = r.questionId;
      if (!byQuestion[qid]) byQuestion[qid] = [];
      byQuestion[qid].push(r);
    });

    currentStudentItems = Object.keys(byQuestion)
      .sort((a, b) => Number(a) - Number(b))
      .map((qid) => {
        const group = byQuestion[qid];
        const correct = group.filter((r) => r.correct).length;
        const total = group.length || 1;
        const percent = Math.round((correct / total) * 100);
        const sbg = group[0].sbg;
        return { questionId: Number(qid), sbg, percent };
      });

    currentItemIndex = 0;
    updateItemFlipcard();
  };

  // flipcard updater
  function updateItemFlipcard() {
    const ITEMSCREENSHOTS = {
      0: "items-images/0.png",
      1: "items-images/1.png",
      2: "items-images/2.png",
      3: "items-images/3.png",
      4: "items-images/4.png",
      5: "items-images/5.png",
      6: "items-images/6.png",
      7: "items-images/7.png",
      8: "items-images/8.png",
      9: "items-images/9.png",
      10: "items-images/10.png",
      11: "items-images/11.png",
      12: "items-images/12.png",
      13: "items-images/13.png",
      14: "items-images/14.png",
      15: "items-images/15.png",
      16: "items-images/16.png",
      17: "items-images/17.png",
      18: "items-images/18.png",
      19: "items-images/19.png",
      20: "items-images/20.png",
      21: "items-images/21.png",
      22: "items-images/22.png",
      23: "items-images/23.png",
      24: "items-images/24.png",
      25: "items-images/25.png",
      26: "items-images/26.png",
      27: "items-images/27.png",
      28: "items-images/28.png",
      29: "items-images/29.png",
      30: "items-images/30.png"
    };

    const imgEl = document.getElementById("item-screenshot");
    const zoomPopupImg = document.querySelector(".flipcard-zoom-popup img");
    const percentEl = document.getElementById("accuracy-percent");
    const circleEl = document.getElementById("accuracy-circle");

    if (!imgEl || !percentEl || !circleEl) return;

    if (!currentStudentItems || !currentStudentItems.length) {
      const placeholderSrc = ITEMSCREENSHOTS[0];
      imgEl.src = placeholderSrc;
      imgEl.alt = "Select a student to view item performance.";
      if (zoomPopupImg) {
        zoomPopupImg.src = placeholderSrc;
        zoomPopupImg.alt = "Select a student to view item performance.";
      }
      percentEl.textContent = "--";
      circleEl.style.borderColor = "#ccc";
      percentEl.style.color = "#ccc";
      return;
    }

    const { questionId, percent, sbg } = currentStudentItems[currentItemIndex];
    const src = ITEMSCREENSHOTS[questionId] || ITEMSCREENSHOTS[0];
    imgEl.src = src;
    imgEl.alt = `Question ${questionId} SBG ${sbg}`;

    if (zoomPopupImg) {
      zoomPopupImg.src = src;
      zoomPopupImg.alt = `Zoomed question ${questionId} SBG ${sbg}`;
    }

    percentEl.textContent = `${percent}%`;

    let color = "#c51d34";
    if (percent >= 90) color = "#0067A5";
    else if (percent >= 80) color = "#00A86B";
    else if (percent >= 60) color = "#FFBF00";

    circleEl.style.borderColor = color;
    percentEl.style.color = color;
  }
});

// ---------------- DASHBOARD ----------------
function renderDashboard(
  overallStatsEl,
  itemAnalysisBody,
  studentSelect,
  studentSummaryEl
) {
  const teacherRecords = allRecords.filter(
    (r) => r.teacher === currentTeacher
  );

  const latestByStudentQuestion = buildLatestByStudentQuestion(teacherRecords);
  buildSbgQuestionCards(teacherRecords, latestByStudentQuestion);

  const studentNames = [
    ...new Set(teacherRecords.map((r) => r.studentName))
  ];
  const attemptIds = [
    ...new Set(teacherRecords.map((r) => getAttemptKey(r.timestamp)))
  ];

  const correctCount = teacherRecords.filter((r) => r.correct).length;
  const percentCorrect = teacherRecords.length
    ? Math.round((correctCount / teacherRecords.length) * 100)
    : 0;

  const byStudent = {};
  teacherRecords.forEach((r) => {
    if (!byStudent[r.studentName]) byStudent[r.studentName] = [];
    byStudent[r.studentName].push(r);
  });

  const sbgCounts = {};
  Object.keys(byStudent).forEach((name) => {
    const level = computeStudentCurrentSbg(byStudent[name]);
    const key = level.toString();
    if (!sbgCounts[key]) sbgCounts[key] = 0;
    sbgCounts[key] += 1;
  });

  const bands = {
    "0.0-0.5": 0,
    "1.0-1.5": 0,
    "2.0-2.5": 0,
    "3.0": 0
  };

  Object.entries(sbgCounts).forEach(([levelStr, count]) => {
    const level = parseFloat(levelStr);
    if (level <= 0.5) bands["0.0-0.5"] += count;
    else if (level <= 1.5) bands["1.0-1.5"] += count;
    else if (level <= 2.5) bands["2.0-2.5"] += count;
    else bands["3.0"] += count;
  });

  renderSbgDoughnut(bands);

  const sbgSummaryEl = document.getElementById("sbg-summary");
  if (sbgSummaryEl) {
    let sbgHtml = "";
    const totalStudents = Object.keys(byStudent).length || 1;
    Object.keys(sbgCounts)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((key) => {
        const count = sbgCounts[key];
        const pct = Math.round((count / totalStudents) * 100);
        sbgHtml += `
          <div class="sbg-row">
            <span class="sbg-label">Level ${key}</span>
            <div class="sbg-bar">
              <div class="sbg-bar-fill" style="width:${pct}%"></div>
            </div>
            <span class="sbg-percent">${pct}%</span>
          </div>
        `;
      });
    sbgSummaryEl.innerHTML = sbgHtml;
    sbgSummaryEl.style.display = "block";
  }

  overallStatsEl.innerHTML = `
    <p>Students: <strong>${studentNames.length}</strong></p>
    <p>Total practice attempts: <strong>${attemptIds.length}</strong></p>
    <p>Average accuracy (all items): <strong>${percentCorrect}%</strong></p>
  `;

  if (itemAnalysisBody) {
    renderItemAnalysis(teacherRecords, itemAnalysisBody);
    renderItemBarChart(teacherRecords);
  }

  populateStudentDropdown(studentNames, studentSelect);
  studentSummaryEl.innerHTML = "";
  const strip = document.getElementById("student-item-strip");
  if (strip) strip.innerHTML = "";
}

// ---------------- SBG DOUGHNUT ----------------
let sbgDoughnutChart = null;

function renderSbgDoughnut(bands) {
  const ctx = document.getElementById("sbg-doughnut");
  if (!ctx) return;

  const labels = [
    "SBG 0.0–0.5",
    "SBG 1.0–1.5",
    "SBG 2.0–2.5",
    "SBG 3.0"
  ];
  const data = [
    bands["0.0-0.5"],
    bands["1.0-1.5"],
    bands["2.0-2.5"],
    bands["3.0"]
  ];
  const colors = ["#F04923", "#FFBF00", "#00A86B", "#0067A5"];

  if (sbgDoughnutChart) {
    sbgDoughnutChart.data.datasets[0].data = data;
    sbgDoughnutChart.update();
    return;
  }

  sbgDoughnutChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: "#ffffff",
          borderWidth: 2
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
          align: "center",
          labels: {
            usePointStyle: true,
            boxWidth: 12,
            boxHeight: 12,
            padding: 16
          }
        },
        datalabels: {
          color: "#ffffff",
          font: {
            weight: "bold"
          },
          formatter(value, context) {
            const dataset = context.dataset.data;
            const sum = dataset.reduce((a, b) => a + b, 0) || 1;
            const pct = (value / sum) * 100;
            return value ? `${pct.toFixed(0)}%` : "";
          }
        }
      },
      cutout: "60%"
    }
  });
}

// ---------------- CLASS ITEM BAR CHART ----------------
let itemBarChart = null;

function renderItemBarChart(records) {
  const ctx = document.getElementById("item-bar-chart");
  if (!ctx) return;

  if (!records || !records.length) {
    ctx.parentElement.innerHTML = "<p>No item data yet.</p>";
    return;
  }

  const byQuestion = {};
  records.forEach((r) => {
    const qid = r.questionId;
    if (!byQuestion[qid]) byQuestion[qid] = [];
    byQuestion[qid].push(r);
  });

  const labels = [];
  const percents = [];
  const sbgLabels = [];

  Object.keys(byQuestion)
    .sort((a, b) => Number(a) - Number(b))
    .forEach((qid) => {
      const group = byQuestion[qid];
      const correct = group.filter((r) => r.correct).length;
      const total = group.length || 1;
      const percent = Math.round((correct / total) * 100);
      labels.push(`Q${qid}`);
      percents.push(percent);
      sbgLabels.push(group[0].sbg);
    });

  const bgColors = sbgLabels.map((level) => {
    if (level <= 0.5) return "#F04923";
    if (level <= 1.5) return "#FFBF00";
    if (level <= 2.5) return "#00A86B";
    return "#0067A5";
  });

  if (itemBarChart) {
    itemBarChart.data.labels = labels;
    itemBarChart.data.datasets[0].data = percents;
    itemBarChart.data.datasets[0].backgroundColor = bgColors;
    itemBarChart.update();
    return;
  }

  itemBarChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Correct",
          data: percents,
          backgroundColor: bgColors
        }
      ]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(context) {
              const idx = context.dataIndex;
              return `${labels[idx]} SBG ${sbgLabels[idx]} – ${percents[idx]}%`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback(v) {
              return v;
            }
          }
        }
      }
    }
  });
}

// ---------------- SBG QUESTION CARDS ----------------
function buildSbgQuestionCards(teacherRecords, latestByStudentQuestion) {
  const container = document.getElementById("sbg-question-cards");
  if (!container) return;

  container.innerHTML = "";

  const sbgGroups = {};
  teacherRecords.forEach((r) => {
    const sbgKey = r.sbg.toString();
    const qid = r.questionId;
    if (!sbgGroups[sbgKey]) sbgGroups[sbgKey] = {};
    if (!sbgGroups[sbgKey][qid]) sbgGroups[sbgKey][qid] = [];
    sbgGroups[sbgKey][qid].push(r);
  });

  Object.keys(sbgGroups)
    .sort((a, b) => Number(a) - Number(b))
    .forEach((sbgKey) => {
      const questions = sbgGroups[sbgKey];
      const card = document.createElement("div");
      card.className = "sbg-card";

      let inner = `<div class="sbg-card-header">Level ${sbgKey}</div>`;
      inner += `<div class="sbg-card-questions">`;

      Object.keys(questions)
        .sort((a, b) => Number(a) - Number(b))
        .forEach((qid) => {
          const qRecords = questions[qid];
          const correct = qRecords.filter((r) => r.correct).length;
          const total = qRecords.length || 1;
          const pct = total ? Math.round((correct / total) * 100) : 0;

          const byStudent = {};
          qRecords.forEach((r) => {
            const key = `${r.studentName}-${r.questionId}`;
            const latest = latestByStudentQuestion[key];
            if (!latest) return;
            if (!byStudent[latest.studentName]) {
              byStudent[latest.studentName] = latest;
            }
          });

          const students = Object.values(byStudent).sort((a, b) =>
            a.studentName.localeCompare(b.studentName)
          );

          inner += `<div class="sbg-question-tile">
            <div class="sbg-question-header">
              <span>Q${qid}</span>
              <span>${pct}% correct</span>
            </div>
            <div class="sbg-question-students">
              ${students
                .map(
                  (r) =>
                    `<div class="sbg-question-student">${r.studentName} ${
                      r.correct ? "✔" : "✘"
                    }</div>`
                )
                .join("")}
            </div>
          </div>`;
        });

      inner += `</div>`;
      card.innerHTML = inner;
      container.appendChild(card);
    });
}

// ---------------- ITEM ANALYSIS TABLE ----------------
function renderItemAnalysis(records, itemAnalysisBody) {
  itemAnalysisBody.innerHTML = "";

  const byQuestion = {};
  records.forEach((r) => {
    const qid = r.questionId;
    if (!byQuestion[qid]) byQuestion[qid] = [];
    byQuestion[qid].push(r);
  });

  Object.keys(byQuestion)
    .sort((a, b) => a - b)
    .forEach((qid) => {
      const group = byQuestion[qid];
      const correct = group.filter((r) => r.correct).length;
      const total = group.length || 1;
      const percent = total ? Math.round((correct / total) * 100) : 0;
      const sbgLevel = group[0].sbg;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${qid}</td>
        <td>${sbgLevel}</td>
        <td>${percent}%</td>
      `;
      itemAnalysisBody.appendChild(tr);
    });
}

function populateStudentDropdown(studentNames, studentSelect) {
  studentSelect.innerHTML = `<option value="">Select a student</option>`;
  studentNames
    .sort((a, b) => a.localeCompare(b))
    .forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      studentSelect.appendChild(opt);
    });
}

function buildLatestByStudentQuestion(teacherRecords) {
  const latest = {};
  teacherRecords.forEach((r) => {
    const key = `${r.studentName}-${r.questionId}`;
    if (!latest[key]) {
      latest[key] = r;
    } else if (
      getAttemptKey(r.timestamp) > getAttemptKey(latest[key].timestamp)
    ) {
      latest[key] = r;
    }
  });
  return latest;
}

// ---------------- STUDENT DETAIL ----------------
function renderStudentSummaryAndAttempts(
  studentName,
  studentSummaryEl,
  attemptSelect
) {
  const records = allRecords.filter(
    (r) => r.teacher === currentTeacher && r.studentName === studentName
  );

  if (!records.length) {
    studentSummaryEl.textContent = "No data for this student.";
    return;
  }

  const byAttempt = {};
  records.forEach((r) => {
    const attemptId = r.attempt_id || getAttemptKey(r.timestamp);
    if (!byAttempt[attemptId]) byAttempt[attemptId] = [];
    byAttempt[attemptId].push(r);
  });

  const attemptIds = Object.keys(byAttempt).sort();
  const totalAttempts = attemptIds.length;

  const latestId = attemptIds[attemptIds.length - 1];
  const latest = byAttempt[latestId];
  const correctItems = latest.filter((r) => r.correct);

  const currentSbgLevel = correctItems.length
    ? (
        correctItems.reduce((sum, r) => sum + r.sbg, 0) /
        correctItems.length
      ).toFixed(2)
    : "0.0";

  studentSummaryEl.innerHTML = `
    <p>Student: <strong>${studentName}</strong></p>
    <p>Practice attempts: <strong>${totalAttempts}</strong></p>
    <p>Current SBG level: <strong>${currentSbgLevel}</strong></p>
  `;

  attemptSelect.innerHTML = `<option value="">Select an attempt</option>`;
  attemptIds.forEach((id) => {
    const date = new Date(Number(id));
    const label = date.toLocaleString();
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = label;
    attemptSelect.appendChild(opt);
  });
  attemptSelect.studentName = studentName;
}

function renderStudentAttemptItems(studentName, attemptId) {
  const records = allRecords.filter(
    (r) =>
      r.teacher === currentTeacher &&
      r.studentName === studentName &&
      getAttemptKey(r.timestamp) === Number(attemptId)
  );

  const strip = document.getElementById("student-item-strip");
  if (!strip) return;

  strip.innerHTML = "";

  if (!records.length) {
    strip.textContent = "No items for this attempt.";
    return;
  }

  const bySbg = {};
  records
    .sort((a, b) => a.sbg - b.sbg || a.questionId - b.questionId)
    .forEach((r) => {
      const key = r.sbg.toFixed(1);
      if (!bySbg[key]) bySbg[key] = [];
      bySbg[key].push(r);
    });

  Object.keys(bySbg)
    .sort((a, b) => parseFloat(a) - parseFloat(b))
    .forEach((levelKey) => {
      const group = bySbg[levelKey];

      const card = document.createElement("div");
      card.className = `sbg-strip-card ${sbgStripClass(parseFloat(levelKey))}`;

      const header = document.createElement("div");
      header.className = "sbg-strip-header";
      header.textContent = `SBG ${levelKey}`;
      card.appendChild(header);

      const row = document.createElement("div");
      row.className = "sbg-strip-items";

      group.forEach((r) => {
        const idxSpan = document.createElement("span");
        idxSpan.className = "index";
        idxSpan.textContent = r.questionId;
        row.appendChild(idxSpan);

        const box = document.createElement("div");
        box.className = "box";
        box.textContent = r.correct ? "✔" : "✘";
        row.appendChild(box);
      });

      card.appendChild(row);
      strip.appendChild(card);
    });
}

function sbgStripClass(level) {
  if (level <= 0.5) return "sbg-strip-0-5";
  if (level <= 1.0) return "sbg-strip-1-0";
  if (level <= 1.5) return "sbg-strip-1-5";
  if (level <= 2.0) return "sbg-strip-2-0";
  if (level <= 2.5) return "sbg-strip-2-5";
  return "sbg-strip-3-0";
}

function computeStudentCurrentSbg(recordsForStudent) {
  const byAttempt = {};
  recordsForStudent.forEach((r) => {
    const attemptId = r.attempt_id || getAttemptKey(r.timestamp);
    if (!byAttempt[attemptId]) byAttempt[attemptId] = [];
    byAttempt[attemptId].push(r);
  });

  const attemptIds = Object.keys(byAttempt).sort();
  const latest = byAttempt[attemptIds[attemptIds.length - 1]];
  const correctItems = latest.filter((r) => r.correct);

  if (!correctItems.length) return 0;

  const avgSbg =
    correctItems.reduce((sum, r) => sum + r.sbg, 0) / correctItems.length;
  return Number(avgSbg.toFixed(1));
}

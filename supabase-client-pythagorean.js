// supabase-client-pythagorean.js

const SUPABASE_URL = "https://xsmhhduixpyotdhsjizr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzbWhoZHVpeHB5b3RkaHNqaXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NDU0NTYsImV4cCI6MjA4NjIyMTQ1Nn0.BKVW6GfqJfDfp1UKPMNjehZ4UcF_D7ivLYmrXY12_60";

window.supabasePythClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Save helper for Pythagorean attempts
async function savePythagoreanAttemptsToSupabase(records) {
  if (typeof window.supabasePythClient === "undefined") {
    console.error("Pythagorean client is undefined");
    return;
  }

  if (!records || !records.length) {
    console.warn("No Pythagorean records to save");
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
    alert("There was an error saving your practice. Please tell your teacher.");
  } else {
    console.log("Inserted pythagorean attempts", records);
  }
}


const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let students = [
  { id: 1, name: "Aarav Sharma", rollNo: "101", course: "Computer Science" },
  { id: 2, name: "Priya Patel", rollNo: "102", course: "Information Technology" }
];

let nextId = 3;

app.get("/api/students", (req, res) => {
  res.json(students);
});

app.post("/api/students", (req, res) => {
  const { name, rollNo, course } = req.body;

  if (!name?.trim() || !rollNo?.trim() || !course?.trim()) {
    return res.status(400).json({ error: "All fields are required." });
  }

  if (students.some(student => student.rollNo === rollNo.trim())) {
    return res.status(409).json({ error: "Roll number already exists." });
  }

  const student = {
    id: nextId++,
    name: name.trim(),
    rollNo: rollNo.trim(),
    course: course.trim()
  };

  students.push(student);
  res.status(201).json(student);
});

app.put("/api/students/:id", (req, res) => {
  const student = students.find(s => s.id === Number(req.params.id));

  if (!student) {
    return res.status(404).json({ error: "Student not found." });
  }

  const { name, rollNo, course } = req.body;

  if (!name?.trim() || !rollNo?.trim() || !course?.trim()) {
    return res.status(400).json({ error: "All fields are required." });
  }

  if (students.some(s => s.id !== student.id && s.rollNo === rollNo.trim())) {
    return res.status(409).json({ error: "Roll number already exists." });
  }

  Object.assign(student, {
    name: name.trim(),
    rollNo: rollNo.trim(),
    course: course.trim()
  });

  res.json(student);
});

app.delete("/api/students/:id", (req, res) => {
  const index = students.findIndex(s => s.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: "Student not found." });
  }

  students.splice(index, 1);
  res.json({ message: "Student deleted successfully." });
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Student Management System running on port ${PORT}`);
  });
}

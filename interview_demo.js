const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const API_KEY = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const skills = {
  javascript: [
    "Can you explain the concept of closures in JavaScript?",
    "How does the 'this' keyword work in JavaScript?",
    "What's the difference between synchronous and asynchronous code in JavaScript?",
    "Can you explain how prototypal inheritance works?",
    "What are promises and how do they differ from callbacks?"
  ],
  python: [
    "What are the key features of Python?",
    "How does Python handle memory management?",
    "Can you explain list comprehensions in Python?",
    "What's the difference between deep and shallow copy?",
    "How do you handle exceptions in Python?"
  ],
  civil_engineering: [
    "Can you discuss the importance of site selection in construction projects?",
    "What are the key factors in the design of a sustainable building?",
    "How do you calculate the load-bearing capacity of a foundation?",
    "What is the difference between pre-stressed and post-tensioned concrete?",
    "What are the challenges in retrofitting older buildings for earthquake resistance?"
  ]
};

let conversationHistory = [];
let interviewStartTime;
let currentQuestionIndex = 0;
let currentSkill;

app.post('/start-interview', (req, res) => {
  const { skill } = req.body;
  if (skills[skill]) {
    currentSkill = skill;
    interviewStartTime = Date.now();
    conversationHistory = [];
    currentQuestionIndex = 0;
    res.json({ message: `Interview started for ${skill} position`, question: "Tell me about your background and experience with " + skill });
  } else {
    res.status(400).json({ error: "Invalid skill selected" });
  }
});

app.post('/answer', async (req, res) => {
  const { answer } = req.body;
  conversationHistory.push(`Candidate: ${answer}`);
  
  let interviewerResponse;
  if (currentQuestionIndex < skills[currentSkill].length) {
    interviewerResponse = skills[currentSkill][currentQuestionIndex];
    currentQuestionIndex++;
  } else {
    interviewerResponse = await generateResponse(`You are an experienced technical interviewer conducting an interview for a ${currentSkill} developer position. The candidate has just said: "${answer}". Provide a natural response that may include follow-up questions, comments on their answer, or transition to a new topic. Use the following conversation history for context: ${JSON.stringify(conversationHistory)}. Keep your response concise and engage with the candidate's previous statement.`);
  }
  
  conversationHistory.push(`Interviewer: ${interviewerResponse}`);
  res.json({ question: interviewerResponse });
});

app.post('/end-interview', async (req, res) => {
  const interviewDuration = Math.round((Date.now() - interviewStartTime) / 60000);
  
  const feedback = await generateResponse(`
    You are an experienced technical interviewer who has just finished interviewing a candidate for a ${currentSkill} developer position. 
    The interview lasted ${interviewDuration} minutes. 
    Based on the following conversation, provide a concise feedback summary. Include:
    1. A list of areas where the candidate needs improvement
    2. A rating out of 10 based on their responses
    3. A clear "Selected" or "Not Selected" decision based on the rating (7 and above is selected)
    Here's the conversation: ${JSON.stringify(conversationHistory)}
  `);
  
  res.json({ duration: interviewDuration, feedback });
});

async function generateResponse(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating response:", error.message);
    return "I apologize, but I'm having trouble processing that at the moment. Could we move on to the next question?";
  }
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

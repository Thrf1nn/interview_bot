const elements = {
    skillSelect: document.getElementById('skill-select'),
    startBtn: document.getElementById('start-btn'),
    setupArea: document.getElementById('setup-area'),
    interviewArea: document.getElementById('interview-area'),
    question: document.getElementById('question'),
    answer: document.getElementById('answer'),
    submitBtn: document.getElementById('submit-btn'),
    endBtn: document.getElementById('end-btn'),
    feedbackArea: document.getElementById('feedback-area'),
    feedbackContent: document.getElementById('feedback-content'),
    conclusionArea: document.getElementById('conclusion-area'),
    conclusionContent: document.getElementById('conclusion-content')
};

elements.startBtn.addEventListener('click', startInterview);
elements.submitBtn.addEventListener('click', submitAnswer);
elements.endBtn.addEventListener('click', endInterview);

async function startInterview() {
    const skill = elements.skillSelect.value;
    if (!skill) {
        alert('Please select a skill to start the interview.');
        return;
    }

    try {
        const response = await fetch('/start-interview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skill })
        });

        if (!response.ok) {
            throw new Error('Failed to start the interview');
        }

        const data = await response.json();
        elements.question.textContent = data.question;
        elements.setupArea.classList.add('hidden');
        elements.interviewArea.classList.remove('hidden');
    } catch (error) {
        console.error('Error starting the interview:', error);
        alert('Error starting the interview. Please try again.');
    }
}

async function submitAnswer() {
    const answer = elements.answer.value.trim();
    if (!answer) {
        alert('Please enter your answer before submitting.');
        return;
    }

    try {
        const response = await fetch('/answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answer })
        });

        if (!response.ok) {
            throw new Error('Failed to submit the answer');
        }

        const data = await response.json();
        elements.question.textContent = data.question;
        elements.answer.value = '';
    } catch (error) {
        console.error('Error submitting answer:', error);
        alert('Error submitting your answer. Please try again.');
    }
}

async function endInterview() {
    try {
        const response = await fetch('/end-interview', {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to end the interview');
        }

        const data = await response.json();

        elements.feedbackContent.innerHTML = `
            <p><strong>Duration:</strong> ${data.duration} minutes</p>
            <pre>${data.feedback}</pre>
        `;
        elements.interviewArea.classList.add('hidden');
        elements.feedbackArea.classList.remove('hidden');
        elements.conclusionArea.classList.remove('hidden');
        elements.conclusionContent.textContent = 'Thank you for participating in the interview simulation.';
    } catch (error) {
        console.error('Error ending the interview:', error);
        alert('Error ending the interview. Please try again.');
    }
}

/**
 * Waste Awareness & Civic Education Controller
 * Includes 3-Bin Segregation Guide, "Which Bin?" Lookup Classifier, Penalties, and Interactive Quiz.
 */

const WASTE_DATABASE = [
  { keywords: ['banana', 'apple', 'fruit', 'vegetable', 'peel', 'food', 'rice', 'roti', 'tea', 'coffee', 'leaves', 'garden', 'egg shell'], bin: 'Green (Wet Waste)', color: 'emerald', icon: 'apple', tips: 'Do not wrap in plastic. Keep moist or convert into organic compost in your garden.' },
  { keywords: ['paper', 'newspaper', 'cardboard', 'box', 'magazine', 'book'], bin: 'Blue (Dry Waste)', color: 'sky', icon: 'file-text', tips: 'Keep clean and dry. Flatten cardboard cartons to save space before binning.' },
  { keywords: ['pizza box', 'oily paper', 'greasy box'], bin: 'Green (Wet/Compostable) or Red', color: 'amber', icon: 'box', tips: 'If soaked with oil/cheese, it cannot be recycled in paper mills! Tear the clean lid for Blue Bin and dispose of the greasy base in Wet/Organic.' },
  { keywords: ['plastic bottle', 'pet bottle', 'water bottle', 'cold drink', 'shampoo bottle', 'detergent bottle'], bin: 'Blue (Dry Waste)', color: 'sky', icon: 'recycle', tips: 'Empty liquid completely, rinse, remove the cap, and crush the bottle to conserve collector space.' },
  { keywords: ['milk pouch', 'milk packet', 'oil packet'], bin: 'Blue (Dry Waste)', color: 'sky', icon: 'milk', tips: 'Rinse inside with water to prevent foul odor, let dry, and bundle with recyclable soft plastics. Do not cut corner completely.' },
  { keywords: ['can', 'tin', 'aluminum', 'foil', 'soda can'], bin: 'Blue (Dry Waste)', color: 'sky', icon: 'cup-soda', tips: 'Wipe off remaining food sauce. 100% infinitely recyclable in aluminum smelters.' },
  { keywords: ['glass', 'bottle', 'jar', 'crockery', 'broken glass'], bin: 'Blue (Dry Waste) / Wrap Carefully', color: 'sky', icon: 'wine', tips: 'If broken, wrap tightly in multiple layers of old newspaper and label "BROKEN GLASS" to prevent injuring sweepers.' },
  { keywords: ['battery', 'cell', 'lithium', 'phone battery'], bin: 'Red / Black (Hazardous E-Waste)', color: 'rose', icon: 'battery-warning', tips: 'Never throw in ordinary bin! Contains heavy metals (lead, cadmium). Hand over to designated Nagar Nigam E-waste collection point.' },
  { keywords: ['medicine', 'syrup', 'tablet', 'pill', 'expired medicine'], bin: 'Red / Black (Hazardous Bio-Waste)', color: 'rose', icon: 'pill', tips: 'Do not flush down toilets (contaminates groundwater). Hand over to your chemist or municipal hazardous bin.' },
  { keywords: ['sanitary pad', 'diaper', 'bandage', 'cotton'], bin: 'Red / Black (Sanitary Waste)', color: 'rose', icon: 'shield-alert', tips: 'Wrap securely in newspaper, mark with a red "X" cross on the wrapper as per Swachh Bharat guidelines.' },
  { keywords: ['cfl', 'tube light', 'bulb', 'led'], bin: 'Red / Black (Hazardous Waste)', color: 'rose', icon: 'lightbulb', tips: 'Contains toxic mercury vapor. Pack in original sleeve or bubble wrap before disposing.' }
];

const QUIZ_QUESTIONS = [
  {
    q: 'Where should you throw rinsed milk packets and shampoo plastic bottles?',
    options: ['🟢 Green Bin (Wet Waste)', '🔵 Blue Bin (Dry Recyclable Waste)', '🔴 Red Bin (Hazardous Waste)', 'Any roadside corner'],
    correct: 1,
    explanation: 'Clean plastic bottles and rinsed milk pouches belong to the Blue Bin for recycling!'
  },
  {
    q: 'What is the proper way to dispose of broken glass items?',
    options: ['Throw directly into the green bin', 'Wrap securely in newspaper and write "BROKEN GLASS" to protect sanitation workers', 'Bury in garden soil', 'Burn with garden leaves'],
    correct: 1,
    explanation: 'Wrapping sharp glass protects our sweepers from severe hand cuts and infections.'
  },
  {
    q: 'Where do fruit peels, leftover rice, and vegetable scraps belong?',
    options: ['🔵 Blue Bin', '🟢 Green Bin (Wet/Compostable Waste)', '🔴 Red Bin', 'Burn them on the street'],
    correct: 1,
    explanation: 'Wet organic waste turns into rich nutrient compost for agriculture and city parks.'
  },
  {
    q: 'What is the penalty under National Green Tribunal (NGT) rules for open burning of municipal waste?',
    options: ['No penalty', '₹50 fine', 'Up to ₹5,000 to ₹25,000 fine', 'Only a polite warning'],
    correct: 2,
    explanation: 'Open waste burning releases hazardous dioxins and particulate matter, carrying strict fines up to ₹25,000.'
  },
  {
    q: 'How should expired medicines and chemical batteries be discarded?',
    options: ['Flush them down the sink/toilet', 'Mix with daily kitchen food waste', 'Hand over to Red/Hazardous or E-waste collection centers', 'Toss into the blue bin'],
    correct: 2,
    explanation: 'Chemicals and batteries pollute groundwater and require specialized hazardous treatment.'
  }
];

const Awareness = {
  currentQuestionIndex: 0,
  score: 0,

  init() {
    this.bindEvents();
    this.renderQuizQuestion();
  },

  bindEvents() {
    // Waste search input
    const searchInput = document.getElementById('wasteItemSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.lookupItem(e.target.value.trim().toLowerCase());
      });
    }

    // Quick tag pills
    document.querySelectorAll('.tag-waste-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const item = e.target.textContent.trim().replace(/^[\W_]+/, '');
        const input = document.getElementById('wasteItemSearch');
        if (input) input.value = item;
        this.lookupItem(item.toLowerCase());
      });
    });

    // Quiz next button
    const nextBtn = document.getElementById('quizNextBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.handleNextQuestion();
      });
    }

    // Quiz restart button
    const restartBtn = document.getElementById('quizRestartBtn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.restartQuiz();
      });
    }
  },

  lookupItem(query) {
    const resultBox = document.getElementById('wasteLookupResult');
    if (!resultBox) return;

    if (!query) {
      resultBox.classList.add('hidden');
      return;
    }

    // Search keywords
    const match = WASTE_DATABASE.find(item => 
      item.keywords.some(k => query.includes(k) || k.includes(query))
    );

    resultBox.classList.remove('hidden');

    if (match) {
      const colorClasses = {
        emerald: 'bg-emerald-50 border-emerald-300 text-emerald-950',
        sky: 'bg-sky-50 border-sky-300 text-sky-950',
        rose: 'bg-rose-50 border-rose-300 text-rose-950',
        amber: 'bg-amber-50 border-amber-300 text-amber-950'
      };

      const badgeClasses = {
        emerald: 'bg-emerald-600 text-white',
        sky: 'bg-sky-600 text-white',
        rose: 'bg-rose-600 text-white',
        amber: 'bg-amber-600 text-white'
      };

      resultBox.className = `p-4 rounded-xl border ${colorClasses[match.color]} transition-all`;
      resultBox.innerHTML = `
        <div class="flex items-start gap-3">
          <span class="p-2 rounded-lg ${badgeClasses[match.color]} shadow-xs">
            <i data-lucide="${match.icon}" class="w-5 h-5"></i>
          </span>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-sm">Designated Bin: ${match.bin}</h4>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClasses[match.color]}">Match Found</span>
            </div>
            <p class="text-xs mt-1.5 font-medium">How to dispose:</p>
            <p class="text-xs opacity-90 mt-0.5">${match.tips}</p>
          </div>
        </div>
      `;
    } else {
      resultBox.className = 'p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700';
      resultBox.innerHTML = `
        <div class="flex items-center gap-3">
          <i data-lucide="help-circle" class="w-5 h-5 text-slate-400"></i>
          <div>
            <p class="text-xs font-bold text-slate-800">General Rule of Thumb:</p>
            <p class="text-xs text-slate-500">If it was once alive or rots, put in <strong>Green (Wet)</strong>. If it is dry and recyclable, put in <strong>Blue</strong>. If it has chemicals or hygiene hazards, put in <strong>Red</strong>.</p>
          </div>
        </div>
      `;
    }

    if (window.lucide) window.lucide.createIcons();
  },

  renderQuizQuestion() {
    const qContainer = document.getElementById('quizQuestionContainer');
    const resultContainer = document.getElementById('quizResultContainer');
    const nextBtn = document.getElementById('quizNextBtn');

    if (!qContainer) return;

    if (this.currentQuestionIndex >= QUIZ_QUESTIONS.length) {
      // Quiz complete
      qContainer.classList.add('hidden');
      if (nextBtn) nextBtn.classList.add('hidden');
      if (resultContainer) {
        resultContainer.classList.remove('hidden');
        document.getElementById('quizFinalScore').textContent = `${this.score} / ${QUIZ_QUESTIONS.length}`;
        const feedbackEl = document.getElementById('quizBadgeFeedback');
        if (feedbackEl) {
          if (this.score >= 4) {
            feedbackEl.innerHTML = `
              <div class="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                <i data-lucide="award" class="w-5 h-5 text-emerald-600"></i>
                Outstanding! You have earned the "Swachh Bharat Gold Citizen Badge".
              </div>
            `;
          } else {
            feedbackEl.innerHTML = `
              <div class="p-3 bg-amber-100 text-amber-800 rounded-xl text-xs font-medium text-center">
                Good effort! Review the 3-bin guide above and re-take the quiz to master segregation.
              </div>
            `;
          }
        }
      }
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    // Render current question
    const qData = QUIZ_QUESTIONS[this.currentQuestionIndex];
    if (resultContainer) resultContainer.classList.add('hidden');
    qContainer.classList.remove('hidden');
    if (nextBtn) {
      nextBtn.classList.add('hidden'); // hidden until user selects an answer
    }

    document.getElementById('quizProgressText').textContent = `Question ${this.currentQuestionIndex + 1} of ${QUIZ_QUESTIONS.length}`;
    document.getElementById('quizQuestionText').textContent = qData.q;

    const optionsContainer = document.getElementById('quizOptionsContainer');
    optionsContainer.innerHTML = qData.options.map((opt, idx) => `
      <button type="button" onclick="Awareness.handleOptionSelect(${idx})" 
        class="quiz-option-btn w-full text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/50 text-xs font-medium text-slate-700 transition-all flex items-center justify-between">
        <span>${opt}</span>
        <span class="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400"></span>
      </button>
    `).join('');

    const explanationBox = document.getElementById('quizExplanationBox');
    if (explanationBox) explanationBox.classList.add('hidden');
  },

  handleOptionSelect(selectedIndex) {
    const qData = QUIZ_QUESTIONS[this.currentQuestionIndex];
    const buttons = document.querySelectorAll('.quiz-option-btn');
    const isCorrect = selectedIndex === qData.correct;

    if (isCorrect) {
      this.score++;
    }

    // Disable all options and style correct/wrong
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      btn.classList.remove('hover:border-emerald-500', 'hover:bg-emerald-50/50');

      if (idx === qData.correct) {
        btn.classList.add('border-emerald-500', 'bg-emerald-50', 'text-emerald-900', 'font-bold');
        btn.innerHTML += `<i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i>`;
      } else if (idx === selectedIndex && !isCorrect) {
        btn.classList.add('border-rose-400', 'bg-rose-50', 'text-rose-900');
        btn.innerHTML += `<i data-lucide="x-circle" class="w-4 h-4 text-rose-500"></i>`;
      }
    });

    // Show explanation
    const explanationBox = document.getElementById('quizExplanationBox');
    if (explanationBox) {
      explanationBox.classList.remove('hidden');
      explanationBox.innerHTML = `
        <div class="p-3 rounded-xl text-xs ${isCorrect ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-rose-50 border border-rose-200 text-rose-900'}">
          <p class="font-bold mb-0.5">${isCorrect ? '✓ Correct Answer!' : '✗ Not Quite!'}</p>
          <p>${qData.explanation}</p>
        </div>
      `;
    }

    const nextBtn = document.getElementById('quizNextBtn');
    if (nextBtn) nextBtn.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  handleNextQuestion() {
    this.currentQuestionIndex++;
    this.renderQuizQuestion();
  },

  restartQuiz() {
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.renderQuizQuestion();
  }
};

window.Awareness = Awareness;

import { useState, useEffect, useCallback, useRef } from "react";

const SKILLS = {
  MATHEMATICS: { name: "MATHEMATICS", color: "#4fc3f7", desc: "Raw algebraic intuition. The ability to see equations breathing beneath the surface of everything." },
  INTUITION: { name: "INTUITION", color: "#ab47bc", desc: "The gut feeling. Pattern recognition that bypasses the prefrontal cortex entirely." },
  RHETORIC: { name: "RHETORIC", color: "#ef5350", desc: "The silver tongue of statistical argumentation. You could sell overfitting to a Bayesian." },
  COMPOSURE: { name: "COMPOSURE", color: "#66bb6a", desc: "Grace under pressure. The ability to hold steady when your residuals are screaming." },
  DRAMA: { name: "DRAMA", color: "#ffa726", desc: "Theatrical flair. Every coefficient tells a story — and you're here to direct it." },
  LOGIC: { name: "LOGIC", color: "#78909c", desc: "Cold, crystalline reasoning. If the math checks out, the math checks out." },
};

const INITIAL_STATS = {
  MATHEMATICS: 3,
  INTUITION: 2,
  RHETORIC: 2,
  COMPOSURE: 3,
  DRAMA: 1,
  LOGIC: 3,
};

const POINT_POOL = 4;

const typewriterDelay = 18;

function rollCheck(stat, difficulty) {
  const roll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
  return roll + stat >= difficulty;
}

const SCENES = {
  intro: {
    id: "intro",
    passages: [
      { speaker: "NARRATOR", text: "You wake up face-down on a desk covered in printouts. There is toner on your cheek and a half-eaten croissant lodged in your shirt pocket. The fluorescent lights hum like a dying civilization." },
      { speaker: "NARRATOR", text: "You are a TIME SERIES ANALYST. Or you were. The details are hazy. Something about quarterly revenue forecasts. Something about too many features. Something about a model that went very, very wrong." },
      { speaker: "INTUITION", skill: true, text: "Something is rotten in the state of this regression. You can feel it in your bones — or maybe that's just the desk." },
      { speaker: "NARRATOR", text: "A sticky note on your monitor reads: 'THE MODEL HAS 847 FEATURES AND A NEGATIVE R². FIX IT OR DON'T COME BACK. — MANAGEMENT'" },
      { speaker: "DRAMA", skill: true, text: "Eight hundred and forty-seven features! It's practically a novel. A baroque cathedral of overfitting. *Chef's kiss.*" },
      { speaker: "NARRATOR", text: "Your computer screen flickers to life. A scatter plot stares back at you. The residuals look like a Jackson Pollock painting." },
    ],
    choices: [
      { text: "Stare at the scatter plot and try to remember what went wrong.", next: "the_problem", },
      { text: "Eat the croissant first. You can't regularize on an empty stomach.", next: "croissant", },
    ],
  },

  croissant: {
    id: "croissant",
    passages: [
      { speaker: "NARRATOR", text: "The croissant is stale. Three days, maybe four. It crumbles like your confidence." },
      { speaker: "COMPOSURE", skill: true, text: "You've eaten worse. Remember the conference in Newark? The 'continental breakfast'? You survived that. You'll survive this." },
      { speaker: "NARRATOR", text: "As you chew, fragments of memory return. The model. The time series. Revenue data going back fifteen years, with hundreds of exogenous variables — weather data, social media sentiment, the phase of the moon..." },
      { speaker: "MATHEMATICS", skill: true, text: "The phase of the moon. Someone actually included the phase of the moon as a predictor of quarterly revenue. And you *let them.*" },
      { speaker: "NARRATOR", text: "The croissant is gone. The problem remains." },
    ],
    choices: [
      { text: "Turn to face the scatter plot. Time to work.", next: "the_problem", },
    ],
  },

  the_problem: {
    id: "the_problem",
    passages: [
      { speaker: "NARRATOR", text: "You pull up the model diagnostics. It's worse than you remembered." },
      { speaker: "NARRATOR", text: "The ordinary least squares regression has 847 coefficients. Many are enormous — one variable's coefficient is 4,372.8. Another is -3,891.2. They're wrestling each other into oblivion, and the forecast is caught in the crossfire." },
      { speaker: "LOGIC", skill: true, text: "This is multicollinearity. When predictors are correlated, OLS goes haywire. The coefficients inflate to compensate for each other, like two people both grabbing the same steering wheel." },
      { speaker: "NARRATOR", text: "The training R² is 0.99. The test R² is -0.34. Your model has memorized the past and learned nothing about the future. It is, in statistical terms, a fraud." },
      { speaker: "DRAMA", skill: true, text: "Negative R-squared! The model is *worse than guessing the mean*. You could replace this entire pipeline with a Post-it note that says 'probably around $4.2 million' and do better." },
      { speaker: "NARRATOR", text: "You need to constrain these coefficients. Shrink them. Discipline them. But how?" },
    ],
    choices: [
      { text: "[MATHEMATICS — Challenging] Try to recall the mathematical framework for penalized regression.", next: "math_recall", check: { skill: "MATHEMATICS", difficulty: 8 }, },
      { text: "[INTUITION] Feel your way toward the answer. What does your gut say about large coefficients?", next: "intuition_path", check: { skill: "INTUITION", difficulty: 7 }, },
      { text: "[DRAMA] This isn't a disaster — it's a STORY. Reframe the crisis and find the narrative.", next: "drama_reframe", check: { skill: "DRAMA", difficulty: 7 }, },
      { text: "Open your desk drawer. Maybe past-you left notes.", next: "desk_drawer", },
    ],
  },

  drama_reframe: {
    id: "drama_reframe",
    passages: [
      { speaker: "NARRATOR", text: "You lean back. Close your eyes. This isn't about numbers. This is about a STORY." },
    ],
    checkSuccess: [
      { speaker: "DRAMA", skill: true, text: "Every great story needs a villain. And the villain here isn't the data — it's FREEDOM. Unconstrained freedom. The model was given 847 variables and no rules, and it became a method actor gone method: perfectly inhabiting the training data, losing itself completely, forgetting that there's an AUDIENCE — the test set — who needs to believe the performance." },
      { speaker: "DRAMA", skill: true, text: "A good performance isn't about doing everything possible. It's about restraint. Knowing which gesture matters. A model with 847 wild coefficients is an actor who screams every line, knocks over the furniture, and wears four costumes at once. Brilliant? Maybe. But nobody in the audience can follow it." },
      { speaker: "DRAMA", skill: true, text: "What this model needs is a DIRECTOR. Someone to say: too much. Pull it back. Make it mean something. In statistical terms — a penalty. A cost for excess. Discipline built into the loss function itself." },
      { speaker: "NARRATOR", text: "You don't have the equation yet, but you have its soul: the model must pay for its own extravagance. This understanding will make the math feel inevitable when you find it." },
      { speaker: "INTUITION", skill: true, text: "That's... actually a precise intuition, wrapped in a lot of theater. The restraint metaphor is correct. Regularization IS directorial discipline applied to coefficients." },
    ],
    checkFail: [
      { speaker: "DRAMA", skill: true, text: "You lean back and reach for the narrative arc, but what comes out is a dramatic monologue about Icarus, the Tower of Babel, and the fall of Rome, none of which illuminate why your coefficients are 4,000." },
      { speaker: "DRAMA", skill: true, text: "The theatrical instinct is firing, but it's firing at the wrong target. You're generating ATMOSPHERE when you need INSIGHT. Drama without structure is just noise — which is, ironically, exactly your model's problem." },
      { speaker: "NARRATOR", text: "The theatrical approach has produced heat but no light. There's a lesson in there somewhere about the difference between drama and understanding, but you'll have to find the answer through other means." },
    ],
    choices: [
      { text: "Head to the whiteboard to formalize this feeling.", next: "whiteboard", },
      { text: "Check the desk drawer for more concrete clues.", next: "desk_drawer", },
    ],
  },

  math_recall: {
    id: "math_recall",
    passages: [
      { speaker: "NARRATOR", text: "You close your eyes and reach for the mathematics. The symbols swim in the dark behind your eyelids..." },
    ],
    checkSuccess: [
      { speaker: "MATHEMATICS", skill: true, text: "Yes. YES. It's coming back. OLS minimizes Σ(yᵢ - ŷᵢ)² — the sum of squared residuals. The model is FREE to make any coefficient it wants to minimize that sum. And with 847 correlated features, the freedom becomes a liability. The coefficients learn to cancel each other out in elaborate ways that fit the noise exactly." },
      { speaker: "MATHEMATICS", skill: true, text: "But: what if you TAXED that freedom? What if you added a second term to the objective — a cost that grows when coefficients grow large? The model still wants to minimize loss, but now it also has to pay for complexity. Ridge adds λΣβⱼ² — the squared coefficients. LASSO adds λΣ|βⱼ| — the absolute values. Same logic. Completely different geometry." },
      { speaker: "NARRATOR", text: "The key insight crystallizes: the choice between squared and absolute value isn't arbitrary. Squaring is smooth and differentiable everywhere; absolute value has a kink at zero. That kink is where features go to die. You'll need the whiteboard to show why." },
    ],
    checkFail: [
      { speaker: "NARRATOR", text: "The symbols swim in the dark behind your eyelids. The loss function... something about squares... a penalty term..." },
      { speaker: "MATHEMATICS", skill: true, text: "You get fragments. OLS minimizes something. Lambda controls something. There's a squared term or an absolute value term — but which one does what? The distinction that matters most is exactly what's slipped away. The mechanics are there; the meaning has dissolved." },
      { speaker: "NARRATOR", text: "You've been away from the textbooks too long. The equations are in there somewhere, buried under three years of stakeholder presentations. The whiteboard will help you reconstruct them." },
    ],
    choices: [
      { text: "Go to the whiteboard. Time to explore both penalties.", next: "whiteboard", },
      { text: "Open your desk drawer for more clues first.", next: "desk_drawer", },
    ],
  },

  intuition_path: {
    id: "intuition_path",
    passages: [
      { speaker: "NARRATOR", text: "You lean back in your chair and let your mind go soft. Don't think. Feel." },
    ],
    checkSuccess: [
      { speaker: "INTUITION", skill: true, text: "Large coefficients feel wrong in the same way a lying face feels wrong — something is working too hard. A coefficient of 4,372 isn't saying 'this feature matters a lot.' It's saying 'I need to compensate for something.' When two features are correlated, they start fighting over the explanation, bidding each other up. The truth has been lost in the auction." },
      { speaker: "INTUITION", skill: true, text: "So: penalize the winning bid. Every time a coefficient gets bigger, it costs the model something — not just 'doesn't fit as well' but a direct tax. The model would still make big coefficients if it truly needed them. But it would think twice. And mostly, it shouldn't need them." },
      { speaker: "NARRATOR", text: "It isn't a proof. But it's correct. The formal math, when you find it, will be the notation for something you already understood." },
    ],
    checkFail: [
      { speaker: "NARRATOR", text: "You lean back and let your mind go soft. Nothing comes. The problem refuses to speak to your gut. It just stares at you, technically." },
      { speaker: "INTUITION", skill: true, text: "Intuition isn't always available on demand. Sometimes the gut has no opinion. Sometimes it has opinions about lunch instead. Right now it's thinking about the croissant." },
      { speaker: "NARRATOR", text: "The scatter plot continues to look like a Jackson Pollock. No flash of insight arrives. You'll need to approach this differently." },
    ],
    choices: [
      { text: "Head to the whiteboard to formalize this feeling.", next: "whiteboard", },
      { text: "Check the desk drawer.", next: "desk_drawer", },
    ],
  },

  desk_drawer: {
    id: "desk_drawer",
    passages: [
      { speaker: "NARRATOR", text: "The desk drawer slides open with a grinding protest. Inside: a flask (empty), three identical pens (all out of ink), a crumpled paper, and a small rubber duck." },
      { speaker: "NARRATOR", text: "You smooth out the paper. It's a note in your own handwriting, written in a state of apparent desperation:" },
      { speaker: "NARRATOR", text: "'RIDGE = shrinks everything toward zero, nothing dies. LASSO = shrinks AND KILLS. Some coefficients go to ACTUAL ZERO. Feature selection!! Use LASSO when you suspect most features are garbage. Use Ridge when everything matters a little. Lambda controls the pain. CROSS-VALIDATE LAMBDA. DO NOT FORGET TO SCALE YOUR FEATURES.'" },
      { speaker: "NARRATOR", text: "Beneath this, in smaller, shakier handwriting: 'the moon variable must die'" },
      { speaker: "DRAMA", skill: true, text: "Past-you was a prophet. A desperate, unhinged prophet — but a prophet nonetheless." },
      { speaker: "LOGIC", skill: true, text: "This is actually a remarkably concise summary. Ridge uses an L2 penalty. LASSO uses an L1 penalty. The L1 penalty's geometry creates sparse solutions — coefficients can be driven to exactly zero. The L2 penalty only approaches zero asymptotically." },
    ],
    choices: [
      { text: "Take the note to the whiteboard. Time to understand WHY these work.", next: "whiteboard", },
      { text: "Take the rubber duck too. You may need to explain things to it later.", next: "whiteboard_duck", },
      { text: "[LOGIC] Wait — work through the implications of this note right here. What does 'cross-validate lambda' really mean?", next: "desk_logic", check: { skill: "LOGIC", difficulty: 7 }, },
    ],
  },

  desk_logic: {
    id: "desk_logic",
    passages: [
      { speaker: "NARRATOR", text: "You sit back down and stare at the crumpled note. Past-you left clues. Time to decode them." },
    ],
    checkSuccess: [
      { speaker: "LOGIC", skill: true, text: "Lambda controls the penalty strength — but it also controls the BIAS-VARIANCE TRADE-OFF. When lambda is small: low bias (model fits training data well), high variance (sensitive to noise, won't generalize). When lambda is large: high bias (model is too constrained, may underfit), low variance (stable predictions across different samples). The optimal lambda is where these two error sources balance. That's what cross-validation is finding — the minimum of the total error curve." },
      { speaker: "LOGIC", skill: true, text: "Cross-validation works by trying many lambda values and measuring test performance for each. But past-you underlined 'DO NOT FORGET TO SCALE YOUR FEATURES' for a precise reason: the penalty term λΣβⱼ² hits large coefficients more than small ones — and coefficient size depends entirely on the scale of the input. A variable measured in millions produces tiny coefficients; one measured in fractions produces huge ones. The penalty would be unfairly punishing variables for their units, not their uselessness." },
      { speaker: "LOGIC", skill: true, text: "And for time series: you can't randomly split the folds. Train on rows 1-100, test on rows 101-120. Then train on rows 1-120, test on rows 121-140. Always forward. The future cannot train the past or you've built a time machine that only predicts history." },
      { speaker: "NARRATOR", text: "Past-you was panicking but thinking clearly. The note makes complete sense now." },
    ],
    checkFail: [
      { speaker: "LOGIC", skill: true, text: "Lambda, cross-validation, scaling — the pieces are all there but won't connect. You understand each concept in isolation. Lambda is a hyperparameter. Cross-validation picks hyperparameters. Scaling affects coefficients. But the WHY behind each step — the bias-variance trade-off, why scaling affects the penalty specifically — remains just out of reach." },
      { speaker: "NARRATOR", text: "The chain of logic needs one more link that isn't coming. You'll need the whiteboard to lay it out spatially and find where the reasoning breaks." },
    ],
    choices: [
      { text: "To the whiteboard — and bring the duck.", next: "whiteboard_duck", },
      { text: "To the whiteboard.", next: "whiteboard", },
    ],
  },

  whiteboard_duck: {
    id: "whiteboard_duck",
    passages: [
      { speaker: "NARRATOR", text: "You pocket the rubber duck. It makes a faint squeak of protest. Or encouragement. Hard to tell." },
      { speaker: "RHETORIC", skill: true, text: "Rubber duck debugging. The ancient practice of explaining your problem to an inanimate object until the solution reveals itself. Honestly, the duck is a better listener than most stakeholders." },
    ],
    choices: [
      { text: "To the whiteboard.", next: "whiteboard", },
    ],
  },

  drama_penalties: {
    id: "drama_penalties",
    passages: [
      { speaker: "NARRATOR", text: "You set down the marker and step back from the equations. Numbers are just the skeleton. You need the flesh." },
    ],
    checkSuccess: [
      { speaker: "DRAMA", skill: true, text: "TWO PENALTIES. Two philosophies. Two people.\n\nRIDGE is the benevolent autocrat. She walks into a room of 847 screaming coefficients and says: 'Everyone. Sit. Down. You can ALL stay, but I'm implementing a salary cap. Your total bonus pool is fixed. The bigger you already are, the more you'll give back. Nobody gets fired. But nobody gets to be 4,000 anymore.' The room grumbles. Some dramatically collapse to near-zero. But all 847 remain, chastened." },
      { speaker: "DRAMA", skill: true, text: "LASSO is the revolution. He walks into the same room and announces: 'I'm not interested in managing you. I'm interested in truth. Justify your existence or leave.' He doesn't fire anyone directly — he creates conditions where the weak fire themselves. The penalty grows linearly with coefficient size, not quadratically. And that linear growth, past a certain lambda, creates a tipping point: it becomes cheaper for a coefficient to go to ZERO than to stay small. Features don't retire. They vanish." },
      { speaker: "DRAMA", skill: true, text: "The difference — quadratic versus linear growth in the penalty — is what determines whether coefficients merely shrink or actually die. Ridge's squared penalty always makes it worth maintaining a tiny nonzero value. LASSO's absolute penalty eventually says: nothing is better than something small." },
      { speaker: "NARRATOR", text: "You've just explained the mathematical distinction between L1 and L2 penalties through the medium of workplace drama. Remarkably, it's completely accurate." },
    ],
    checkFail: [
      { speaker: "DRAMA", skill: true, text: "You try to give Ridge and LASSO personalities, but the characters won't cohere. Ridge is... a bureaucrat? A gardener? LASSO is... a hitman? A Marie Kondo who only sparks joy with coefficients? The metaphors accumulate without illuminating anything." },
      { speaker: "DRAMA", skill: true, text: "The theatrical approach needs more raw material — a clearer understanding of what the penalties actually DO — before it can transform them into something vivid. You can't dramatize what you don't yet fully understand." },
      { speaker: "NARRATOR", text: "Explore the math first. The story will come when you have something real to dramatize." },
    ],
    choices: [
      { text: "Explore RIDGE in more detail.", next: "ridge_deep", },
      { text: "Explore LASSO in more detail.", next: "lasso_deep", },
      { text: "You get both now. Time to fix the model.", next: "fix_model", },
    ],
    choicesOnSuccess: [
      { text: "You understand both penalties at a gut level. Skip the deep dives and go straight to fixing the model.", next: "fix_model", },
      { text: "Explore RIDGE in detail anyway — the diplomat deserves a closer look.", next: "ridge_deep", },
      { text: "Explore LASSO in detail anyway — the executioner deserves a closer look.", next: "lasso_deep", },
    ],
    choicesOnFail: [
      { text: "The story wouldn't come. Explore RIDGE the hard way — through actual math.", next: "ridge_deep", },
      { text: "The story wouldn't come. Explore LASSO the hard way — through actual math.", next: "lasso_deep", },
    ],
  },

  whiteboard: {
    id: "whiteboard",
    passages: [
      { speaker: "NARRATOR", text: "The whiteboard stretches across the wall like a canvas of possibility. Someone has drawn a small cartoon of a crying regression line in the corner. You leave it. It feels appropriate." },
      { speaker: "NARRATOR", text: "You pick up a marker. The cap comes off with a satisfying pop. Time to think about PENALTIES." },
      { speaker: "LOGIC", skill: true, text: "The core idea: In ordinary least squares, we minimize the LOSS FUNCTION — the sum of squared residuals. The model is free to make coefficients as large as it wants to fit the training data perfectly." },
      { speaker: "LOGIC", skill: true, text: "Regularization adds a PENALTY TERM to the loss function. Now the model must balance two competing objectives: fitting the data well AND keeping coefficients small. The parameter λ (lambda) controls this trade-off." },
      { speaker: "NARRATOR", text: "You write on the board:\n\n• OLS:   minimize  Σ(yᵢ - ŷᵢ)²\n• Ridge:  minimize  Σ(yᵢ - ŷᵢ)² + λΣβⱼ²\n• LASSO: minimize  Σ(yᵢ - ŷᵢ)² + λΣ|βⱼ|" },
      { speaker: "MATHEMATICS", skill: true, text: "That λ is doing all the work. When λ = 0, you get OLS. As λ → ∞, all coefficients shrink toward zero. Somewhere in between is the sweet spot — enough regularization to prevent overfitting, not so much that you've lobotomized the model." },
      { speaker: "NARRATOR", text: "You stare at the two penalty terms. Squared coefficients versus absolute values. Such a small difference in notation. Such enormous consequences." },
    ],
    choices: [
      { text: "Explore RIDGE regression first. The L2 penalty. The gentle path.", next: "ridge_deep", },
      { text: "Explore LASSO first. The L1 penalty. The executioner's path.", next: "lasso_deep", },
      { text: "[DRAMA] Tell the story of these two penalties. Give them characters. Make it vivid.", next: "drama_penalties", check: { skill: "DRAMA", difficulty: 7 }, },
      { text: "[MATHEMATICS — Heroic] Try to visualize WHY the geometry of L1 vs L2 matters.", next: "geometry", check: { skill: "MATHEMATICS", difficulty: 10 }, },
    ],
  },

  ridge_deep: {
    id: "ridge_deep",
    passages: [
      { speaker: "NARRATOR", text: "RIDGE REGRESSION. Also known as Tikhonov regularization, if you want to sound impressive at parties. (You do. You always do.)" },
      { speaker: "LOGIC", skill: true, text: "Ridge adds λΣβⱼ² to the loss. This is the L2 penalty — named because it uses the L2 norm (Euclidean distance) of the coefficient vector. It penalizes the sum of SQUARED coefficient values." },
      { speaker: "NARRATOR", text: "You draw a time series on the board. Revenue over 60 quarters. Wavy, trending upward, with seasonal bumps." },
      { speaker: "MATHEMATICS", skill: true, text: "Here's what Ridge does to your 847 features: it shrinks ALL of them. Proportionally. The big ones get pulled down more than the small ones, but nothing ever reaches exactly zero. Every feature survives. The moon phase coefficient goes from 4,372.8 to maybe 0.003. Tiny. Negligible. But technically still alive." },
      { speaker: "INTUITION", skill: true, text: "Think of it like turning down the volume on every instrument in an orchestra simultaneously. The loud ones get quieter. The quiet ones get *very* quiet. But you never actually remove any musicians." },
      { speaker: "NARRATOR", text: "You write: 'RIDGE = SHRINKAGE WITHOUT DEATH. All coefficients kept, all shrunk toward zero.'" },
      { speaker: "LOGIC", skill: true, text: "For time series specifically, this is powerful. Temporal features — lags, seasonal indicators, trend components — are often correlated with each other. Ridge handles multicollinearity gracefully by distributing the effect across correlated predictors rather than assigning it arbitrarily to one." },
      { speaker: "COMPOSURE", skill: true, text: "It's the diplomatic solution. Nobody gets fired. Everyone takes a small pay cut." },
    ],
    choices: [
      { text: "Now explore LASSO. The other path.", next: "lasso_deep", },
      { text: "[RHETORIC] But wait — when is Ridge BETTER than LASSO for time series?", next: "ridge_advantage", check: { skill: "RHETORIC", difficulty: 7 }, },
    ],
  },

  ridge_advantage: {
    id: "ridge_advantage",
    passages: [
      { speaker: "NARRATOR", text: "You pace in front of the whiteboard. When does Ridge win?" },
    ],
    checkSuccess: [
      { speaker: "RHETORIC", skill: true, text: "The case for Ridge rests on a claim about the world: that most problems don't have a small number of huge causes. They have a large number of small, contributing causes. A time series driven by fifteen lagged values, six seasonal patterns, and forty economic indicators — each mattering a little — is EXACTLY the structure Ridge is built for. Demanding sparsity when the true signal IS distributed is asking the model to lie." },
      { speaker: "LOGIC", skill: true, text: "And there's a mathematical argument Ridge wins unambiguously: correlated predictors. When lag-1 and lag-2 revenue are correlated, LASSO has to pick one and kill the other — because the L1 penalty creates a constraint region with corners, and those corners force an either/or. Ridge distributes the signal across both. When you know correlated features each carry partial information, Ridge is strictly more honest." },
      { speaker: "MATHEMATICS", skill: true, text: "There's also the closed-form advantage: β̂_ridge = (X'X + λI)⁻¹X'y. That λI term added to the diagonal doesn't just regularize — it numerically stabilizes an otherwise near-singular matrix. Ridge doesn't just solve overfitting; it solves the linear algebra problem that multicollinearity creates." },
      { speaker: "NARRATOR", text: "You underline it: 'RIDGE: the honest choice when the truth is diffuse. Closed-form. Stable. Built for correlated data.'" },
    ],
    checkFail: [
      { speaker: "RHETORIC", skill: true, text: "You start building the argument and immediately take a wrong turn into the mathematics. L2 norms, Tikhonov regularization, the spectral properties of X'X + λI. This is all correct. This is all completely useless as rhetoric." },
      { speaker: "NARRATOR", text: "Rhetoric isn't about being right. It's about being understood. You've explained why Ridge works to yourself, which you already knew. The argument for when Ridge is BETTER than LASSO — the audience-facing case — is still unbuilt." },
    ],
    choices: [
      { text: "Now explore LASSO.", next: "lasso_deep", },
      { text: "Try to understand the geometry of both.", next: "geometry", check: { skill: "MATHEMATICS", difficulty: 10 }, },
    ],
    choicesOnSuccess: [
      { text: "Now explore LASSO.", next: "lasso_deep", },
      { text: "Try to understand the geometry of both.", next: "geometry", check: { skill: "MATHEMATICS", difficulty: 10 }, insight: "geometry" },
      { text: "You've built the case. Save this argument — you'll need it in the finale.", next: "lasso_deep", insight: "rhetoric_finale" },
    ],
    choicesOnFail: [
      { text: "The argument wouldn't form. Move on to LASSO and come back to Ridge later.", next: "lasso_deep", },
    ],
  },

  lasso_deep: {
    id: "lasso_deep",
    passages: [
      { speaker: "NARRATOR", text: "LASSO. Least Absolute Shrinkage and Selection Operator. Even the acronym sounds like a weapon. Something you'd use to drag rogue coefficients to justice." },
      { speaker: "DRAMA", skill: true, text: "And that's exactly what it is. LASSO doesn't just shrink — it ELIMINATES. It drives coefficients to EXACTLY ZERO. Features don't just get quiet. They get *silenced*." },
      { speaker: "LOGIC", skill: true, text: "LASSO adds λΣ|βⱼ| — the L1 penalty. The absolute value creates a diamond-shaped constraint region. And here's the crucial geometric fact: the corners of a diamond lie on the axes. When the loss function's contours meet a corner, one or more coefficients are exactly zero." },
      { speaker: "NARRATOR", text: "You draw it on the board: a perfect diamond, with its points touching the axes. Then the elliptical contours of the loss function, kissing the diamond at its sharp corner." },
      { speaker: "MATHEMATICS", skill: true, text: "This is AUTOMATIC FEATURE SELECTION. You don't have to decide which features to remove — LASSO decides for you. As λ increases, more and more coefficients are driven to zero, until only the most important predictors remain." },
      { speaker: "NARRATOR", text: "For your 847-feature time series model, this is... extremely relevant." },
      { speaker: "INTUITION", skill: true, text: "The moon phase variable. The 'number of rainy Tuesdays in Bhutan' variable. The 'CEO's horoscope' variable. LASSO will murder them all. And they deserve it." },
      { speaker: "NARRATOR", text: "You write: 'LASSO = SHRINKAGE + DEATH. Automatic feature selection. Sparse models. The survivors tell the story.'" },
    ],
    choices: [
      ...([
        { text: "Explore Ridge too, for comparison.", next: "ridge_deep", condition: "needsRidge" },
      ]),
      { text: "[RHETORIC] Argue the case for LASSO to the rubber duck. Why does sparsity matter to humans?", next: "lasso_rhetoric", check: { skill: "RHETORIC", difficulty: 7 }, },
      { text: "[LOGIC] When should you use LASSO over Ridge for time series?", next: "lasso_advantage", check: { skill: "LOGIC", difficulty: 7 }, },
      { text: "Try to visualize the geometry of L1 vs L2.", next: "geometry", check: { skill: "MATHEMATICS", difficulty: 10 }, },
      { text: "You understand both now. Time to fix the model.", next: "fix_model", },
    ],
  },

  lasso_advantage: {
    id: "lasso_advantage",
    passages: [
      { speaker: "NARRATOR", text: "When does the executioner outperform the diplomat?" },
    ],
    checkSuccess: [
      { speaker: "LOGIC", skill: true, text: "The answer turns on a question about the world: how many of your 847 features are *genuinely* relevant? If the true data-generating process is SPARSE — if revenue really does depend on 20 things, not 847 — then LASSO is correct. It's not just finding a simpler model; it's finding the TRUE model. Ridge would preserve 824 noise features as tiny, nonzero ghosts, permanently muddying the signal." },
      { speaker: "LOGIC", skill: true, text: "Formally: when the true coefficient vector is sparse (many zeros), LASSO's L1 penalty is consistent — it recovers the correct support set as sample size grows. Ridge's L2 penalty is not; it never zeros anything. If you have strong prior belief that most features are irrelevant, LASSO is not just convenient — it's statistically correct." },
      { speaker: "RHETORIC", skill: true, text: "And the practical corollary: interpretability. A model with 23 nonzero coefficients has 23 hypotheses you can test, argue about, explain to management. A model with 847 near-zero coefficients has 847 shrugs." },
      { speaker: "NARRATOR", text: "You write on the board: 'LASSO: for sparse truth buried in noise. When the true model has few causes. When explanation matters as much as prediction.'" },
    ],
    checkFail: [
      { speaker: "LOGIC", skill: true, text: "The logical chain is almost there — sparsity, interpretability, the true data-generating process — but you can't find the hinge that connects them. Why does LASSO *find* the sparse truth rather than just *prefer* it? The distinction matters. The answer involves the geometry of the L1 constraint, which is somewhere you haven't gone yet." },
      { speaker: "NARRATOR", text: "You tap the marker against the board. The answer is one insight away. Move forward and come back to it." },
    ],
    choices: [
      { text: "Try to understand the geometry.", next: "geometry", check: { skill: "MATHEMATICS", difficulty: 10 }, },
      { text: "Enough theory. Time to fix the model.", next: "fix_model", },
    ],
  },

  lasso_rhetoric: {
    id: "lasso_rhetoric",
    passages: [
      { speaker: "NARRATOR", text: "You hold up the rubber duck — or if you don't have it, an empty coffee mug — and begin to argue the case." },
    ],
    checkSuccess: [
      { speaker: "RHETORIC", skill: true, text: "Here's the case for LASSO, made to an audience that doesn't know what L1 means: 'Our model was trying to be everything to everyone. It had 847 opinions. Nobody listened, because 847 opinions is just noise. After regularization, the model has 23 opinions. You can argue with 23 opinions. You can act on 23 opinions. You can explain 23 opinions to the CFO in a quarterly review.'" },
      { speaker: "RHETORIC", skill: true, text: "The rhetorical advantage of sparsity isn't just simplicity — it's accountability. When a model with 847 nonzero coefficients makes a wrong prediction, you can't diagnose why. When a sparse model makes a wrong prediction, you can: 'The seasonal indicator was weak this quarter. The lagged revenue from Q3 was anomalous.' Sparse models fail in EXPLICABLE ways. That's worth something." },
      { speaker: "RHETORIC", skill: true, text: "And finally: a model is a form of communication. The best model isn't always the most accurate. Sometimes it's the one that tells the right story clearly enough that the organization can act on it. LASSO is in the business of telling a cleaner story." },
      { speaker: "NARRATOR", text: "The duck (or mug) seems genuinely persuaded. Or at least, it hasn't objected." },
    ],
    checkFail: [
      { speaker: "RHETORIC", skill: true, text: "You start building the sparsity argument and immediately commit the classic rhetorical error: leading with the mechanism instead of the value. 'The L1 penalty creates sparsity because of the geometry of the constraint region and...' — the duck's eyes have glazed over and it doesn't even have eyes." },
      { speaker: "NARRATOR", text: "Good rhetoric starts with what the audience cares about, then explains why your solution delivers it. You've explained the solution without establishing why anyone should care. The argument is there; the persuasion isn't." },
    ],
    choices: [
      { text: "[LOGIC] When should you use LASSO over Ridge for time series?", next: "lasso_advantage", check: { skill: "LOGIC", difficulty: 7 }, },
      { text: "Try to visualize the geometry.", next: "geometry", check: { skill: "MATHEMATICS", difficulty: 10 }, },
      { text: "Enough theory. Time to fix the model.", next: "fix_model", },
    ],
  },

  geometry: {
    id: "geometry",
    passages: [
      { speaker: "NARRATOR", text: "You close your eyes. The constraint regions float in the darkness of your mind like celestial objects." },
    ],
    checkSuccess: [
      { speaker: "MATHEMATICS", skill: true, text: "THERE. You see it. Two dimensions. Two coefficients. The constraint region for Ridge is a CIRCLE (all points where β₁² + β₂² ≤ t). The constraint for LASSO is a DIAMOND (all points where |β₁| + |β₂| ≤ t)." },
      { speaker: "MATHEMATICS", skill: true, text: "The loss function's contour lines are ELLIPSES, centered on the OLS solution. As you shrink the ellipse, it eventually touches the constraint region. For the CIRCLE, it can touch anywhere — typically at a smooth point where neither coefficient is zero." },
      { speaker: "MATHEMATICS", skill: true, text: "But the DIAMOND has CORNERS on the axes! The ellipse is much more likely to first touch the diamond at a corner — and at a corner, one coefficient is EXACTLY ZERO. That's it. That's the whole secret. The geometry of L1 creates sparsity. Not as a side effect. As a mathematical inevitability." },
      { speaker: "DRAMA", skill: true, text: "It's beautiful. Two shapes. A circle and a diamond. And the corners of the diamond are where features go to die. Geometry as destiny." },
      { speaker: "NARRATOR", text: "You draw both shapes on the whiteboard, side by side, with the elliptical contours kissing each one. The circle makes contact on its smooth belly. The diamond, on its lethal vertex." },
      { speaker: "NARRATOR", text: "This may be the clearest thing you've ever understood." },
    ],
    checkFail: [
      { speaker: "NARRATOR", text: "You reach for the geometry but it slips away like a dream at dawn. Circles... diamonds... constraint regions... the shapes blur and dissolve." },
      { speaker: "MATHEMATICS", skill: true, text: "The visualization isn't coming. You need higher mathematical horsepower for this one — or at minimum, more coffee. The insight is there in the shapes, but your mind can't hold them steady enough to see it." },
      { speaker: "NARRATOR", text: "Some doors require higher stats to open. But the journey continues regardless." },
    ],
    choices: [
      { text: "Time to fix the model. You know enough.", next: "fix_model", },
      { text: "[INTUITION] You may not see the shapes, but you FEEL why corners matter.", next: "geometry_intuition", check: { skill: "INTUITION", difficulty: 7 }, },
    ],
  },

  geometry_intuition: {
    id: "geometry_intuition",
    passages: [
      { speaker: "NARRATOR", text: "You can't see the shapes. But you can feel them." },
    ],
    checkSuccess: [
      { speaker: "INTUITION", skill: true, text: "Okay. Don't think about math. Think about squeezing things. If you squeeze a BALL — a sphere — the pressure distributes evenly across its whole surface. Everything compresses a little. Nothing snaps. That's Ridge. The constraint region is round, and round things yield gradually." },
      { speaker: "INTUITION", skill: true, text: "Now squeeze a DIAMOND — a shape with sharp points. Where does the pressure go? To the tips. All of it. The corners concentrate the force until something gives way entirely. A coefficient at a corner of the L1 constraint isn't just small — it's at a structural stress point. Under enough pressure from lambda, it breaks cleanly to zero." },
      { speaker: "NARRATOR", text: "You can feel the difference in your hands even though you're not holding anything. The smooth ball and the sharp diamond. Two geometries, two fates for coefficients." },
      { speaker: "MATHEMATICS", skill: true, text: "That's actually the right intuition. The technical version involves subgradients and the KKT conditions, but the physical intuition you just described captures why the L1 penalty's geometry forces zeros in a way L2's can't." },
    ],
    checkFail: [
      { speaker: "INTUITION", skill: true, text: "You reach for the shape-feeling but it won't cohere. Something about corners... but all you can really feel right now is the absence of a second croissant. The intuition that might save you here requires more grounding than you currently have." },
      { speaker: "NARRATOR", text: "Some things have to be felt and you're not feeling this one. Move forward. The model awaits." },
    ],
    choices: [
      { text: "Time to fix the model.", next: "fix_model", },
    ],
  },

  fix_model: {
    id: "fix_model",
    passages: [
      { speaker: "NARRATOR", text: "You return to your desk. The screen still glows with the residual plot of shame. 847 features. Negative R². The note from management. The deadline is... you check your phone. Two hours ago." },
      { speaker: "COMPOSURE", skill: true, text: "The deadline was two hours ago. This is fine. Everything is fine. Deadlines are just suggestions with consequences." },
      { speaker: "NARRATOR", text: "You crack your knuckles. You have the theory. Now you need to apply it. But which approach?" },
      { speaker: "NARRATOR", text: "You look at your feature list. Most of these variables were added by well-meaning colleagues who each had a 'theory' about what drives revenue. The moon phase. The CEO's golf handicap. The Pantone Color of the Year." },
    ],
    choices: [
      { text: "[INTUITION] Use LASSO. Most of these features are garbage. Let LASSO find the survivors.", next: "choose_lasso", check: { skill: "INTUITION", difficulty: 6 }, },
      { text: "[DRAMA] Use LASSO — and RELISH the carnage. 824 features are about to die and they deserve it.", next: "choose_lasso_dramatic", check: { skill: "DRAMA", difficulty: 6 }, },
      { text: "[COMPOSURE] Use Ridge. Don't throw anything away — just turn everything down.", next: "choose_ridge", check: { skill: "COMPOSURE", difficulty: 6 }, },
      { text: "[LOGIC] Use Elastic Net — a combination of both. Hedge your bets.", next: "choose_elastic", check: { skill: "LOGIC", difficulty: 8 }, },
      { text: "[MATHEMATICS — Unlocked] The geometry is clear. Use Elastic Net — you understand exactly why the combined penalty is superior here.", next: "choose_elastic", condition: "hasGeometryInsight", check: { skill: "MATHEMATICS", difficulty: 6 }, },
    ],
  },

  choose_lasso_dramatic: {
    id: "choose_lasso_dramatic",
    passages: [
      { speaker: "NARRATOR", text: "You crack your knuckles with the energy of someone about to conduct a very aggressive orchestra." },
    ],
    checkSuccess: [
      { speaker: "DRAMA", skill: true, text: "LASSO. Obviously. You're not in the business of keeping bad coefficients alive out of politeness. You set up the pipeline with the energy of a film director who knows exactly what they want: standardize features, rolling window cross-validation, L1 penalty, let lambda be chosen by the data. Every step is intentional. Theatrical execution is still execution." },
      { speaker: "NARRATOR", text: "You run the model. The coefficient paths trace downward on the regularization plot — each feature's story, compressed to a single line that eventually hits zero or doesn't." },
      { speaker: "DRAMA", skill: true, text: "The moon phase: dead by lambda 0.003. The CEO's golf handicap: dead by 0.001, barely trying. A variable labeled 'avg_competitor_twitter_sentiment_rolling_90d': survives — barely, coefficient of 0.08. Interesting. You'll investigate that later." },
      { speaker: "NARRATOR", text: "23 features survive. Test R² jumps from -0.34 to 0.71. The dramatic flair did not hurt the statistics one bit." },
      { speaker: "MATHEMATICS", skill: true, text: "Note for the record: rolling window cross-validation throughout. Time has a direction. The future cannot train the past." },
    ],
    checkFail: [
      { speaker: "DRAMA", skill: true, text: "You go for LASSO with theatrical gusto — and in your excitement, you shuffle the time series data before cross-validation. You train on 2022 data and test on 2019 data. The future is predicting the past. The model is cheating, and the metrics are lying." },
      { speaker: "MATHEMATICS", skill: true, text: "Temporal leakage. This is why time series data requires ROLLING WINDOW cross-validation, never random folds. You set up rolling windows and re-run. The drama cost you one crucial procedural step." },
      { speaker: "NARRATOR", text: "Results after the fix: 23 surviving features. Test R² of 0.71. Lessons learned about letting theater override methodology." },
    ],
    choices: [
      { text: "Present the results to management.", next: "finale", },
    ],
    choicesOnSuccess: [
      { text: "Present the results to management. You feel ready — even eager.", next: "finale", insight: "flawless_implementation" },
    ],
    choicesOnFail: [
      { text: "Recover the situation and present the corrected results.", next: "finale", },
    ],
  },

  choose_lasso: {
    id: "choose_lasso",
    passages: [
      { speaker: "NARRATOR", text: "LASSO it is. Time for a reckoning." },
    ],
    checkSuccess: [
      { speaker: "INTUITION", skill: true, text: "Your gut is running a fast, silent calculation: most of these features are noise dressed as signal. You can feel it. The moon phase. The CEO's golf handicap. Someone added these because they had a theory, not evidence. When you look at the feature list, it doesn't feel like 847 things that matter — it feels like 20 things that matter and 827 things that someone convinced themselves mattered." },
      { speaker: "NARRATOR", text: "You set up the LASSO regression with proper temporal cross-validation — five rolling windows, always training past and testing future." },
      { speaker: "MATHEMATICS", skill: true, text: "Key step: you standardize all features first. Without standardization, the penalty would punish variables for their units, not their importance. Standardized coefficients are comparable. The penalty is fair." },
      { speaker: "NARRATOR", text: "The model runs. λ is selected. Of 847 features, LASSO has retained 23. Eight hundred and twenty-four coefficients are exactly zero. The moon phase didn't make it. The CEO's golf handicap didn't make it. The Pantone Color of the Year, miraculously, has a coefficient of 0.02." },
      { speaker: "DRAMA", skill: true, text: "The Pantone Color of the Year SURVIVED? This is either a profound insight about consumer psychology or the most entertaining false positive in the history of econometrics." },
      { speaker: "NARRATOR", text: "Test R² has jumped from -0.34 to 0.71. Your gut was right. The truth was sparse." },
    ],
    checkFail: [
      { speaker: "INTUITION", skill: true, text: "You go with LASSO on gut instinct but forget to standardize your features. The variables are on wildly different scales, and LASSO penalizes all coefficients equally regardless of scale. A variable measured in millions gets a different treatment than one measured in fractions — not because it matters more, but because the math doesn't know the difference." },
      { speaker: "MATHEMATICS", skill: true, text: "Past-you's note WARNED you about this. You re-run with standardized features. The gut instinct was right about LASSO; the execution needed work." },
      { speaker: "NARRATOR", text: "Results after the fix: 23 surviving features. Test R² of 0.71." },
    ],
    choices: [
      { text: "Present the results to management.", next: "finale", },
    ],
    choicesOnSuccess: [
      { text: "Present the results. The model is clean. You are ready.", next: "finale", insight: "flawless_implementation" },
    ],
    choicesOnFail: [
      { text: "Standardize the features and re-run. Present the fixed results.", next: "finale", },
    ],
    id: "choose_ridge",
    passages: [
      { speaker: "NARRATOR", text: "Ridge. The conservative choice. The gentler path." },
    ],
    checkSuccess: [
      { speaker: "COMPOSURE", skill: true, text: "You've been here before — under pressure, with too many options and a deadline that passed two hours ago. And you've learned: when you're not sure which features matter, the conservative choice is usually correct. Ridge doesn't require you to bet that 824 features are useless. It just asks them all to behave." },
      { speaker: "NARRATOR", text: "You set up Ridge regression carefully. Standardize features. Temporal cross-validation. Let lambda be selected by held-out performance." },
      { speaker: "LOGIC", skill: true, text: "The multicollinearity problem resolves immediately — Ridge's λI term stabilizes the matrix inversion that was causing the wild coefficient swings. No more 4,372 fighting -3,891. The model is smooth, stable, and does not require you to decide in advance which features are garbage." },
      { speaker: "NARRATOR", text: "All 847 coefficients survive, but most are tiny. Test R² jumps from -0.34 to 0.63. Dependable. Honest." },
      { speaker: "INTUITION", skill: true, text: "The downside: you still have 847 coefficients. When someone asks why revenue dropped, you'll have to say 'a little bit of everything.' That's a political problem you'll solve at the presentation." },
    ],
    checkFail: [
      { speaker: "COMPOSURE", skill: true, text: "You reach for composure and find anxiety instead. Two hours past deadline, 847 features, a CFO who asked about the moon phase — your hands are shaking slightly. You set lambda too high. You wanted to be safe. You wanted to suppress the wild coefficients. You suppressed everything." },
      { speaker: "NARRATOR", text: "The model predicts almost the same value for every quarter. Training R² of 0.12. Test R² of 0.08. You've overconstrained it — traded overfitting for underfitting. The bias-variance dial has swung too far." },
      { speaker: "COMPOSURE", skill: true, text: "You exhale. Cross-validate lambda properly instead of choosing it by fear. The right lambda is the one that works on held-out data, not the one that feels safest. You re-run. The results recover." },
      { speaker: "NARRATOR", text: "Results after fix: stable model, test R² of 0.63. Some hard lessons about the difference between caution and paralysis." },
    ],
    choices: [
      { text: "Present the results to management.", next: "finale", },
    ],
    choicesOnSuccess: [
      { text: "Present the results. Steady, stable, dependable — just like the model.", next: "finale", insight: "flawless_implementation" },
    ],
    choicesOnFail: [
      { text: "Cross-validate properly and present the recovered results.", next: "finale", },
    ],
    id: "choose_elastic",
    passages: [
      { speaker: "NARRATOR", text: "Why choose one when you can have both? The Elastic Net awaits." },
    ],
    checkSuccess: [
      { speaker: "LOGIC", skill: true, text: "The argument for Elastic Net: LASSO fails when predictors are correlated because L1 arbitrarily kills one of a correlated pair. Ridge fails when you actually need sparsity because L2 keeps everything. Elastic Net's objective — minimize loss + λ₁Σ|βⱼ| + λ₂Σβⱼ² — keeps both. The L1 term provides sparsity; the L2 term keeps correlated features together rather than randomly eliminating one." },
      { speaker: "LOGIC", skill: true, text: "For this time series specifically: the lagged variables are correlated by construction (lag-1 and lag-2 revenue are related). Pure LASSO might arbitrarily kill lag-2 while keeping lag-1. Elastic Net would retain both at appropriate sizes and still eliminate the genuinely useless features. The hedged bet is, in this case, the correct bet." },
      { speaker: "NARRATOR", text: "You implement Elastic Net with the mixing parameter α controlling the L1/L2 balance. Cross-validation selects both α and λ across a grid. The model retains 67 features." },
      { speaker: "NARRATOR", text: "Test R²: 0.74. The best result yet." },
      { speaker: "RHETORIC", skill: true, text: "The Elastic Net is the coalition government of regularization. Compromise as a feature, not a bug." },
      { speaker: "DRAMA", skill: true, text: "The moon phase is still dead. Some things are beyond compromise." },
    ],
    checkFail: [
      { speaker: "LOGIC", skill: true, text: "You understand the concept — combine L1 and L2 — but get tangled in the implementation logic. Two hyperparameters now: λ and α. You need to search over a two-dimensional grid. But how fine a grid? And which α values? The logical structure of the approach is clear; the practical specification collapses into decision paralysis." },
      { speaker: "NARRATOR", text: "You implement a rough grid search and it works, eventually. The results are worth the struggle — Elastic Net outperforms either penalty alone." },
      { speaker: "NARRATOR", text: "Test R²: 0.74. The two-hyperparameter complexity cost you time but gained you accuracy." },
    ],
    choices: [
      { text: "Present the results to management.", next: "finale", },
    ],
    choicesOnSuccess: [
      { text: "Present the results. Best of both worlds — you nailed it.", next: "finale", insight: "flawless_implementation" },
    ],
    choicesOnFail: [
      { text: "Debug the cross-validation setup and present the results.", next: "finale", },
    ],
    id: "finale",
    passages: [
      { speaker: "NARRATOR", text: "You walk into the conference room. Management sits around the table like a tribunal. The projector hums." },
      { speaker: "NARRATOR", text: "You have the results. The regularized model works. But now you have to SELL it. Eight people in suits are staring at you. The CFO. The VP of Analytics. Dave, who added the moon phase variable and is looking defensive already." },
      { speaker: "NARRATOR", text: "How do you play this?" },
    ],
    choices: [
      { text: "[DRAMA] Make it a performance. Before and after. Hero's journey. The model that fell and rose again.", next: "finale_drama", check: { skill: "DRAMA", difficulty: 7 }, },
      { text: "[RHETORIC] Build a careful argument. Evidence, logic, implications. Let the numbers speak.", next: "finale_rhetoric", check: { skill: "RHETORIC", difficulty: 7 }, },
      { text: "Just show them the R² improvement and let the results do the talking.", next: "finale_plain", },
      { text: "[DRAMA — Practiced] You've told this story before, in your head. You know the beats. The villain (overfitting). The discipline (regularization). The redemption arc.", next: "finale_drama", condition: "hasDramaInsight", check: { skill: "DRAMA", difficulty: 5 }, },
      { text: "[RHETORIC — Prepared] You've already rehearsed the argument with a rubber duck. The logic is airtight. The CFO won't have a question you can't answer.", next: "finale_rhetoric", condition: "hasRhetoric", check: { skill: "RHETORIC", difficulty: 5 }, },
    ],
  },

  finale_drama: {
    id: "finale_drama",
    passages: [
      { speaker: "NARRATOR", text: "You stand. You don't sit behind the laptop like a technician delivering a report. You STAND, like a director presenting a film." },
    ],
    checkSuccess: [
      { speaker: "DRAMA", skill: true, text: "You open with the crime scene. Not the equations — the story. 'Eight months ago, someone added a variable called moon_phase_radians to this model, and nobody stopped them.' The room shifts. Dave shifts. You continue." },
      { speaker: "DRAMA", skill: true, text: "You describe what overfitting looks like from the inside: a model that has memorized every quarterly anomaly, every data entry error, every statistical hiccup in fifteen years of history. 'This model knew the past with perfect precision and understood the future not at all. It had learned the wrong things by heart.'" },
      { speaker: "DRAMA", skill: true, text: "Then: the penalty. You don't call it regularization. You call it accountability. 'We added a cost for complexity. The model now has to justify every feature it keeps. And when we made it justify 847 features, 824 of them couldn't.' You show the before/after chart. The room goes quiet in the right way." },
      { speaker: "NARRATOR", text: "The VP of Analytics is leaning forward. Even Dave looks grudgingly impressed." },
      { speaker: "NARRATOR", text: "The CFO asks: 'So the moon phase... doesn't predict revenue?'" },
    ],
    checkFail: [
      { speaker: "DRAMA", skill: true, text: "You open with the full theatrical flourish — 'What I'm about to show you is a story of hubris, of a model that flew too close to the sun of its own training data—' and the CFO checks her watch. Dave smirks. The VP of Analytics types something on his laptop." },
      { speaker: "NARRATOR", text: "The drama landed before you'd established the stakes. You've given the performance before the audience knew what they were watching. You recover, cut to the numbers, and show the results plainly." },
      { speaker: "NARRATOR", text: "The CFO asks: 'So the moon phase... doesn't predict revenue?'" },
    ],
    choices: [
      { text: "[COMPOSURE] Hold her gaze and deliver the technical answer with perfect calm.", next: "finale_cfo", check: { skill: "COMPOSURE", difficulty: 7 }, },
      { text: "Nod and quickly move to the next slide.", next: "finale_end", },
    ],
    choicesOnSuccess: [
      { text: "[COMPOSURE] The room is with you. Hold her gaze and close this perfectly.", next: "finale_cfo", check: { skill: "COMPOSURE", difficulty: 5 }, },
      { text: "Nod, smile, and click to the next slide. You've already won the room.", next: "finale_end", },
    ],
    choicesOnFail: [
      { text: "The drama flopped. Just answer the CFO's question directly.", next: "finale_cfo", check: { skill: "COMPOSURE", difficulty: 8 }, },
      { text: "Nod awkwardly and move on before more damage is done.", next: "finale_end", },
    ],
    id: "finale_rhetoric",
    passages: [
      { speaker: "NARRATOR", text: "You take a breath. Build the argument brick by brick." },
    ],
    checkSuccess: [
      { speaker: "RHETORIC", skill: true, text: "You build the case in three steps. First, establish what went wrong and why anyone should care: 'Our model was predicting less accurately than guessing the average. Training R² of 0.99 masking a test R² of negative 0.34. We were confident and wrong, which is the most expensive combination in forecasting.'" },
      { speaker: "RHETORIC", skill: true, text: "Second, explain the cause without jargon: 'The model had 847 inputs. Most of them were noise. With that many inputs and no constraint on complexity, the model memorized the training data instead of learning from it. This is a known problem with a known solution.' Now they're ready to hear the solution." },
      { speaker: "RHETORIC", skill: true, text: "Third, show the result: 'We added a penalty for complexity. The model now has 23 inputs. It can no longer memorize. It has to generalize. Test R² went from negative 0.34 to 0.71.' You pause. 'These forecasts can be trusted in a way the previous ones could not.'" },
      { speaker: "NARRATOR", text: "The room is nodding. The argument was built for them, not for you." },
      { speaker: "NARRATOR", text: "The CFO asks: 'So the moon phase... doesn't predict revenue?'" },
    ],
    checkFail: [
      { speaker: "RHETORIC", skill: true, text: "You build the argument but can't decide who you're building it for. 'The L1 penalty's constraint region creates a diamond-shaped feasible set — I mean, the model learned to select features — what I mean is, LASSO uses absolute values instead of squares in the penalty term, which creates sparsity due to the KKT conditions at corner solutions...'" },
      { speaker: "NARRATOR", text: "The CFO's expression is polite and completely uncomprehending. The argument was correct. It was built for a different audience — someone who already understood what you were explaining." },
      { speaker: "NARRATOR", text: "You simplify and show the numbers. The results speak for themselves, even if the explanation got lost." },
      { speaker: "NARRATOR", text: "The CFO asks: 'So the moon phase... doesn't predict revenue?'" },
    ],
    choices: [
      { text: "[COMPOSURE] Hold her gaze and deliver the technical answer with perfect calm.", next: "finale_cfo", check: { skill: "COMPOSURE", difficulty: 7 }, },
      { text: "Nod and quickly move to the next slide.", next: "finale_end", },
    ],
    choicesOnSuccess: [
      { text: "[COMPOSURE] The room is nodding. Close the case — answer the CFO with the same precision.", next: "finale_cfo", check: { skill: "COMPOSURE", difficulty: 5 }, },
      { text: "The argument landed. Nod and advance — the case is made.", next: "finale_end", },
    ],
    choicesOnFail: [
      { text: "You lost the room. Recover with composure — answer the CFO's question plainly.", next: "finale_cfo", check: { skill: "COMPOSURE", difficulty: 9 }, },
      { text: "Cut your losses and move on to the next slide.", next: "finale_end", },
    ],
    id: "finale_plain",
    passages: [
      { speaker: "NARRATOR", text: "You open the laptop and show the numbers. Before: R² = -0.34. After: R² = 0.71. The chart speaks for itself." },
      { speaker: "NARRATOR", text: "The room is quiet. It's not a dramatic silence — more of a 'we're processing' silence." },
      { speaker: "NARRATOR", text: "The CFO asks: 'So the moon phase... doesn't predict revenue?'" },
    ],
    choices: [
      { text: "[COMPOSURE] Hold her gaze and deliver the technical answer with perfect calm.", next: "finale_cfo", check: { skill: "COMPOSURE", difficulty: 7 }, },
      { text: "Nod and quickly move to the next slide.", next: "finale_end", },
    ],
  },

  finale_cfo: {
    id: "finale_cfo",
    passages: [
      { speaker: "NARRATOR", text: "You meet the CFO's eyes. This is the moment." },
    ],
    checkSuccess: [
      { speaker: "COMPOSURE", skill: true, text: "You meet her eyes without flinching. There is no hurry. The answer exists and you know it." },
      { speaker: "COMPOSURE", skill: true, text: "'The LASSO penalty drove the moon phase coefficient to exactly zero, which means the model found that no level of lunar influence justified its computational cost against the other available predictors. If the moon were actually driving revenue, it would have survived — the model gives every feature a chance to prove its value. This one couldn't.'" },
      { speaker: "NARRATOR", text: "She nods slowly. 'Good. That was Dave's idea. I never liked Dave.'" },
      { speaker: "NARRATOR", text: "Dave stares at his coffee. The room exhales." },
      { speaker: "NARRATOR", text: "You sit down. The model runs in production. The forecasts are good — not perfect, never perfect, but honest. You've replaced a beautiful lie with a useful truth." },
      { speaker: "DRAMA", skill: true, text: "And somewhere in your desk drawer, the rubber duck smiles. Or at least, it squeaks a little." },
      { speaker: "NARRATOR", text: "— FIN —" },
    ],
    checkFail: [
      { speaker: "COMPOSURE", skill: true, text: "The question is simple. You know the answer. But the CFO's direct eye contact has activated every anxiety in your nervous system simultaneously." },
      { speaker: "COMPOSURE", skill: true, text: "'The moon phase... yes. The, uh, the model — LASSO — what it did was it set the coefficient to zero, which means it was penalized into — the regularization parameter determined that...' You can see your own hands. They're doing something strange." },
      { speaker: "NARRATOR", text: "'It doesn't predict revenue,' the VP of Analytics finishes for you. 'That's fine. Good work.' It's a merciful save. He's been there." },
      { speaker: "NARRATOR", text: "You sit down. The model runs in production. The forecasts are good — not perfect, never perfect, but honest. You've replaced a beautiful lie with a useful truth. Even if the delivery was a bit shaky at the end." },
      { speaker: "DRAMA", skill: true, text: "The rubber duck, had it been present, would have offered a sympathetic squeak." },
      { speaker: "NARRATOR", text: "— FIN —" },
    ],
    choices: [
      { text: "Review what you've learned.", next: "summary", },
      { text: "Test your knowledge — take the quiz.", next: "quiz_start", },
      { text: "Start over with different skills.", next: "restart", },
    ],
  },

  finale_end: {
    id: "finale_end",
    passages: [
      { speaker: "NARRATOR", text: "You nod and click to the next slide. The moment passes." },
      { speaker: "NARRATOR", text: "'Good,' the CFO says. 'That was Dave's idea. I never liked Dave.'" },
      { speaker: "NARRATOR", text: "You sit down. The model runs in production. The forecasts are good — not perfect, never perfect, but honest. You've replaced a beautiful lie with a useful truth." },
      { speaker: "DRAMA", skill: true, text: "And somewhere in your desk drawer, the rubber duck smiles. Or at least, it squeaks a little." },
      { speaker: "NARRATOR", text: "— FIN —" },
    ],
    choices: [
      { text: "Review what you've learned.", next: "summary", },
      { text: "Test your knowledge — take the quiz.", next: "quiz_start", },
      { text: "Start over with different skills.", next: "restart", },
    ],
  },

  summary: {
    id: "summary",
    passages: [
      { speaker: "NARRATOR", text: "YOUR CASE NOTES — A Summary of Regularization" },
      { speaker: "LOGIC", skill: true, text: "RIDGE REGRESSION (L2): Adds λΣβⱼ² to the loss function. Shrinks all coefficients toward zero but never eliminates any. Handles multicollinearity well. Has a closed-form solution. Best when many features each contribute a small amount of signal." },
      { speaker: "LOGIC", skill: true, text: "LASSO REGRESSION (L1): Adds λΣ|βⱼ| to the loss function. Shrinks coefficients AND can drive them to exactly zero — performing automatic feature selection. Best when the true model is sparse (few important features among many irrelevant ones)." },
      { speaker: "LOGIC", skill: true, text: "ELASTIC NET: Combines L1 and L2 penalties. Gets LASSO's sparsity and Ridge's stability with correlated features. Often the best default choice, especially for time series with correlated temporal features." },
      { speaker: "MATHEMATICS", skill: true, text: "KEY CONCEPTS: Lambda (λ) controls regularization strength. Must be selected via cross-validation. For time series, use temporal CV (rolling/expanding window), never random folds. Always standardize features before regularization." },
      { speaker: "INTUITION", skill: true, text: "THE GEOMETRIC INSIGHT: Ridge's L2 constraint is a circle (smooth, no corners = no zero coefficients). LASSO's L1 constraint is a diamond (sharp corners on axes = coefficients driven to zero). The shape of the constraint determines whether features live or die." },
      { speaker: "NARRATOR", text: "Case closed. Until the next model breaks." },
    ],
    choices: [
      { text: "Test your knowledge — take the quiz.", next: "quiz_start", },
      { text: "Play again with different skills.", next: "restart", },
    ],
  },
};

// ─── Quiz Questions ───

const QUIZ_QUESTIONS = [
  {
    question: "What does regularization add to the OLS loss function?",
    options: ["More training data", "A penalty term on coefficient size", "A bonus for larger coefficients", "A second dependent variable"],
    correct: 1,
    explanationRight: "Exactly. Regularization adds a penalty that increases the cost when coefficients grow large, forcing the model to balance fit against simplicity.",
    explanationWrong: "Not quite. Regularization adds a PENALTY TERM on coefficient size to the loss function. This forces the model to keep coefficients small — trading a bit of training fit for better generalization.",
  },
  {
    question: "What is the key difference between Ridge and LASSO?",
    options: [
      "Ridge uses L1 penalty, LASSO uses L2",
      "Ridge can set coefficients to exactly zero, LASSO cannot",
      "Ridge shrinks coefficients but never to zero; LASSO can eliminate them entirely",
      "There is no meaningful difference"
    ],
    correct: 2,
    explanationRight: "That's it. Ridge (L2) shrinks everything toward zero but nothing ever reaches it. LASSO (L1) can drive coefficients to exactly zero — performing automatic feature selection.",
    explanationWrong: "It's the other way around. RIDGE (L2 penalty, Σβⱼ²) shrinks all coefficients toward zero but never eliminates any. LASSO (L1 penalty, Σ|βⱼ|) can drive coefficients to EXACTLY zero, effectively removing features from the model.",
  },
  {
    question: "Why does LASSO produce sparse solutions (coefficients at exactly zero) while Ridge doesn't?",
    options: [
      "LASSO uses a higher learning rate",
      "The diamond shape of the L1 constraint has corners on the axes where coefficients are zero",
      "LASSO runs more iterations",
      "Ridge only works with small datasets"
    ],
    correct: 1,
    explanationRight: "The geometric insight! The L1 constraint region is a diamond with sharp corners sitting on the axes. The loss function's elliptical contours are more likely to first touch the diamond at these corners — where one or more coefficients are exactly zero.",
    explanationWrong: "It's about geometry. The L1 constraint is shaped like a DIAMOND with corners on the axes. The loss function's contour ellipses tend to touch the diamond at these corners, where coefficients are zero. The L2 constraint is a smooth CIRCLE with no corners, so contact happens at non-zero points.",
  },
  {
    question: "What does lambda (λ) control in regularized regression?",
    options: [
      "The number of features in the dataset",
      "The size of the training set",
      "The strength of the regularization penalty",
      "The learning rate of the optimizer"
    ],
    correct: 2,
    explanationRight: "Lambda controls the trade-off between fitting the data and keeping coefficients small. λ = 0 gives you OLS (no penalty). As λ increases, coefficients shrink more aggressively.",
    explanationWrong: "Lambda (λ) controls the STRENGTH of the regularization penalty. When λ = 0, there's no penalty and you get ordinary least squares. As λ → ∞, all coefficients are forced toward zero. The right λ is found via cross-validation.",
  },
  {
    question: "When cross-validating a time series model, why can't you use standard random k-fold CV?",
    options: [
      "Time series data is too large for k-fold",
      "Random folds would let future data leak into training, violating temporal order",
      "K-fold only works with classification problems",
      "Random folds are slower to compute"
    ],
    correct: 1,
    explanationRight: "Time has a direction. If you randomly shuffle your data into folds, you might train on 2024 data and test on 2022 — letting the future predict the past. You need rolling or expanding window CV to respect causality.",
    explanationWrong: "The issue is TEMPORAL LEAKAGE. Random folds can put future observations in the training set and past observations in the test set. This means the model cheats by seeing the future. For time series, you must use rolling or expanding window CV to keep the future out of training.",
  },
  {
    question: "A model has training R² = 0.99 and test R² = -0.34. What is the likely problem?",
    options: [
      "Underfitting — the model is too simple",
      "Overfitting — the model memorized training data but doesn't generalize",
      "The data has no signal at all",
      "The test set is too large"
    ],
    correct: 1,
    explanationRight: "Classic overfitting. The huge gap between training and test performance means the model has memorized the noise in the training data. A negative test R² means it's doing WORSE than simply predicting the mean.",
    explanationWrong: "This is OVERFITTING. A training R² of 0.99 with a test R² of -0.34 means the model has memorized the training data perfectly but learned nothing generalizable. Negative R² means the model predicts worse than just guessing the average value.",
  },
  {
    question: "Why must you standardize features before applying LASSO or Ridge?",
    options: [
      "To make the algorithm run faster",
      "Because the penalty treats all coefficients equally, but coefficient size depends on the scale of the input variable",
      "Standardization is optional and doesn't affect results",
      "To convert all features to the same data type"
    ],
    correct: 1,
    explanationRight: "If one feature is in millions and another is between 0 and 1, their coefficients will be on completely different scales — but the penalty doesn't know that. Without standardization, you're penalizing features for being measured in large or small units, not for their actual importance.",
    explanationWrong: "The penalty treats a coefficient of 100 the same regardless of whether the input ranges from 0-1 or 0-1,000,000. Without standardization, you're penalizing variables for their UNITS, not their importance. A feature measured in millimeters will have a much smaller coefficient than one measured in kilometers — even if they're equally important.",
  },
  {
    question: "What is Elastic Net?",
    options: [
      "A neural network architecture",
      "A combination of L1 (LASSO) and L2 (Ridge) penalties",
      "A visualization technique for regression",
      "Another name for ordinary least squares"
    ],
    correct: 1,
    explanationRight: "Elastic Net combines both penalties: λ₁Σ|βⱼ| + λ₂Σβⱼ². You get LASSO's feature selection AND Ridge's stability with correlated predictors. Often the best default for real-world data.",
    explanationWrong: "Elastic Net combines BOTH the L1 (LASSO) and L2 (Ridge) penalties into a single model. This gives you LASSO's ability to eliminate features AND Ridge's graceful handling of correlated predictors. It has two hyperparameters to tune instead of one.",
  },
  {
    question: "When is Ridge regression typically preferred over LASSO?",
    options: [
      "When you want a sparse model with few features",
      "When most features contribute a small amount of signal and multicollinearity is present",
      "When you have very few features",
      "When you don't care about prediction accuracy"
    ],
    correct: 1,
    explanationRight: "Ridge shines when the true signal is distributed across many features and predictors are correlated. It shares the effect among correlated variables rather than arbitrarily picking one (which LASSO tends to do).",
    explanationWrong: "Ridge is best when MANY features each contribute a small amount of predictive signal and when predictors are correlated (multicollinearity). Ridge distributes effect among correlated predictors gracefully, while LASSO would arbitrarily pick one and kill the rest.",
  },
  {
    question: "What does a negative R² on the test set mean?",
    options: [
      "The model is perfect",
      "The model predicts worse than simply guessing the mean of the target variable",
      "The data has negative values",
      "The model needs more training epochs"
    ],
    correct: 1,
    explanationRight: "A negative test R² means your model's predictions are further from the true values than a flat line at the mean would be. You'd literally do better by ignoring all your features and just predicting the average every time.",
    explanationWrong: "Negative R² means the model is WORSE THAN USELESS — it predicts less accurately than simply guessing the mean value every time. If you replaced the entire model with a sticky note saying 'predict the average,' you'd get better results.",
  },
];


function SkillTag({ skill }) {
  const s = SKILLS[skill];
  if (!s) return null;
  return (
    <span style={{
      display: "inline-block",
      fontSize: "10px",
      fontWeight: 700,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: s.color,
      borderBottom: `1px solid ${s.color}44`,
      paddingBottom: "1px",
    }}>{s.name}</span>
  );
}

function Typewriter({ text, speed = typewriterDelay, onComplete }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const completedRef = useRef(false);

  useEffect(() => {
    setDisplayed("");
    indexRef.current = 0;
    completedRef.current = false;
    const interval = setInterval(() => {
      indexRef.current++;
      if (indexRef.current >= text.length) {
        setDisplayed(text);
        clearInterval(interval);
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
      } else {
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayed}</span>;
}

function Passage({ passage, animate, onComplete }) {
  const isSkill = passage.skill;
  const skillData = SKILLS[passage.speaker];
  const isNarrator = passage.speaker === "NARRATOR";

  return (
    <div style={{
      marginBottom: "18px",
      paddingLeft: isSkill ? "16px" : "0",
      borderLeft: isSkill ? `2px solid ${skillData?.color || "#666"}55` : "none",
      animation: animate ? "fadeSlideIn 0.4s ease" : "none",
    }}>
      {!isNarrator && (
        <div style={{ marginBottom: "5px" }}>
          <SkillTag skill={passage.speaker} />
        </div>
      )}
      <div style={{
        fontFamily: isNarrator ? "'Libre Baskerville', 'Georgia', serif" : "'DM Sans', 'Helvetica Neue', sans-serif",
        fontSize: isNarrator ? "15.5px" : "14.5px",
        lineHeight: "1.75",
        color: isNarrator ? "#d4c5a9" : (skillData?.color || "#aaa"),
        fontStyle: isSkill ? "italic" : "normal",
        opacity: isNarrator ? 1 : 0.92,
        whiteSpace: "pre-wrap",
      }}>
        {animate ? (
          <Typewriter text={passage.text} onComplete={onComplete} />
        ) : (
          passage.text
        )}
      </div>
    </div>
  );
}

function CheckResult({ passed, skillName }) {
  const s = SKILLS[skillName];
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "6px 14px",
      marginBottom: "16px",
      borderRadius: "3px",
      backgroundColor: passed ? "#1b3a1b" : "#3a1b1b",
      border: `1px solid ${passed ? "#2d5a2d" : "#5a2d2d"}`,
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "12px",
      fontWeight: 600,
      letterSpacing: "1px",
      textTransform: "uppercase",
      color: passed ? "#6fbf6f" : "#bf6f6f",
      animation: "fadeSlideIn 0.3s ease",
    }}>
      <span style={{ fontSize: "14px" }}>{passed ? "✓" : "✗"}</span>
      {skillName} CHECK — {passed ? "SUCCESS" : "FAILURE"}
    </div>
  );
}

function ChoiceButton({ choice, stats, onClick, visible }) {
  const [hovered, setHovered] = useState(false);
  const hasCheck = choice.check;
  const skillData = hasCheck ? SKILLS[choice.check.skill] : null;
  const difficulty = hasCheck ? choice.check.difficulty : 0;
  const statVal = hasCheck ? stats[choice.check.skill] : 0;
  const successChance = hasCheck ? Math.min(100, Math.max(0, Math.round(((statVal + 7 - difficulty) / 12) * 100))) : null;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        width: "100%",
        padding: "14px 18px",
        marginBottom: "8px",
        background: hovered ? "#2a2520" : "#1e1b17",
        border: `1px solid ${hovered ? (skillData?.color || "#d4c5a955") : "#4a453d44"}`,
        borderRadius: "3px",
        textAlign: "left",
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "14px",
        lineHeight: "1.5",
        color: hovered ? "#e8dcc8" : "#b8a888",
        transition: "all 0.2s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transitionDelay: "0.1s",
      }}
    >
      {choice.text}
      {hasCheck && (
        <span style={{
          display: "block",
          fontSize: "10px",
          marginTop: "4px",
          color: skillData?.color || "#888",
          letterSpacing: "0.5px",
          opacity: 0.8,
        }}>
          Difficulty {difficulty} — Your {choice.check.skill}: {statVal} — ~{successChance}% chance
        </span>
      )}
    </button>
  );
}

function StatBar({ skill, value, color, onIncrement, onDecrement, canIncrement, canDecrement }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "4px 0",
      }}
    >
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        color: color,
        width: "100px",
        flexShrink: 0,
      }}>{skill}</span>
      <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            width: "14px",
            height: "14px",
            borderRadius: "2px",
            backgroundColor: i < value ? color : "#2a2520",
            border: `1px solid ${i < value ? color : "#4a453d44"}`,
            transition: "all 0.2s",
          }} />
        ))}
      </div>
      {onIncrement && (
        <div style={{ display: "flex", gap: "2px", opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}>
          <button onClick={onDecrement} disabled={!canDecrement}
            style={{
              width: "20px", height: "20px", borderRadius: "2px",
              backgroundColor: canDecrement ? "#2a2520" : "transparent",
              border: `1px solid ${canDecrement ? "#4a453d" : "transparent"}`,
              color: canDecrement ? "#d4c5a9" : "transparent",
              cursor: canDecrement ? "pointer" : "default",
              fontSize: "12px", fontWeight: 700, lineHeight: "1",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>−</button>
          <button onClick={onIncrement} disabled={!canIncrement}
            style={{
              width: "20px", height: "20px", borderRadius: "2px",
              backgroundColor: canIncrement ? "#2a2520" : "transparent",
              border: `1px solid ${canIncrement ? "#4a453d" : "transparent"}`,
              color: canIncrement ? "#d4c5a9" : "transparent",
              cursor: canIncrement ? "pointer" : "default",
              fontSize: "12px", fontWeight: 700, lineHeight: "1",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>+</button>
        </div>
      )}
    </div>
  );
}

// ─── Main App ───

export default function DiscoRegularization() {
  const [phase, setPhase] = useState("chargen"); // chargen | game | quiz
  const [stats, setStats] = useState({ ...INITIAL_STATS });
  const [pool, setPool] = useState(POINT_POOL);
  const [scene, setScene] = useState("intro");
  const [passageIndex, setPassageIndex] = useState(0);
  const [revealedPassages, setRevealedPassages] = useState([]);
  const [showChoices, setShowChoices] = useState(false);
  const [checkResult, setCheckResult] = useState(null); // {passed, skill}
  const [visitedScenes, setVisitedScenes] = useState(new Set());
  const scrollRef = useRef(null);
  const [animatingIdx, setAnimatingIdx] = useState(0);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizRevealed, setQuizRevealed] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]); // track all answers for review
  const [quizFinished, setQuizFinished] = useState(false);
  const [shuffledQuiz, setShuffledQuiz] = useState([]);

  const currentScene = SCENES[scene];

  // Determine passages to show (including check results)
  const getEffectivePassages = useCallback(() => {
    if (!currentScene) return [];
    let passages = [...currentScene.passages];
    if (checkResult !== null && currentScene[checkResult.passed ? "checkSuccess" : "checkFail"]) {
      passages = [...passages, ...currentScene[checkResult.passed ? "checkSuccess" : "checkFail"]];
    }
    return passages;
  }, [currentScene, checkResult]);

  const effectivePassages = getEffectivePassages();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [revealedPassages, showChoices]);

  // Advance passages one by one
  const advancePassage = useCallback(() => {
    if (animatingIdx < effectivePassages.length) {
      setRevealedPassages(prev => [...prev, effectivePassages[animatingIdx]]);
      setAnimatingIdx(prev => prev + 1);
    }
  }, [animatingIdx, effectivePassages]);

  // Start first passage when scene loads
  useEffect(() => {
    if (phase === "game" && effectivePassages.length > 0 && revealedPassages.length === 0) {
      advancePassage();
    }
  }, [phase, scene, checkResult]);

  const handlePassageComplete = useCallback(() => {
    if (animatingIdx < effectivePassages.length) {
      setTimeout(() => advancePassage(), 200);
    } else {
      setTimeout(() => setShowChoices(true), 300);
    }
  }, [animatingIdx, effectivePassages, advancePassage]);

  const handleChoice = (choice) => {
    if (choice.next === "restart") {
      setPhase("chargen");
      setStats({ ...INITIAL_STATS });
      setPool(POINT_POOL);
      setScene("intro");
      setPassageIndex(0);
      setRevealedPassages([]);
      setShowChoices(false);
      setCheckResult(null);
      setVisitedScenes(new Set());
      setAnimatingIdx(0);
      return;
    }

    if (choice.next === "quiz_start") {
      const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
      setShuffledQuiz(shuffled);
      setQuizIndex(0);
      setQuizSelected(null);
      setQuizRevealed(false);
      setQuizScore(0);
      setQuizAnswers([]);
      setQuizFinished(false);
      setPhase("quiz");
      return;
    }

    const nextScene = SCENES[choice.next];
    let newCheckResult = null;

    if (choice.check) {
      const passed = rollCheck(stats[choice.check.skill], choice.check.difficulty);
      newCheckResult = { passed, skill: choice.check.skill };
    }

    setVisitedScenes(prev => new Set([...prev, choice.next]));
    setScene(choice.next);
    setRevealedPassages([]);
    setShowChoices(false);
    setAnimatingIdx(0);
    setCheckResult(newCheckResult);
  };

  const skipAnimation = () => {
    if (animatingIdx < effectivePassages.length) {
      setRevealedPassages(effectivePassages);
      setAnimatingIdx(effectivePassages.length);
      setShowChoices(true);
    }
  };

  // Filter choices (e.g., hide "explore Ridge" if already visited)
  const getVisibleChoices = () => {
    if (!currentScene) return [];
    return currentScene.choices.filter(c => {
      if (c.condition === "needsRidge" && visitedScenes.has("ridge_deep")) return false;
      return true;
    });
  };

  // ─── Character Generation ───
  if (phase === "chargen") {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#141210",
        color: "#d4c5a9",
        fontFamily: "'Libre Baskerville', 'Georgia', serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;700&family=Crimson+Pro:wght@200;400;600&display=swap');
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: #1a1815; }
          ::-webkit-scrollbar-thumb { background: #4a453d; border-radius: 3px; }
        `}</style>

        <div style={{ maxWidth: "480px", width: "100%", animation: "fadeSlideIn 0.6s ease" }}>
          <div style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: "11px",
            fontWeight: 200,
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "#8a7e6a",
            textAlign: "center",
            marginBottom: "8px",
          }}>
            A Regularization Mystery
          </div>
          <h1 style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: "36px",
            fontWeight: 600,
            textAlign: "center",
            marginBottom: "8px",
            letterSpacing: "1px",
            color: "#e8dcc8",
          }}>
            PENALTY CITY
          </h1>
          <div style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#8a7e6a",
            marginBottom: "40px",
            fontStyle: "italic",
          }}>
            Ridge, LASSO, and the Curse of 847 Features
          </div>

          <div style={{
            backgroundColor: "#1a1815",
            border: "1px solid #2a2520",
            borderRadius: "4px",
            padding: "24px",
            marginBottom: "24px",
          }}>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "#8a7e6a",
              marginBottom: "16px",
            }}>
              ALLOCATE YOUR SKILL POINTS
            </div>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "12px",
              color: pool > 0 ? "#d4c5a9" : "#6a6050",
              marginBottom: "20px",
              padding: "8px 12px",
              backgroundColor: "#141210",
              borderRadius: "3px",
              textAlign: "center",
            }}>
              {pool > 0 ? `${pool} point${pool > 1 ? 's' : ''} remaining — hover over skills to adjust` : "All points allocated"}
            </div>

            {Object.entries(SKILLS).map(([key, skill]) => (
              <div key={key}>
                <StatBar
                  skill={skill.name}
                  value={stats[key]}
                  color={skill.color}
                  canIncrement={pool > 0 && stats[key] < 6}
                  canDecrement={stats[key] > INITIAL_STATS[key]}
                  onIncrement={() => {
                    if (pool > 0 && stats[key] < 6) {
                      setStats(s => ({ ...s, [key]: s[key] + 1 }));
                      setPool(p => p - 1);
                    }
                  }}
                  onDecrement={() => {
                    if (stats[key] > INITIAL_STATS[key]) {
                      setStats(s => ({ ...s, [key]: s[key] - 1 }));
                      setPool(p => p + 1);
                    }
                  }}
                />
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "11px",
                  color: "#6a6050",
                  marginLeft: "108px",
                  marginBottom: "10px",
                  lineHeight: "1.4",
                }}>
                  {skill.desc}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase("game")}
            style={{
              display: "block",
              width: "100%",
              padding: "16px",
              backgroundColor: "#2a2520",
              border: "1px solid #4a453d",
              borderRadius: "3px",
              color: "#d4c5a9",
              fontFamily: "'Crimson Pro', serif",
              fontSize: "16px",
              fontWeight: 600,
              letterSpacing: "1px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.target.style.backgroundColor = "#3a3530"; e.target.style.borderColor = "#6a6050"; }}
            onMouseLeave={e => { e.target.style.backgroundColor = "#2a2520"; e.target.style.borderColor = "#4a453d"; }}
          >
            BEGIN INVESTIGATION
          </button>
        </div>
      </div>
    );
  }

  // ─── Quiz Phase ───
  if (phase === "quiz") {
    const currentQ = shuffledQuiz[quizIndex];
    const totalQs = shuffledQuiz.length;

    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#141210",
        color: "#d4c5a9",
        fontFamily: "'Libre Baskerville', 'Georgia', serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;700&family=Crimson+Pro:wght@200;400;600&display=swap');
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: #1a1815; }
          ::-webkit-scrollbar-thumb { background: #4a453d; border-radius: 3px; }
        `}</style>

        <div style={{ maxWidth: "600px", width: "100%" }}>
          {/* Header */}
          <div style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: "10px",
            fontWeight: 200,
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "#6a6050",
            marginBottom: "4px",
          }}>
            Penalty City
          </div>
          <h1 style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: "28px",
            fontWeight: 600,
            color: "#e8dcc8",
            marginBottom: "24px",
            letterSpacing: "1px",
          }}>
            KNOWLEDGE CHECK
          </h1>

          {/* Progress */}
          <div style={{
            display: "flex",
            gap: "4px",
            marginBottom: "32px",
          }}>
            {shuffledQuiz.map((_, i) => (
              <div key={i} style={{
                flex: 1,
                height: "3px",
                borderRadius: "2px",
                backgroundColor: i < quizIndex ? (quizAnswers[i]?.correct ? "#66bb6a" : "#ef5350")
                  : i === quizIndex ? "#ab47bc"
                  : "#2a2520",
                transition: "all 0.3s",
              }} />
            ))}
          </div>

          {!quizFinished ? (
            <div key={quizIndex} style={{ animation: "fadeSlideIn 0.4s ease" }}>
              {/* Question number */}
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#6a6050",
                marginBottom: "12px",
              }}>
                Question {quizIndex + 1} of {totalQs}
                <span style={{ float: "right", color: "#8a7e6a" }}>
                  Score: {quizScore}/{quizIndex}
                </span>
              </div>

              {/* Question */}
              <div style={{
                fontSize: "17px",
                lineHeight: "1.7",
                color: "#e8dcc8",
                marginBottom: "24px",
                padding: "20px 24px",
                backgroundColor: "#1a1815",
                border: "1px solid #2a2520",
                borderRadius: "4px",
              }}>
                {currentQ.question}
              </div>

              {/* Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
                {currentQ.options.map((opt, i) => {
                  const isSelected = quizSelected === i;
                  const isCorrect = i === currentQ.correct;
                  const showResult = quizRevealed;

                  let bg = "#1e1b17";
                  let border = "#4a453d44";
                  let textColor = "#b8a888";

                  if (showResult) {
                    if (isCorrect) {
                      bg = "#1b3a1b";
                      border = "#2d5a2d";
                      textColor = "#6fbf6f";
                    } else if (isSelected && !isCorrect) {
                      bg = "#3a1b1b";
                      border = "#5a2d2d";
                      textColor = "#bf6f6f";
                    } else {
                      textColor = "#6a6050";
                    }
                  } else if (isSelected) {
                    bg = "#2a2520";
                    border = "#ab47bc55";
                    textColor = "#e8dcc8";
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (!quizRevealed) setQuizSelected(i);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        width: "100%",
                        padding: "14px 18px",
                        background: bg,
                        border: `1px solid ${border}`,
                        borderRadius: "3px",
                        textAlign: "left",
                        cursor: quizRevealed ? "default" : "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        color: textColor,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        border: `1px solid ${showResult && isCorrect ? "#2d5a2d" : showResult && isSelected ? "#5a2d2d" : isSelected ? "#ab47bc55" : "#4a453d44"}`,
                        backgroundColor: showResult && isCorrect ? "#2d5a2d" : showResult && isSelected && !isCorrect ? "#5a2d2d" : isSelected ? "#2a2520" : "transparent",
                        fontSize: "11px",
                        fontWeight: 700,
                        flexShrink: 0,
                        color: showResult && isCorrect ? "#6fbf6f" : showResult && isSelected ? "#bf6f6f" : isSelected ? "#ab47bc" : "#6a6050",
                      }}>
                        {showResult ? (isCorrect ? "✓" : isSelected ? "✗" : String.fromCharCode(65 + i)) : String.fromCharCode(65 + i)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Submit / Explanation */}
              {!quizRevealed ? (
                <button
                  onClick={() => {
                    if (quizSelected === null) return;
                    const isCorrect = quizSelected === currentQ.correct;
                    if (isCorrect) setQuizScore(s => s + 1);
                    setQuizAnswers(prev => [...prev, { questionIndex: quizIndex, selected: quizSelected, correct: isCorrect }]);
                    setQuizRevealed(true);
                  }}
                  disabled={quizSelected === null}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "14px",
                    backgroundColor: quizSelected !== null ? "#2a2520" : "#1a1815",
                    border: `1px solid ${quizSelected !== null ? "#4a453d" : "#2a2520"}`,
                    borderRadius: "3px",
                    color: quizSelected !== null ? "#d4c5a9" : "#4a453d",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    cursor: quizSelected !== null ? "pointer" : "default",
                    transition: "all 0.2s",
                  }}
                >
                  Check Answer
                </button>
              ) : (
                <div style={{ animation: "fadeSlideIn 0.4s ease" }}>
                  {/* Explanation */}
                  <div style={{
                    padding: "16px 20px",
                    marginBottom: "16px",
                    borderRadius: "4px",
                    backgroundColor: quizSelected === currentQ.correct ? "#1b3a1b" : "#3a1b1b",
                    border: `1px solid ${quizSelected === currentQ.correct ? "#2d5a2d" : "#5a2d2d"}`,
                  }}>
                    <div style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: quizSelected === currentQ.correct ? "#66bb6a" : "#ef5350",
                      marginBottom: "8px",
                    }}>
                      {quizSelected === currentQ.correct ? "✓ Correct!" : "✗ Not quite"}
                    </div>
                    <div style={{
                      fontFamily: "'Libre Baskerville', serif",
                      fontSize: "14px",
                      lineHeight: "1.7",
                      color: "#d4c5a9",
                      fontStyle: "italic",
                    }}>
                      {quizSelected === currentQ.correct ? currentQ.explanationRight : currentQ.explanationWrong}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (quizIndex + 1 >= totalQs) {
                        setQuizFinished(true);
                      } else {
                        setQuizIndex(i => i + 1);
                        setQuizSelected(null);
                        setQuizRevealed(false);
                      }
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "14px",
                      backgroundColor: "#2a2520",
                      border: "1px solid #4a453d",
                      borderRadius: "3px",
                      color: "#d4c5a9",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "13px",
                      fontWeight: 700,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {quizIndex + 1 >= totalQs ? "See Results" : "Next Question →"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Results */
            <div style={{ animation: "fadeSlideIn 0.5s ease" }}>
              <div style={{
                textAlign: "center",
                padding: "40px 24px",
                backgroundColor: "#1a1815",
                border: "1px solid #2a2520",
                borderRadius: "4px",
                marginBottom: "24px",
              }}>
                <div style={{
                  fontFamily: "'Crimson Pro', serif",
                  fontSize: "48px",
                  fontWeight: 600,
                  color: quizScore >= totalQs * 0.8 ? "#66bb6a" : quizScore >= totalQs * 0.5 ? "#ffa726" : "#ef5350",
                  marginBottom: "8px",
                }}>
                  {quizScore}/{totalQs}
                </div>
                <div style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: "15px",
                  color: "#d4c5a9",
                  lineHeight: "1.7",
                  marginBottom: "16px",
                }}>
                  {quizScore === totalQs
                    ? "Perfect score. You've mastered regularization. The rubber duck is proud."
                    : quizScore >= totalQs * 0.8
                    ? "Excellent work. You understand regularization deeply. A few rough edges to polish."
                    : quizScore >= totalQs * 0.5
                    ? "Decent foundation, but some concepts need reinforcing. Consider replaying the story for the passages you missed."
                    : "The model is still overfitting your understanding. Time to go back to the whiteboard."
                  }
                </div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "12px",
                  color: "#6a6050",
                }}>
                  {quizAnswers.filter(a => a.correct).length} correct · {quizAnswers.filter(a => !a.correct).length} incorrect
                </div>
              </div>

              {/* Review missed questions */}
              {quizAnswers.some(a => !a.correct) && (
                <div style={{ marginBottom: "24px" }}>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "#6a6050",
                    marginBottom: "12px",
                  }}>
                    Review — Questions You Missed
                  </div>
                  {quizAnswers.filter(a => !a.correct).map((a, i) => {
                    const q = shuffledQuiz[a.questionIndex];
                    return (
                      <div key={i} style={{
                        padding: "16px 20px",
                        marginBottom: "8px",
                        backgroundColor: "#1e1b17",
                        border: "1px solid #2a2520",
                        borderRadius: "4px",
                      }}>
                        <div style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "13px",
                          color: "#b8a888",
                          marginBottom: "8px",
                          lineHeight: "1.5",
                        }}>
                          {q.question}
                        </div>
                        <div style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "12px",
                          color: "#ef5350",
                          marginBottom: "4px",
                        }}>
                          Your answer: {q.options[a.selected]}
                        </div>
                        <div style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "12px",
                          color: "#66bb6a",
                          marginBottom: "8px",
                        }}>
                          Correct answer: {q.options[q.correct]}
                        </div>
                        <div style={{
                          fontFamily: "'Libre Baskerville', serif",
                          fontSize: "12px",
                          color: "#8a7e6a",
                          fontStyle: "italic",
                          lineHeight: "1.6",
                        }}>
                          {q.explanationWrong}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button
                  onClick={() => {
                    const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
                    setShuffledQuiz(shuffled);
                    setQuizIndex(0);
                    setQuizSelected(null);
                    setQuizRevealed(false);
                    setQuizScore(0);
                    setQuizAnswers([]);
                    setQuizFinished(false);
                  }}
                  style={{
                    padding: "14px",
                    backgroundColor: "#2a2520",
                    border: "1px solid #4a453d",
                    borderRadius: "3px",
                    color: "#d4c5a9",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Retake Quiz
                </button>
                <button
                  onClick={() => {
                    setPhase("game");
                    setScene("summary");
                    setRevealedPassages([]);
                    setShowChoices(false);
                    setAnimatingIdx(0);
                    setCheckResult(null);
                  }}
                  style={{
                    padding: "14px",
                    backgroundColor: "#1a1815",
                    border: "1px solid #2a2520",
                    borderRadius: "3px",
                    color: "#8a7e6a",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Back to Summary
                </button>
                <button
                  onClick={() => {
                    setPhase("chargen");
                    setStats({ ...INITIAL_STATS });
                    setPool(POINT_POOL);
                    setScene("intro");
                    setPassageIndex(0);
                    setRevealedPassages([]);
                    setShowChoices(false);
                    setCheckResult(null);
                    setVisitedScenes(new Set());
                    setAnimatingIdx(0);
                  }}
                  style={{
                    padding: "14px",
                    backgroundColor: "#1a1815",
                    border: "1px solid #2a2520",
                    borderRadius: "3px",
                    color: "#6a6050",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Play Story Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Game Phase ───
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#141210",
      color: "#d4c5a9",
      fontFamily: "'Libre Baskerville', 'Georgia', serif",
      display: "flex",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;700&family=Crimson+Pro:wght@200;400;600&display=swap');
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1a1815; }
        ::-webkit-scrollbar-thumb { background: #4a453d; border-radius: 3px; }
      `}</style>

      {/* Sidebar - Skills */}
      <div style={{
        width: "220px",
        flexShrink: 0,
        backgroundColor: "#1a1815",
        borderRight: "1px solid #2a2520",
        padding: "24px 16px",
        overflowY: "auto",
      }}>
        <div style={{
          fontFamily: "'Crimson Pro', serif",
          fontSize: "10px",
          fontWeight: 200,
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "#6a6050",
          marginBottom: "4px",
        }}>
          YOUR SKILLS
        </div>
        <div style={{
          fontFamily: "'Crimson Pro', serif",
          fontSize: "18px",
          fontWeight: 600,
          color: "#e8dcc8",
          marginBottom: "24px",
          letterSpacing: "0.5px",
        }}>
          ANALYST
        </div>

        {Object.entries(SKILLS).map(([key, skill]) => (
          <div key={key} style={{ marginBottom: "12px" }}>
            <StatBar skill={skill.name} value={stats[key]} color={skill.color} />
          </div>
        ))}

        <div style={{
          marginTop: "32px",
          padding: "12px",
          backgroundColor: "#141210",
          borderRadius: "3px",
          border: "1px solid #2a252044",
        }}>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#6a6050",
            marginBottom: "6px",
          }}>HOW IT WORKS</div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "11px",
            color: "#8a7e6a",
            lineHeight: "1.5",
          }}>
            Skill checks roll 2d6 + your skill vs. the difficulty. Higher skills = better odds. Failed checks reveal different story paths.
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        maxHeight: "100vh",
      }}>
        {/* Scene header */}
        <div style={{
          padding: "16px 40px",
          borderBottom: "1px solid #2a2520",
          backgroundColor: "#1a1815",
        }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "#6a6050",
          }}>
            PENALTY CITY
          </span>
          <span style={{ color: "#3a3530", margin: "0 12px" }}>·</span>
          <span style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: "13px",
            color: "#8a7e6a",
            fontStyle: "italic",
          }}>
            {currentScene?.id?.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Passages */}
        <div
          ref={scrollRef}
          onClick={skipAnimation}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "40px 40px 20px",
            maxWidth: "720px",
            cursor: animatingIdx < effectivePassages.length ? "pointer" : "default",
          }}
        >
          {checkResult !== null && (
            <CheckResult passed={checkResult.passed} skillName={checkResult.skill} />
          )}

          {revealedPassages.map((p, i) => (
            <Passage
              key={`${scene}-${i}`}
              passage={p}
              animate={i === revealedPassages.length - 1 && animatingIdx <= effectivePassages.length}
              onComplete={handlePassageComplete}
            />
          ))}

          {!showChoices && animatingIdx > 0 && animatingIdx <= effectivePassages.length && (
            <div style={{
              fontSize: "11px",
              color: "#4a453d",
              fontFamily: "'DM Sans', sans-serif",
              animation: "pulse 1.5s ease infinite",
              marginTop: "8px",
            }}>
              Click to advance...
            </div>
          )}

          {/* Choices */}
          {showChoices && (
            <div style={{ marginTop: "24px", paddingBottom: "40px" }}>
              <div style={{
                width: "40px",
                height: "1px",
                backgroundColor: "#4a453d",
                marginBottom: "20px",
              }} />
              {getVisibleChoices().map((choice, i) => (
                <ChoiceButton
                  key={i}
                  choice={choice}
                  stats={stats}
                  onClick={() => handleChoice(choice)}
                  visible={showChoices}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const questions = [
  {
    id: 1,
    question: "Bob spent $24 on a t-shirt. If Jack bought the same t-shirt at $3 cheaper during the March 3rd sale, how much did Jack pay?",
    hint: "Try creating two rectangles to represent the costs. One rectangle should be $3 less than the other.",
    correctAnswer: "$21",
    difficulty: "easy",
    modelingType: "comparison"
  },
  {
    id: 2,
    question: "Anna has 45 marbles. She has 15 more marbles than Ben. How many marbles does Ben have?",
    hint: "Create rectangles to show Anna's marbles and how they compare to Ben's.",
    correctAnswer: "30 marbles",
    difficulty: "easy",
    modelingType: "comparison"
  },
  {
    id: 3,
    question: "A rectangular garden is 12 meters long and 8 meters wide. What is the garden's area?",
    hint: "Draw a rectangle with the given dimensions and use the area formula.",
    correctAnswer: "96 square meters",
    difficulty: "easy",
    modelingType: "area"
  },
  {
    id: 4,
    question: "Sarah has 72 candies. If she wants to distribute them equally among 9 friends, how many candies will each friend receive?",
    hint: "Model this as a division problem using equal-sized parts.",
    correctAnswer: "8 candies per friend",
    difficulty: "medium",
    modelingType: "division"
  },
  {
    id: 5,
    question: "A shop owner bought 15 shirts for $12 each and sold all of them for $20 each. What was the total profit?",
    hint: "Create rectangles to represent cost and selling price, then find the difference multiplied by quantity.",
    correctAnswer: "$120",
    difficulty: "medium",
    modelingType: "profit"
  },
  {
    id: 6,
    question: "James reads 24 pages of a book each day. The book has 168 pages. How many days will it take him to finish the book?",
    hint: "Model this as equal groups representing each day of reading.",
    correctAnswer: "7 days",
    difficulty: "medium",
    modelingType: "division"
  },
  {
    id: 7,
    question: "A rectangular pool is 15 meters long and 10 meters wide. The owner wants to place tiles around the edge of the pool. If each tile is 1 meter long, how many tiles are needed?",
    hint: "Calculate the perimeter of the rectangle.",
    correctAnswer: "50 tiles",
    difficulty: "medium",
    modelingType: "perimeter"
  },
  {
    id: 8,
    question: "Emma's age is 4 times her daughter's age. If Emma is 36 years old, how old is her daughter?",
    hint: "Create a model showing the relationship between Emma's age and her daughter's age.",
    correctAnswer: "9 years old",
    difficulty: "medium",
    modelingType: "ratio"
  },
  {
    id: 9,
    question: "A farmer has 126 animals on his farm. If 2/3 of the animals are chickens and the rest are cows, how many cows does the farmer have?",
    hint: "Create a model where you divide the total into 3 equal parts, with 2 parts for chickens.",
    correctAnswer: "42 cows",
    difficulty: "hard",
    modelingType: "fractions"
  },
  {
    id: 10,
    question: "A construction company needs to build a wall that is 240 feet long. If 5 workers can build 40 feet of wall per day, how many days will it take for all 5 workers to complete the entire wall?",
    hint: "Model this as division, with the total length divided by the daily work rate.",
    correctAnswer: "6 days",
    difficulty: "hard",
    modelingType: "rate"
  }
];

export default questions;
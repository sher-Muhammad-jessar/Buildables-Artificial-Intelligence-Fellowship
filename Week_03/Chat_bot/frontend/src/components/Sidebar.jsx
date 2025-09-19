import React from "react";

/**
 Sidebar with quick topics. clicking a topic calls onQuickAsk(topic prompt)
*/
export default function Sidebar({ onQuickAsk = () => {} }) {
  const topics = [
    { t: "Arrays", q: "Explain arrays and give examples and typical problems." },
    { t: "Linked Lists", q: "Explain singly linked list and basic operations with code." },
    { t: "Binary Trees", q: "Explain binary tree traversals (inorder, preorder, postorder)." },
    { t: "Graphs", q: "Difference between BFS and DFS and typical use cases." },
    { t: "Dynamic Programming", q: "Explain dynamic programming with a sample problem (knapsack)." }
  ];

  return (
    <aside className="sidebar">
      <h3>Quick Topics</h3>
      <ul className="topic-list">
        {topics.map((item) => (
          <li key={item.t}>
            <button className="topic-btn" onClick={() => onQuickAsk(item.q)}>
              {item.t}
            </button>
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <small>Tip: paste a code snippet to ask about its complexity.</small>
      </div>
    </aside>
  );
}

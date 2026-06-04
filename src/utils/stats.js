import { getLogs } from "./storage.js";

// 8 radar axes and which LeetCode topic tags map to each
export const RADAR_GROUPS = {
  "Data Structures": ["Array", "Hash Table", "Matrix", "Linked List", "Doubly-Linked List", "Stack", "Queue", "Monotonic Stack", "Monotonic Queue"],
  "Trees & Heaps": ["Tree", "Binary Tree", "Binary Search Tree", "Heap (Priority Queue)", "Segment Tree", "Binary Indexed Tree", "Trie", "Ordered Set"],
  "Graphs": ["Graph Theory", "Depth-First Search", "Breadth-First Search", "Topological Sort", "Shortest Path", "Union-Find", "Minimum Spanning Tree", "Strongly Connected Component", "Eulerian Circuit", "Biconnected Component"],
  "DP & Backtracking": ["Dynamic Programming", "Memoization", "Divide and Conquer", "Backtracking", "Recursion", "Enumeration"],
  "Math & Logic": ["Math", "Number Theory", "Combinatorics", "Probability and Statistics", "Geometry", "Game Theory", "Bit Manipulation", "Bitmask", "Randomized", "Reservoir Sampling", "Rejection Sampling", "Brainteaser"],
  "Search & Pointers": ["Binary Search", "Two Pointers", "Sliding Window", "Prefix Sum", "Sweep Line"],
  "Sorting & Greedy": ["Greedy", "Sorting", "Counting Sort", "Bucket Sort", "Radix Sort", "Merge Sort", "Quickselect", "Counting"],
  "String & Misc": ["String", "String Matching", "Rolling Hash", "Hash Function", "Suffix Array", "Simulation", "Design", "Interactive", "Data Stream", "Iterator", "Concurrency", "Database", "Shell"]
};

// reverse map: LeetCode tag name -> radar axis
export const TAG_TO_AXIS = Object.fromEntries(
  Object.entries(RADAR_GROUPS).flatMap(([axis, tags]) => tags.map(t => [t, axis]))
);

function getXP(difficulty, confidence) {
  const base = difficulty === "Hard" ? 30 : difficulty === "Medium" ? 20 : 10;
  const mult = confidence === 3 ? 1.5 : confidence === 1 ? 0.5 : 1.0;
  return base * mult;
}

export function computeRadarStats() {
  const logs = getLogs();
  const axisMap = {};
  for (const entry of logs) {
    const conf = entry.confidence ?? 2;
    const diff = entry.difficulty || "Easy";
    const xp = getXP(diff, conf);
    const selectedTags = entry.selectedTags || [];
    const axes = [...new Set(selectedTags.map(t => TAG_TO_AXIS[t]).filter(Boolean))];
    for (const axis of axes) {
      if (!axisMap[axis]) axisMap[axis] = 0;
      axisMap[axis] += xp;
    }
  }
  return Object.keys(RADAR_GROUPS).map(axis => {
    return { name: axis, score: axisMap[axis] || 0 };
  });
}

// Score per topic is now total XP
export function computeTopicStats() {
  const logs = getLogs();
  const map = {}; // topic -> { xp, count, e, m, h, sumConf }

  for (const entry of logs) {
    const conf = entry.confidence ?? 2;
    const diff = entry.difficulty || "Easy";
    const xp = getXP(diff, conf);
    const tagsToUse = entry.selectedTags || [];
    
    for (const tag of tagsToUse) {
      if (!map[tag]) map[tag] = { xp: 0, count: 0, e: 0, m: 0, h: 0, sumConf: 0 };
      map[tag].xp += xp;
      map[tag].count += 1;
      map[tag].sumConf += conf;
      if (diff === "Easy") map[tag].e++;
      else if (diff === "Medium") map[tag].m++;
      else if (diff === "Hard") map[tag].h++;
    }
  }

  const topics = Object.entries(map).map(([name, data]) => {
    const avgConf = data.sumConf / data.count; // 1-3
    return { 
      name, 
      count: data.count, 
      avgConf, 
      score: data.xp, 
      e: data.e, 
      m: data.m, 
      h: data.h 
    };
  });

  topics.sort((a, b) => b.score - a.score);
  return topics;
}

export function computeDifficultyBreakdown() {
  const logs = getLogs();
  const counts = { Easy: 0, Medium: 0, Hard: 0 };
  for (const e of logs) if (e.difficulty in counts) counts[e.difficulty]++;
  return counts;
}

export function computeConfidenceBreakdown() {
  const logs = getLogs();
  const counts = { 1: 0, 2: 0, 3: 0 };
  for (const e of logs) {
    const c = e.confidence ?? 2;
    counts[c] = (counts[c] || 0) + 1;
  }
  return counts;
}

export function computeMistakeStats() {
  const logs = getLogs();
  const counts = {};
  for (const e of logs) {
    if (e.mistakeTags && Array.isArray(e.mistakeTags)) {
      for (const m of e.mistakeTags) {
        counts[m] = (counts[m] || 0) + 1;
      }
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

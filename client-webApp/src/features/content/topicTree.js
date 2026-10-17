// Helpers over the flat topic list returned by the API.

export function childrenByParent(topics) {
  const map = new Map();
  for (const topic of topics) {
    const key = topic.parentTopicId ?? null;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(topic);
  }
  return map;
}

export function countDescendants(topics, topicId) {
  const children = childrenByParent(topics);
  let count = 0;
  const queue = [...(children.get(topicId) || [])];
  while (queue.length) {
    const next = queue.shift();
    count += 1;
    queue.push(...(children.get(next.id) || []));
  }
  return count;
}

// The topic itself plus every topic beneath it, at any depth.
export function subtreeTopicIds(topics, topicId) {
  const children = childrenByParent(topics);
  const ids = [topicId];
  const queue = [...(children.get(topicId) || [])];
  while (queue.length) {
    const next = queue.shift();
    ids.push(next.id);
    queue.push(...(children.get(next.id) || []));
  }
  return ids;
}

export function ancestorIds(topics, topicId) {
  const byId = new Map(topics.map((t) => [t.id, t]));
  const ids = [];
  let current = byId.get(topicId);
  while (current?.parentTopicId) {
    ids.push(current.parentTopicId);
    current = byId.get(current.parentTopicId);
  }
  return ids;
}

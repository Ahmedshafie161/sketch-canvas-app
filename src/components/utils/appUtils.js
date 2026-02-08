// Utility functions for App.jsx and handlers
export function getAllSubfolders(folders, parentId) {
  const subfolders = folders.filter(f => f.parentId === parentId).map(f => f.id);
  const allSubfolders = [...subfolders];
  subfolders.forEach(id => {
    allSubfolders.push(...getAllSubfolders(folders, id));
  });
  return allSubfolders;
}

export function isChildFolder(folders, parentId, childId) {
  if (!parentId) return false;
  const parent = folders.find(f => f.id === parentId);
  if (!parent) return false;
  if (parent.parentId === childId) return true;
  return isChildFolder(folders, parent.parentId, childId);
}

// Add more utility functions as needed

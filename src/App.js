import React, { useState } from "react";

// Initial JSON data with clear folder/file distinction
const initialData = {
  Documents: ["Document1.jpg", "Document2.jpg", "Document3.jpg"],
  Desktop: ["Screenshot1.jpg", "videopal.mp4"],
  Downloads: {
    Drivers: ["Printerdriver.dmg", "cameradriver.dmg"],
    Images: [],
  },
  Applications: [
    "Webstorm.dmg",
    "Pycharm.dmg",
    "FileZilla.dmg",
    "Mattermost.dmg",
  ],
  "chromedriver.dmg": null, // File with null value
};

// Folder component
const Folder = ({
  name,
  content,
  depth,
  path,
  updateFolder,
  deleteItem,
  editItem,
  addFile,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleEdit = () => {
    const newName = prompt(`Enter new name for ${name}:`, name);
    if (newName && newName !== name) {
      editItem(path, name, newName);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteItem(path, name);
    }
  };

  const handleAddFile = () => {
    const newFileName = prompt("Enter file name:");
    if (newFileName) {
      addFile(path, newFileName);
    }
  };

  if (content === null || typeof content === "string") {
    // It's a file
    return (
      <div style={{ marginLeft: depth * 20 + "px" }}>
        📄 {name}
        <button onClick={handleEdit} style={{ marginLeft: "10px" }}>
          Edit
        </button>
        <button onClick={handleDelete} style={{ marginLeft: "10px" }}>
          Delete
        </button>
      </div>
    );
  }

  // It's a folder
  return (
    <div style={{ marginLeft: depth * 20 + "px" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span onClick={() => setIsOpen(!isOpen)} style={{ cursor: "pointer" }}>
          📁 {name} {isOpen ? "▼" : "▶"}
        </span>
        <button onClick={handleEdit} style={{ marginLeft: "10px" }}>
          Edit
        </button>
        <button onClick={handleDelete} style={{ marginLeft: "10px" }}>
          Delete
        </button>
      </div>
      {isOpen && (
        <>
          <button
            onClick={() => {
              const newFolderName = prompt("Enter new folder name:");
              if (newFolderName) {
                updateFolder(path, newFolderName);
              }
            }}
            style={{ marginLeft: depth * 20 + "px", marginTop: 5 }}
          >
            + New Folder
          </button>
          <button
            onClick={handleAddFile}
            style={{ marginLeft: depth * 20 + "px", marginTop: 5 }}
          >
            + Add File
          </button>
          {Array.isArray(content)
            ? content.map((file, index) => (
                <div
                  key={index}
                  style={{ marginLeft: (depth + 1) * 20 + "px" }}
                >
                  📄 {file}
                  <button
                    onClick={() =>
                      editItem(path, file, prompt("Edit file name:", file))
                    }
                    style={{ marginLeft: "10px" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(path, file)}
                    style={{ marginLeft: "10px" }}
                  >
                    Delete
                  </button>
                </div>
              ))
            : Object.entries(content).map(([folderName, folderContent]) => (
                <Folder
                  key={folderName}
                  name={folderName}
                  content={folderContent}
                  depth={depth + 1}
                  path={`${path}/${folderName}`}
                  updateFolder={updateFolder}
                  deleteItem={deleteItem}
                  editItem={editItem} // Ensure editItem is passed
                  addFile={addFile} // Pass addFile for nested folders
                />
              ))}
        </>
      )}
    </div>
  );
};

// Main App
const App = () => {
  const [folderStructure, setFolderStructure] = useState(initialData);

  const updateFolder = (path, newFolderName) => {
    const pathArray = path.split("/").filter(Boolean);

    const addFolderRecursive = (structure, pathArray, newFolderName) => {
      if (pathArray.length === 0) {
        return {
          ...structure,
          [newFolderName]: [], // Create new folder
        };
      }

      const currentFolder = pathArray[0];
      return {
        ...structure,
        [currentFolder]: addFolderRecursive(
          structure[currentFolder],
          pathArray.slice(1),
          newFolderName
        ),
      };
    };

    setFolderStructure((prevStructure) =>
      addFolderRecursive(prevStructure, pathArray, newFolderName)
    );
  };

  const deleteItem = (path, name) => {
    const pathArray = path.split("/").filter(Boolean);

    const deleteRecursive = (structure, pathArray) => {
      if (pathArray.length === 1) {
        const keyToDelete = pathArray[0];
        if (Array.isArray(structure[keyToDelete])) {
          return {
            ...structure,
            [keyToDelete]: structure[keyToDelete].filter(
              (file) => file !== name
            ),
          };
        }
        const updatedStructure = { ...structure };
        delete updatedStructure[keyToDelete];
        return updatedStructure;
      }

      const currentFolder = pathArray[0];
      if (structure[currentFolder]) {
        return {
          ...structure,
          [currentFolder]: deleteRecursive(
            structure[currentFolder],
            pathArray.slice(1)
          ),
        };
      }

      return structure;
    };

    setFolderStructure((prevStructure) =>
      deleteRecursive({ ...prevStructure }, pathArray)
    );
  };

  const editItem = (path, oldName, newName) => {
    if (!newName || newName.trim() === "") return; // Prevent empty names
    const pathArray = path.split("/").filter(Boolean);

    const editRecursive = (structure, pathArray) => {
      if (pathArray.length === 0) {
        if (structure[oldName] !== undefined) {
          // Rename folder
          const updatedStructure = { ...structure };
          updatedStructure[newName] = updatedStructure[oldName]; // Copy old folder content
          delete updatedStructure[oldName]; // Delete old folder
          return updatedStructure;
        } else if (Array.isArray(structure)) {
          // Rename file
          return structure.map((file) => (file === oldName ? newName : file));
        }
      }

      const currentFolder = pathArray[0];
      if (structure[currentFolder]) {
        return {
          ...structure,
          [currentFolder]: editRecursive(
            structure[currentFolder],
            pathArray.slice(1)
          ),
        };
      }
      return structure;
    };

    setFolderStructure((prevStructure) =>
      editRecursive({ ...prevStructure }, pathArray)
    );
  };

  const addFile = (path, fileName) => {
    if (!fileName || fileName.trim() === "") return;
    const pathArray = path.split("/").filter(Boolean);

    const addFileRecursive = (structure, pathArray, fileName) => {
      if (pathArray.length === 0) {
        if (Array.isArray(structure)) {
          return [...structure, fileName]; // Add the file to the folder
        }
      }

      const currentFolder = pathArray[0];
      return {
        ...structure,
        [currentFolder]: addFileRecursive(
          structure[currentFolder],
          pathArray.slice(1),
          fileName
        ),
      };
    };

    setFolderStructure((prevStructure) =>
      addFileRecursive({ ...prevStructure }, pathArray, fileName)
    );
  };

  return (
    <div>
      <h1>Folder Structure</h1>
      <button
        onClick={() => {
          const rootFolderName = prompt("Enter root folder name:");
          if (rootFolderName) {
            setFolderStructure((prevStructure) => ({
              ...prevStructure,
              [rootFolderName]: [],
            }));
          }
        }}
      >
        + New Root Folder
      </button>
      {Object.entries(folderStructure).map(([folderName, content]) => (
        <Folder
          key={folderName}
          name={folderName}
          content={content}
          depth={0}
          path={folderName}
          updateFolder={updateFolder}
          deleteItem={deleteItem}
          editItem={editItem} // Pass editItem here
          addFile={addFile} // Pass addFile here
        />
      ))}
    </div>
  );
};

export default App;
